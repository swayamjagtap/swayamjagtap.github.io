const API_BASE_URL =
  "https://f1-telemetry-api-r35r.onrender.com";

const WS_URL =
  "wss://f1-telemetry-api-r35r.onrender.com/ws/telemetry";


/* =========================================================
   STATE
   ========================================================= */

const state = {
  year: null,
  event: null,
  session: null,
  lap: null,

  drivers: [],
  selectedDrivers: [],

  availableLaps: [],

  websocket: null,
  isPlaying: false,
};


/* =========================================================
   DOM
   ========================================================= */

const seasonSelect =
  document.getElementById("season-select");

const eventSelect =
  document.getElementById("event-select");

const sessionSelect =
  document.getElementById("session-select");

const lapSelect =
  document.getElementById("lap-select");

const driverList =
  document.getElementById("driver-list");

const playButton =
  document.getElementById("play-button");

const stopButton =
  document.getElementById("stop-button");

const connectionDot =
  document.getElementById("connection-dot");

const connectionStatus =
  document.getElementById("connection-status");

const datasetStatus =
  document.getElementById("dataset-status");

const driverStatus =
  document.getElementById("driver-status");

const playbackLabel =
  document.getElementById("playback-label");

const playbackProgress =
  document.getElementById("playback-progress");

const frameLabel =
  document.getElementById("frame-label");

const progressLabel =
  document.getElementById("progress-label");

const telemetryGrid =
  document.getElementById("telemetry-grid");


/* =========================================================
   API
   ========================================================= */

