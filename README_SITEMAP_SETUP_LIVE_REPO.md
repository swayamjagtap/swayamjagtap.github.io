# Sitemap automation for swayamjagtap.github.io

This setup belongs in the **local clone of the live website repository**:

`C:\Users\swaya\OneDrive\Desktop\swayamjagtap.github.io`

Do not install it in the disconnected experimental copy or in the F1 backend repository.

## Files in this setup

- `scripts/generate_sitemap.py` — discovers eligible HTML pages and writes `sitemap.xml`.
- `.githooks/pre-commit` — regenerates the sitemap before each local commit and stages the updated XML.
- `.github/workflows/sitemap-check.yml` — checks on GitHub whether the committed sitemap matches eligible HTML pages.
- `robots.txt` — tells crawlers where the sitemap is located.

## One-time setup on Windows PowerShell

Open PowerShell or the VS Code terminal at the root of the live local clone and run:

```powershell
git config core.hooksPath .githooks
```

That is the only one-time Git configuration needed on this Windows clone. The `chmod +x` instruction applies to Git Bash/macOS/Linux environments; do not run it in PowerShell.

## Generate and inspect the first sitemap

Run:

```powershell
py -3 scripts/generate_sitemap.py
```

If `py -3` is unavailable but `python` works, use:

```powershell
python scripts/generate_sitemap.py
```

Open `sitemap.xml` and check that the homepage, top-level pages, blog posts, project pages and other intended public HTML pages are listed. The script excludes common non-content folders, `404.html`, Google verification HTML files, and HTML pages marked `noindex`.

## Normal workflow

1. Create or edit an HTML page.
2. Stage the page with `git add`.
3. Commit normally.
4. The pre-commit hook regenerates and stages `sitemap.xml` automatically.
5. Push to `main`; GitHub Pages deploys using the existing publishing setup.

The GitHub Actions workflow is a validation safeguard. It checks the sitemap on pushes/PRs that touch relevant files; it does not replace the local hook or modify the Pages deployment workflow. Direct edits made through GitHub's website do not run your local hook, so the validation workflow will flag a stale sitemap.

## Notes

- The generator uses the staged Git index so the sitemap matches the files included in the commit.
- It intentionally omits `lastmod`, `changefreq` and `priority` because the generator cannot reliably determine significant content-change dates. Google ignores `changefreq` and `priority` and may use accurate `lastmod` values.
- A sitemap helps search engines discover URLs; it does not guarantee indexing.
- Submit `https://swayamjagtap.github.io/sitemap.xml` once in Google Search Console if it has not already been submitted. It does not need to be resubmitted after every update.
