/* ===========================================================
   Bangalore Global Dialogue 2027 — Programme Grid
   Static, client-side editable schedule. All state lives in
   localStorage on this browser; use Export/Import JSON to
   move a schedule between machines or hand it off.
=========================================================== */

const STORAGE_KEY = "bgd2027-schedule-v1";

const TRACKS = [
  { id: "durbarA",    hall: "Durbar 3A",    track: "Takshashila Track 1",            color: "var(--t-durbar-a)" },
  { id: "durbarB",    hall: "Durbar 3B",    track: "Takshashila Track 2",            color: "var(--t-durbar-b)" },
  { id: "peregrine1", hall: "Peregrine 1",  track: "Takshashila Track 3",            color: "var(--t-peregrine-1)" },
  { id: "peregrine2", hall: "Peregrine 2",  track: "Partner Track — Diplomacy & Business", color: "var(--t-peregrine-2)" },
  { id: "albatross2", hall: "Albatross 2",  track: "Bangalore Space Exercise",       color: "var(--t-albatross-2)" },
  { id: "albatross3", hall: "Albatross 3",  track: "Closed-Door Roundtable",         color: "var(--t-albatross-3)" },
];

const THEMES = [
  { id: "",        label: "— Theme —",                            color: "#9AA5B2" },
  { id: "htg",     label: "High-Tech Geopolitics",                 color: "var(--th-htg)" },
  { id: "innovation", label: "Innovation",                         color: "var(--th-innovation)" },
  { id: "defence", label: "Defence & Military Affairs",            color: "var(--th-defence)" },
  { id: "biotech", label: "Biotechnology",                         color: "var(--th-biotech)" },
  { id: "geoeco",  label: "Geoeconomics & Geostrategy",            color: "var(--th-geoeco)" },
  { id: "astro",   label: "Astropolitics & Geospatial Technology", color: "var(--th-astro)" },
];

function themeById(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }

function emptySessionCells() {
  const cells = {};
  TRACKS.forEach(t => { cells[t.id] = { title: "", theme: "" }; });
  return cells;
}

function defaultData() {
  return {
    days: [
      {
        id: "day1", label: "Day 1", date: "Fri, 26 March 2027", note: "Evening only",
        rows: [
          { id: rid(), type: "plenary", time: "18:00 – 19:00", tag: "Arrival", text: "Registration & Welcome Coffee" },
          { id: rid(), type: "plenary", time: "19:00 – 22:00", tag: "Dinner", text: "Welcome Dinner — Lap Pool" },
        ],
      },
      {
        id: "day2", label: "Day 2", date: "Sat, 27 March 2027", note: "Full day",
        rows: [
          { id: rid(), type: "plenary", time: "09:00 – 09:30", tag: "Opening", text: "Opening Remarks" },
          { id: rid(), type: "plenary", time: "09:30 – 10:30", tag: "Plenary", text: "Opening Plenary — Durbar (full hall)" },
          { id: rid(), type: "plenary", time: "10:30 – 10:45", tag: "Break", text: "Networking Break" },
          { id: rid(), type: "sessions", time: "10:45 – 12:15", cells: emptySessionCells() },
          { id: rid(), type: "plenary", time: "12:15 – 13:15", tag: "Lunch", text: "Lunch" },
          { id: rid(), type: "sessions", time: "13:15 – 14:45", cells: emptySessionCells() },
          { id: rid(), type: "plenary", time: "14:45 – 15:00", tag: "Break", text: "Networking Break" },
          { id: rid(), type: "sessions", time: "15:00 – 16:30", cells: emptySessionCells() },
          { id: rid(), type: "plenary", time: "16:30 – 16:45", tag: "Break", text: "Break" },
          { id: rid(), type: "sessions", time: "16:45 – 18:15", cells: emptySessionCells() },
          { id: rid(), type: "plenary", time: "19:00 – 21:00", tag: "Dinner", text: "Dinner — Durbar" },
        ],
      },
      {
        id: "day3", label: "Day 3", date: "Sun, 28 March 2027", note: "Morning only",
        rows: [
          { id: rid(), type: "sessions", time: "09:00 – 10:30", cells: emptySessionCells() },
          { id: rid(), type: "plenary", time: "10:30 – 10:45", tag: "Break", text: "Break" },
          { id: rid(), type: "sessions", time: "10:45 – 12:15", cells: emptySessionCells() },
          { id: rid(), type: "plenary", time: "12:15 – 13:00", tag: "Closing", text: "Closing Remarks" },
          { id: rid(), type: "plenary", time: "13:00 – 14:00", tag: "Lunch", text: "Lunch" },
        ],
      },
    ],
  };
}