async function fetchJson(url) {

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status}`
    );
  }

  return response.json();
}


/* =========================================================
   CONNECTION STATE
   ========================================================= */

function setConnectionStatus(
  status,
  type = "idle"
) {

  connectionStatus.textContent = status;

  connectionDot.className = "status-dot";

  if (type === "connected") {
    connectionDot.classList.add("connected");
  }

  if (type === "connecting") {
    connectionDot.classList.add("connecting");
  }

  if (type === "error") {
    connectionDot.classList.add("error");
  }
}


/* =========================================================
   DATASET DISCOVERY
   ========================================================= */

async function loadSeasons() {

  datasetStatus.textContent =
    "Loading seasons...";

  const data = await fetchJson(
    `${API_BASE_URL}/api/seasons`
  );

  seasonSelect.innerHTML =
    `<option value="">Select season</option>`;

  data.seasons.forEach((year) => {

    const option =
      document.createElement("option");

    option.value = year;
    option.textContent = year;

    seasonSelect.appendChild(option);
  });

  datasetStatus.textContent =
    `${data.seasons.length} season(s) available`;
}


async function loadEvents(year) {

  eventSelect.disabled = true;

  eventSelect.innerHTML =
    `<option value="">Loading...</option>`;

  sessionSelect.disabled = true;

  sessionSelect.innerHTML =
    `<option value="">Select event</option>`;

  lapSelect.disabled = true;

  lapSelect.innerHTML =
    `<option value="">Select drivers</option>`;

  clearDrivers();

  const data = await fetchJson(
    `${API_BASE_URL}/api/events?year=${year}`
  );

  eventSelect.innerHTML =
    `<option value="">Select Grand Prix</option>`;

  data.events.forEach((event) => {

    const option =
      document.createElement("option");

    option.value = event.id;
    option.textContent = event.name;

    eventSelect.appendChild(option);
  });

  eventSelect.disabled = false;
}


async function loadSessions(
  year,
  event
) {

  sessionSelect.disabled = true;

  sessionSelect.innerHTML =
    `<option value="">Loading...</option>`;

  lapSelect.disabled = true;

  lapSelect.innerHTML =
    `<option value="">Select drivers</option>`;

  clearDrivers();

  const data = await fetchJson(
    `${API_BASE_URL}/api/sessions?year=${year}&event=${event}`
  );

  sessionSelect.innerHTML =
    `<option value="">Select session</option>`;

  data.sessions.forEach((session) => {

    const option =
      document.createElement("option");

    option.value = session.id;
    option.textContent = session.name;

    sessionSelect.appendChild(option);
  });

  sessionSelect.disabled = false;
}


async function loadDrivers(
  year,
  event,
  session
) {

  driverList.innerHTML = `
    <div class="telemetry-empty-state">
      Loading drivers...
    </div>
  `;

  const data = await fetchJson(
    `${API_BASE_URL}/api/drivers?year=${year}&event=${event}&session=${session}`
  );

  state.drivers = data.drivers;
  state.selectedDrivers = [];
  state.availableLaps = [];
  state.lap = null;

  renderDriverSelection();

  driverStatus.textContent =
    `${data.drivers.length} drivers available`;

  lapSelect.disabled = true;

  lapSelect.innerHTML =
    `<option value="">Select drivers</option>`;

  updateControls();
}


/* =========================================================
   LAP DISCOVERY
   ========================================================= */

async function loadAvailableLaps() {

  if (
    !state.year ||
    !state.event ||
    !state.session ||
    state.selectedDrivers.length === 0
  ) {

    state.availableLaps = [];
    state.lap = null;

    lapSelect.disabled = true;

    lapSelect.innerHTML =
      `<option value="">Select drivers</option>`;

    updateControls();

    return;
  }

  lapSelect.disabled = true;

  lapSelect.innerHTML =
    `<option value="">Loading laps...</option>`;

  const params = new URLSearchParams();

  params.set(
    "year",
    state.year
  );

  params.set(
    "event",
    state.event
  );

  params.set(
    "session",
    state.session
  );

  state.selectedDrivers.forEach(
    (driver) => {
      params.append(
        "drivers",
        driver
      );
    }
  );

  const data = await fetchJson(
    `${API_BASE_URL}/api/laps?${params.toString()}`
  );

  state.availableLaps =
    data.common_laps;

  lapSelect.innerHTML = "";

  if (!state.availableLaps.length) {

    state.lap = null;

    lapSelect.innerHTML =
      `<option value="">No common laps</option>`;

    lapSelect.disabled = true;

    driverStatus.textContent =
      "No common laps for selected drivers";

    updateControls();

    return;
  }

  lapSelect.appendChild(
    createOption(
      "",
      "Select lap"
    )
  );

  state.availableLaps.forEach(
    (lap) => {

      lapSelect.appendChild(
        createOption(
          String(lap),
          `Lap ${lap}`
        )
      );
    }
  );

  /*
   * Default to the latest lap shared by all
   * selected drivers.
   */
  const defaultLap =
    state.availableLaps[
      state.availableLaps.length - 1
    ];

  state.lap =
    defaultLap;

  lapSelect.value =
    String(defaultLap);

  lapSelect.disabled = false;

  updateDriverStatus();

  updateControls();
}


function createOption(
  value,
  label
) {

  const option =
    document.createElement("option");

  option.value = value;
  option.textContent = label;

  return option;
}


/* =========================================================
   DRIVER SELECTION
   ========================================================= */

function renderDriverSelection() {

  driverList.innerHTML = "";

  if (!state.drivers.length) {

    driverList.innerHTML = `
      <div class="telemetry-empty-state">
        No drivers available.
      </div>
    `;

    return;
  }

  state.drivers.forEach((driver) => {

    const button =
      document.createElement("button");

    button.type = "button";

    button.className =
      "driver-select-button";

    button.dataset.driver =
      driver.driver;

    button.innerHTML = `
      <strong>${driver.driver}</strong>
      <span>${driver.team}</span>
    `;

    button.addEventListener(
      "click",
      () => toggleDriver(
        driver.driver,
        button
      )
    );

    driverList.appendChild(button);
  });
}


async function toggleDriver(
  driver,
  button
) {

  const selected =
    state.selectedDrivers.includes(driver);

  if (selected) {

    state.selectedDrivers =
      state.selectedDrivers.filter(
        (item) => item !== driver
      );

    button.classList.remove("selected");

  } else {

    if (state.selectedDrivers.length >= 4) {

      driverStatus.textContent =
        "Maximum 4 drivers";

      return;
    }

    state.selectedDrivers.push(driver);

    button.classList.add("selected");
  }

  updateDriverStatus();

  await loadAvailableLaps();
}


function updateDriverStatus() {

  const count =
    state.selectedDrivers.length;

  if (count === 0) {

    driverStatus.textContent =
      "Select up to 4 drivers";

    return;
  }

  const lapCount =
    state.availableLaps.length;

  driverStatus.textContent =
    `${count} selected · ${lapCount} common lap${lapCount === 1 ? "" : "s"}`;
}


function clearDrivers() {

  state.drivers = [];
  state.selectedDrivers = [];
  state.availableLaps = [];
  state.lap = null;

  driverList.innerHTML = `
    <div class="telemetry-empty-state">
      Select a session to load drivers.
    </div>
  `;

  driverStatus.textContent =
    "Select a session";

  lapSelect.disabled = true;

  lapSelect.innerHTML =
    `<option value="">Select drivers</option>`;

  updateControls();
}


function updateControls() {

  playButton.disabled =
    !state.year ||
    !state.event ||
    !state.session ||
    !state.lap ||
    state.selectedDrivers.length === 0 ||
    state.isPlaying;

  stopButton.disabled =
    !state.isPlaying;
}


/* =========================================================
   TELEMETRY CARDS
   ========================================================= */

function renderTelemetryCards(
  playbackDrivers
) {

  telemetryGrid.innerHTML = "";

  if (!playbackDrivers.length) {

    telemetryGrid.innerHTML = `
      <div class="bento-card telemetry-empty-state">
        No telemetry drivers returned.
      </div>
    `;

    return;
  }

  playbackDrivers.forEach((driverCode) => {

    const driverInfo =
      getDriverInfo(driverCode);

    const card =
      document.createElement("div");

    card.className =
      "bento-card telemetry-driver-card";

    card.dataset.driver =
      driverCode;

    card.innerHTML = `
      <div class="telemetry-driver-heading">

        <div>

          <span class="telemetry-driver-code">
            ${driverCode}
          </span>

          <h3>
            ${driverInfo?.driver_number ?? "--"}
          </h3>

          <p>
            ${driverInfo?.team ?? "Unknown team"}
          </p>

        </div>

        <span class="telemetry-live-badge">
          LIVE
        </span>

      </div>

      <div class="telemetry-metric-grid">

        <div class="telemetry-metric">
          <span>Speed</span>
          <strong data-metric="speed">--</strong>
          <small>km/h</small>
        </div>

        <div class="telemetry-metric">
          <span>RPM</span>
          <strong data-metric="rpm">--</strong>
          <small>rpm</small>
        </div>

        <div class="telemetry-metric">
          <span>Gear</span>
          <strong data-metric="gear">--</strong>
          <small>gear</small>
        </div>

        <div class="telemetry-metric">
          <span>Throttle</span>
          <strong data-metric="throttle">--</strong>
          <small>%</small>
        </div>

        <div class="telemetry-metric">
          <span>Brake</span>
          <strong data-metric="brake">--</strong>
          <small>state</small>
        </div>

        <div class="telemetry-metric">
          <span>DRS</span>
          <strong data-metric="drs">--</strong>
          <small>state</small>
        </div>

      </div>
    `;

    telemetryGrid.appendChild(card);
  });
}


function getDriverInfo(
  driverCode
) {

  return state.drivers.find(
    (driver) => driver.driver === driverCode
  );
}


function updateTelemetryCards(
  drivers
) {

  drivers.forEach((driver) => {

    const card =
      telemetryGrid.querySelector(
        `[data-driver="${driver.driver}"]`
      );

    if (!card) {
      return;
    }

    setMetric(
      card,
      "speed",
      formatNumber(driver.speed, 1)
    );

    setMetric(
      card,
      "rpm",
      formatNumber(driver.rpm, 0)
    );

    setMetric(
      card,
      "gear",
      driver.gear ?? "--"
    );

    setMetric(
      card,
      "throttle",
      formatNumber(driver.throttle, 1)
    );

    setMetric(
      card,
      "brake",
      driver.brake
        ? "ON"
        : "OFF"
    );

    setMetric(
      card,
      "drs",
      driver.drs ?? "--"
    );
  });
}


function setMetric(
  card,
  metric,
  value
) {

  const element =
    card.querySelector(
      `[data-metric="${metric}"]`
    );

  if (element) {
    element.textContent = value;
  }
}


function formatNumber(
  value,
  decimals
) {

  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "--";
  }

  return Number(value).toFixed(decimals);
}


/* =========================================================
   WEBSOCKET
   ========================================================= */

function connectWebSocket() {

  closeWebSocket();

  state.isPlaying = true;

  updateControls();

  setConnectionStatus(
    "Connecting...",
    "connecting"
  );

  playbackLabel.textContent =
    "Connecting...";

  playbackProgress.style.width =
    "0%";

  frameLabel.textContent =
    "Frame 0";

  progressLabel.textContent =
    "0%";

  state.websocket =
    new WebSocket(WS_URL);


  state.websocket.addEventListener(
    "open",
    () => {

      setConnectionStatus(
        "Connected",
        "connected"
      );

      state.websocket.send(
        JSON.stringify({
          year: Number(state.year),
          event: state.event,
          session: state.session,
          lap: Number(state.lap),
          drivers:
            state.selectedDrivers,
          frames: 500,
          fps: 20
        })
      );
    }
  );


  state.websocket.addEventListener(
    "message",
    (event) => {

      let data;

      try {
        data =
          JSON.parse(event.data);
      } catch (error) {

        console.error(
          "Invalid WebSocket message",
          error
        );

        return;
      }

      handleWebSocketMessage(data);
    }
  );


  state.websocket.addEventListener(
    "error",
    () => {

      setConnectionStatus(
        "Connection error",
        "error"
      );

      playbackLabel.textContent =
        "Connection error";
    }
  );


  state.websocket.addEventListener(
    "close",
    () => {

      state.isPlaying = false;

      updateControls();

      if (
        connectionStatus.textContent !==
        "Connection error"
      ) {

        setConnectionStatus(
          "Disconnected",
          "idle"
        );
      }
    }
  );
}


function handleWebSocketMessage(
  data
) {

  if (data.type === "ready") {

    playbackLabel.textContent =
      `${data.event} · ${data.session} · Lap ${data.lap}`;

    renderTelemetryCards(
      data.drivers
    );

    return;
  }


  if (data.type === "frame") {

    updateTelemetryCards(
      data.drivers
    );

    const progress =
      Number(data.progress ?? 0);

    playbackProgress.style.width =
      `${progress * 100}%`;

    progressLabel.textContent =
      `${Math.round(progress * 100)}%`;

    frameLabel.textContent =
      `Frame ${data.frame}`;

    return;
  }


  if (data.type === "complete") {

    playbackLabel.textContent =
      "Playback complete";

    playbackProgress.style.width =
      "100%";

    progressLabel.textContent =
      "100%";

    state.isPlaying = false;

    updateControls();

    return;
  }


  if (data.type === "error") {

    playbackLabel.textContent =
      "Playback error";

    setConnectionStatus(
      data.message ||
      "Playback error",
      "error"
    );

    state.isPlaying = false;

    updateControls();

    console.error(
      "Telemetry playback error:",
      data
    );
  }
}


/* =========================================================
   STOP
   ========================================================= */

function stopPlayback() {

  closeWebSocket();

  state.isPlaying = false;

  setConnectionStatus(
    "Disconnected",
    "idle"
  );

  playbackLabel.textContent =
    "Stopped";

  playbackProgress.style.width =
    "0%";

  frameLabel.textContent =
    "Frame 0";

  progressLabel.textContent =
    "0%";

  updateControls();
}


function closeWebSocket() {

  if (!state.websocket) {
    return;
  }

  state.websocket.close();

  state.websocket = null;
}


/* =========================================================
   EVENTS
   ========================================================= */

seasonSelect.addEventListener(
  "change",
  async () => {

    try {

      state.year =
        seasonSelect.value || null;

      if (!state.year) {

        state.event = null;
        state.session = null;

        eventSelect.disabled = true;
        sessionSelect.disabled = true;

        clearDrivers();

        return;
      }

      state.event = null;
      state.session = null;

      await loadEvents(
        state.year
      );

    } catch (error) {

      console.error(error);

      datasetStatus.textContent =
        "Failed to load events";
    }
  }
);


eventSelect.addEventListener(
  "change",
  async () => {

    try {

      state.event =
        eventSelect.value || null;

      if (!state.event) {

        state.session = null;

        sessionSelect.disabled = true;

        clearDrivers();

        return;
      }

      state.session = null;

      await loadSessions(
        state.year,
        state.event
      );

    } catch (error) {

      console.error(error);

      datasetStatus.textContent =
        "Failed to load sessions";
    }
  }
);


sessionSelect.addEventListener(
  "change",
  async () => {

    try {

      state.session =
        sessionSelect.value || null;

      if (!state.session) {

        clearDrivers();

        return;
      }

      await loadDrivers(
        state.year,
        state.event,
        state.session
      );

    } catch (error) {

      console.error(error);

      driverStatus.textContent =
        "Failed to load drivers";
    }
  }
);


lapSelect.addEventListener(
  "change",
  () => {

    state.lap =
      lapSelect.value
        ? Number(lapSelect.value)
        : null;

    updateControls();
  }
);


playButton.addEventListener(
  "click",
  connectWebSocket
);


stopButton.addEventListener(
  "click",
  stopPlayback
);


/* =========================================================
   INITIALIZATION
   ========================================================= */

async function initialize() {

  try {

    setConnectionStatus(
      "Disconnected",
      "idle"
    );

    await loadSeasons();

  } catch (error) {

    console.error(
      "Telemetry initialization failed:",
      error
    );

    datasetStatus.textContent =
      "Failed to load datasets";

    setConnectionStatus(
      "Backend unavailable",
      "error"
    );
  }
}


initialize();