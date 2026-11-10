#!/usr/bin/env python3
"""Generate a sitemap for swayamjagtap.github.io from the staged Git tree.

By default, tracked/staged HTML files are read from Git's index so the sitemap
matches the exact files that will be included in the next commit. If run
outside a Git repository, the script falls back to scanning the working tree.
"""

from __future__ import annotations

import argparse
import subprocess
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote, urljoin, urlsplit, urlunsplit

BASE_URL = "https://swayamjagtap.github.io"
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "sitemap.xml"

EXCLUDED_DIRS = {
    ".git",
    ".github",
    ".githooks",
    ".vscode",
    "__pycache__",
    "node_modules",
    ".venv",
    "venv",
    "dist",
    "build",
    "_site",
    "scripts",
    "emp",
}
EXCLUDED_FILES = {"404.html"}


class PageMetadataParser(HTMLParser):
    """Extract canonical URL and noindex directives from an HTML document."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.canonical: str | None = None
        self.noindex = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key.lower(): (value or "") for key, value in attrs}

        if tag.lower() == "link":
            rel_tokens = values.get("rel", "").lower().split()
            href = values.get("href", "").strip()
            if "canonical" in rel_tokens and href and self.canonical is None:
                self.canonical = href

        if tag.lower() == "meta":
            name = values.get("name", "").strip().lower()
            content_tokens = {
                token.strip().lower()
                for token in values.get("content", "").split(",")
            }
            if name in {"robots", "googlebot"} and "noindex" in content_tokens:
                self.noindex = True


def git_output(args: list[str]) -> bytes | None:
    try:
        result = subprocess.run(
            ["git", *args],
            cwd=ROOT,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
        )
        return result.stdout
    except (FileNotFoundError, subprocess.CalledProcessError):
        return None


def staged_html_paths() -> list[str] | None:
    """Return HTML paths in Git's index; None means Git is unavailable."""
    output = git_output(["ls-files", "--cached", "-z"])
    if output is None:
        return None

    paths = [entry.decode("utf-8", errors="surrogateescape") for entry in output.split(b"\0") if entry]
    return [path for path in paths if path.lower().endswith((".html", ".htm"))]


def read_staged_file(relative_path: str) -> bytes | None:
    """Read a file from the Git index, not an unstaged working-tree edit."""
    output = git_output(["show", f":{relative_path}"])
    if output is not None:
        return output

    # If Git is unavailable, use the working-tree file instead.
    file_path = ROOT / relative_path
    try:
        return file_path.read_bytes()
    except OSError:
        return None


def is_excluded_path(relative_path: str) -> bool:
    path = Path(relative_path)
    parts = {part.lower() for part in path.parts}
    filename = path.name.lower()

    if parts.intersection(EXCLUDED_DIRS):
        return True
    if filename in EXCLUDED_FILES:
        return True
    # Google Search Console's verification HTML is not a content page.
    if filename.startswith("google") and filename.endswith(".html"):
        return True
    return False


def path_to_url(relative_path: str, canonical: str | None) -> str | None:
    if canonical:
        candidate = urljoin(BASE_URL + "/", canonical)
    else:
        path = Path(relative_path).as_posix()
        if path == "index.html":
            url_path = "/"
        elif path.endswith("/index.html"):
            url_path = "/" + path[: -len("index.html")]
        else:
            url_path = "/" + path
        candidate = urljoin(BASE_URL, quote(url_path, safe="/-._~:@!$&'()*+,;=%"))

    parts = urlsplit(candidate)
    if parts.scheme not in {"http", "https"}:
        return None
    if (parts.hostname or "").lower() != "swayamjagtap.github.io":
        return None

    # Normalize to HTTPS, and never include query strings or fragments.
    normalized_path = parts.path or "/"
    return urlunsplit(("https", "swayamjagtap.github.io", normalized_path, "", ""))


def discover_urls() -> list[str]:
    paths = staged_html_paths()
    if paths is None:
        paths = [
            file.relative_to(ROOT).as_posix()
            for file in ROOT.rglob("*.html")
            if file.is_file()
        ]

    urls: set[str] = set()
    for relative_path in paths:
        if is_excluded_path(relative_path):
            continue

        content = read_staged_file(relative_path)
        if content is None:
            continue

        parser = PageMetadataParser()
        try:
            parser.feed(content.decode("utf-8", errors="replace"))
        except Exception as exc:  # Keep one malformed page from breaking the entire sitemap.
            print(f"Warning: couldn't parse {relative_path}: {exc}", file=sys.stderr)
            continue

        if parser.noindex:
            continue

        url = path_to_url(relative_path, parser.canonical)
        if url:
            urls.add(url)

    # Keep the homepage first, then sort the remaining canonical URLs.
    return sorted(urls, key=lambda value: (value != BASE_URL + "/", value))


def build_sitemap(urls: list[str]) -> bytes:
    ET.register_namespace("", SITEMAP_NS)
    root = ET.Element(f"{{{SITEMAP_NS}}}urlset")

    for url in urls:
        url_element = ET.SubElement(root, f"{{{SITEMAP_NS}}}url")
        loc = ET.SubElement(url_element, f"{{{SITEMAP_NS}}}loc")
        loc.text = url

    tree = ET.ElementTree(root)
    ET.indent(tree, space="  ")
    return ET.tostring(root, encoding="utf-8", xml_declaration=True) + b"\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate or validate sitemap.xml")
    parser.add_argument(
        "--check",
        action="store_true",
        help="Check whether sitemap.xml matches the staged/tracked HTML pages without writing it.",
    )
    args = parser.parse_args()

    urls = discover_urls()
    if not urls:
        print("No eligible HTML pages found; refusing to write an empty sitemap.", file=sys.stderr)
        return 1

    generated = build_sitemap(urls)

    if args.check:
        try:
            current = OUTPUT.read_bytes()
        except OSError:
            current = b""
        if current != generated:
            print("sitemap.xml is out of date. Run: python scripts/generate_sitemap.py")
            return 1
        print(f"Sitemap is up to date ({len(urls)} URLs).")
        return 0

    OUTPUT.write_bytes(generated)
    print(f"Generated {OUTPUT.relative_to(ROOT)} with {len(urls)} URLs.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