function rid() { return "r" + Math.random().toString(36).slice(2, 10); }

let state = load();
let activeDay = state.days[0].id;
let editMode = true;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { console.warn("Could not load saved schedule, using default.", e); }
  return defaultData();
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* ---------------- Rendering ---------------- */

function render() {
  renderTabs();
  renderDays();
  renderLegend();
  document.body.classList.toggle("view-only", !editMode);
}

function renderTabs() {
  const nav = document.getElementById("dayTabs");
  nav.innerHTML = "";
  state.days.forEach(day => {
    const btn = document.createElement("button");
    btn.className = "daytab" + (day.id === activeDay ? " active" : "");
    btn.innerHTML = `${escapeHtml(day.label)}<span class="sub">${escapeHtml(day.date)} · ${escapeHtml(day.note)}</span>`;
    btn.addEventListener("click", () => { activeDay = day.id; render(); });
    nav.appendChild(btn);
  });
}

function renderDays() {
  const root = document.getElementById("scheduleRoot");
  root.innerHTML = "";
  state.days.forEach(day => {
    const panel = document.createElement("div");
    panel.className = "day-panel" + (day.id === activeDay ? " active" : "");
    panel.dataset.dayId = day.id;

    const toolbar = document.createElement("div");
    toolbar.className = "day-toolbar";
    toolbar.innerHTML = `<div class="day-label">${escapeHtml(day.label)}<span class="sub">${escapeHtml(day.date)} — ${escapeHtml(day.note)}</span></div>`;
    panel.appendChild(toolbar);

    panel.appendChild(buildTable(day));

    const addBar = document.createElement("div");
    addBar.className = "add-row-bar";
    addBar.innerHTML = `
      <button class="add-row-btn" data-action="add-sessions" data-day="${day.id}">+ Add parallel-track row</button>
      <button class="add-row-btn" data-action="add-plenary" data-day="${day.id}">+ Add full-width row (break / meal / plenary)</button>
    `;
    panel.appendChild(addBar);

    root.appendChild(panel);
  });
}

function buildTable(day) {
  const table = document.createElement("table");
  table.className = "schedule-table";

  const colgroup = document.createElement("colgroup");
  colgroup.innerHTML = `<col class="col-time">` + TRACKS.map(() => `<col>`).join("") + `<col style="width:34px">`;
  table.appendChild(colgroup);

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  headRow.innerHTML = `<th class="time-head">Time</th>` + TRACKS.map(t => `
    <th style="background:${t.color}">
      <span class="hall-name">${escapeHtml(t.hall)}</span>
      <span class="track-name">${escapeHtml(t.track)}</span>
    </th>`).join("") + `<th style="background:#2A3346"></th>`;
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  day.rows.forEach(row => tbody.appendChild(buildRow(day, row)));
  table.appendChild(tbody);

  return table;
}

function buildRow(day, row) {
  const tr = document.createElement("tr");
  tr.dataset.rowId = row.id;

  const timeTd = document.createElement("td");
  timeTd.className = "time-cell";
  timeTd.contentEditable = editMode;
  timeTd.textContent = row.time;
  timeTd.addEventListener("blur", () => { row.time = timeTd.textContent.trim(); save(); });
  tr.appendChild(timeTd);

  if (row.type === "plenary") {
    tr.classList.add("plenary-row");
    const td = document.createElement("td");
    td.colSpan = TRACKS.length;
    td.className = "plenary-cell";
    td.contentEditable = editMode;
    td.innerHTML = `<span class="plenary-tag">${escapeHtml(row.tag || "")}</span>` + escapeHtml(row.text);
    td.addEventListener("focus", () => {
      td.innerHTML = row.text;
    });
    td.addEventListener("blur", () => {
      row.text = td.textContent.trim();
      td.innerHTML = `<span class="plenary-tag">${escapeHtml(row.tag || "")}</span>` + escapeHtml(row.text);
      save();
    });
    tr.appendChild(td);
  } else {
    TRACKS.forEach(track => {
      const cellData = row.cells[track.id] || { title: "", theme: "" };
      const td = document.createElement("td");
      const inner = document.createElement("div");
      inner.className = "session-cell";
      inner.style.borderLeftColor = track.color;
      inner.contentEditable = editMode;
      inner.dataset.placeholder = "+ Add session title";
      inner.textContent = cellData.title;
      inner.addEventListener("blur", () => {
        cellData.title = inner.textContent.trim();
        row.cells[track.id] = cellData;
        save();
      });

      const select = document.createElement("select");
      select.className = "theme-select";
      select.style.background = themeById(cellData.theme).color;
      THEMES.forEach(th => {
        const opt = document.createElement("option");
        opt.value = th.id;
        opt.textContent = th.label;
        if (th.id === cellData.theme) opt.selected = true;
        select.appendChild(opt);
      });
      select.addEventListener("change", () => {
        cellData.theme = select.value;
        row.cells[track.id] = cellData;
        select.style.background = themeById(cellData.theme).color;
        save();
      });

      td.appendChild(inner);
      td.appendChild(select);
      tr.appendChild(td);
    });
  }

  const ctrlTd = document.createElement("td");
  ctrlTd.className = "row-controls";
  ctrlTd.innerHTML = `<button title="Delete row" data-action="delete-row">✕</button>`;
  ctrlTd.querySelector("button").addEventListener("click", () => {
    if (!confirm("Delete this time slot?")) return;
    day.rows = day.rows.filter(r => r.id !== row.id);
    save();
    render();
  });
  tr.appendChild(ctrlTd);

  return tr;
}

function renderLegend() {
  const trackWrap = document.getElementById("trackLegend");
  trackWrap.innerHTML = TRACKS.map(t => `
    <span class="chip" style="background:${t.color}">${escapeHtml(t.hall)} — ${escapeHtml(t.track)}</span>
  `).join("");

  const themeWrap = document.getElementById("themeLegend");
  themeWrap.innerHTML = THEMES.filter(t => t.id).map(t => `
    <span class="chip" style="background:${t.color}">${escapeHtml(t.label)}</span>
  `).join("");
}

function escapeHtml(str) {
  return (str || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

/* ---------------- Toolbar actions ---------------- */

document.getElementById("scheduleRoot").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const dayId = btn.dataset.day;
  const day = state.days.find(d => d.id === dayId);
  if (!day) return;

  if (btn.dataset.action === "add-sessions") {
    day.rows.push({ id: rid(), type: "sessions", time: "TBD", cells: emptySessionCells() });
  } else if (btn.dataset.action === "add-plenary") {
    day.rows.push({ id: rid(), type: "plenary", time: "TBD", tag: "", text: "New item" });
  }
  save();
  render();
});

document.getElementById("editModeToggle").addEventListener("click", () => {
  editMode = !editMode;
  document.getElementById("editModeToggle").textContent = "Editing: " + (editMode ? "ON" : "OFF");
  render();
});

document.getElementById("printBtn").addEventListener("click", () => window.print());

document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bgd-2027-schedule.json";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("importInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed.days) throw new Error("Missing 'days' key");
      state = parsed;
      activeDay = state.days[0].id;
      save();
      render();
    } catch (err) {
      alert("Could not read that file as a schedule export: " + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = "";
});

document.getElementById("resetBtn").addEventListener("click", () => {
  if (!confirm("Reset to the default schedule? This clears all edits saved in this browser.")) return;
  state = defaultData();
  activeDay = state.days[0].id;
  save();
  render();
});

render();
