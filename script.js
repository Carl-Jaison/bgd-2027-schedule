/* ===========================================================
   Bangalore Global Dialogue 2027 — Programme Grid
   Static, client-side editable schedule. All state lives in
   localStorage on this browser; use Export/Import JSON to
   move a schedule between machines or hand it off.
=========================================================== */

const STORAGE_KEY = "bgd2027-schedule-v2";
const PX_PER_MIN = 1.6;
const HEADER_HEIGHT = 54;

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
function rid() { return "r" + Math.random().toString(36).slice(2, 10); }

/* ---- time helpers ---- */
function toMinutes(hhmm) {
  const m = /^(\d{1,2}):(\d{2})/.exec(hhmm.trim());
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}
function parseRange(text) {
  const matches = [...text.matchAll(/(\d{1,2}:\d{2})/g)].map(m => m[1]);
  if (matches.length >= 2) return { start: matches[0], end: matches[1] };
  if (matches.length === 1) return { start: matches[0], end: matches[0] };
  return null;
}
function fmtRange(start, end) { return `${start} – ${end}`; }

/* ---- default data ---- */

function block(start, end, title, theme) { return { id: rid(), start, end, title, theme: theme || "" }; }
function shared(start, end, tag, text) { return { id: rid(), start, end, tag, text }; }

function emptyTrackMap(rows) {
  const map = {};
  TRACKS.forEach(t => { map[t.id] = rows(); });
  return map;
}

function defaultData() {
  return {
    days: [
      {
        id: "day1", label: "Day 1", date: "Fri, 26 March 2027", note: "Evening only", mode: "simple",
        rows: [
          { id: rid(), time: "18:00 – 19:00", tag: "Arrival", text: "Registration & Welcome Coffee" },
          { id: rid(), time: "19:00 – 22:00", tag: "Dinner", text: "Welcome Dinner — Lap Pool" },
        ],
      },
      {
        id: "day2", label: "Day 2", date: "Sat, 27 March 2027", note: "Full day — staggered", mode: "timeline",
        dayStart: "09:00", dayEnd: "21:00",
        shared: [
          shared("09:00", "09:30", "Opening", "Opening Remarks"),
          shared("09:30", "10:30", "Plenary", "Main Plenary — Durbar (full hall, not staggered)"),
          shared("12:30", "13:30", "Lunch", "Lunch"),
          shared("19:00", "21:00", "Dinner", "Dinner — Durbar"),
        ],
        tracks: {
          durbarA: [
            block("10:30", "12:00", ""), block("12:00", "12:30", "Break"),
            block("13:30", "15:00", ""), block("15:00", "15:15", "Break"),
            block("15:15", "16:45", ""), block("16:45", "17:00", "Break"),
            block("17:00", "18:30", ""), block("18:30", "19:00", "Free / Networking"),
          ],
          durbarB: [
            block("10:40", "12:10", ""), block("12:10", "12:30", "Break"),
            block("13:30", "14:45", ""), block("14:45", "15:00", "Break"),
            block("15:00", "16:30", ""), block("16:30", "16:45", "Break"),
            block("16:45", "18:15", ""), block("18:15", "19:00", "Free / Networking"),
          ],
          peregrine1: [
            block("10:45", "12:00", ""), block("12:00", "12:30", "Break"),
            block("13:30", "15:00", ""), block("15:00", "15:20", "Break"),
            block("15:20", "16:45", ""), block("16:45", "17:05", "Break"),
            block("17:05", "18:30", ""), block("18:30", "19:00", "Free / Networking"),
          ],
          peregrine2: [
            block("10:35", "12:05", ""), block("12:05", "12:30", "Break"),
            block("13:30", "14:50", ""), block("14:50", "15:10", "Break"),
            block("15:10", "16:40", ""), block("16:40", "17:00", "Break"),
            block("17:00", "18:20", ""), block("18:20", "19:00", "Free / Networking"),
          ],
          albatross2: [
            block("10:50", "12:20", ""), block("12:20", "12:30", "Break"),
            block("13:30", "15:00", ""), block("15:00", "15:15", "Break"),
            block("15:15", "16:45", ""), block("16:45", "17:00", "Break"),
            block("17:00", "18:30", ""), block("18:30", "19:00", "Free / Networking"),
          ],
          albatross3: [
            block("10:55", "12:10", ""), block("12:10", "12:30", "Break"),
            block("13:30", "14:45", ""), block("14:45", "15:05", "Break"),
            block("15:05", "16:30", ""), block("16:30", "16:50", "Break"),
            block("16:50", "18:10", ""), block("18:10", "19:00", "Free / Networking"),
          ],
        },
      },
      {
        id: "day3", label: "Day 3", date: "Sun, 28 March 2027", note: "Morning only — staggered", mode: "timeline",
        dayStart: "09:00", dayEnd: "14:00",
        shared: [
          shared("12:30", "13:00", "Closing", "Closing Remarks"),
          shared("13:00", "14:00", "Lunch", "Lunch"),
        ],
        tracks: {
          durbarA: [
            block("09:00", "10:30", ""), block("10:30", "10:45", "Break"),
            block("10:45", "12:15", ""), block("12:15", "12:30", "Free"),
          ],
          durbarB: [
            block("09:10", "10:35", ""), block("10:35", "10:50", "Break"),
            block("10:50", "12:20", ""), block("12:20", "12:30", "Free"),
          ],
          peregrine1: [
            block("09:05", "10:30", ""), block("10:30", "10:50", "Break"),
            block("10:50", "12:15", ""), block("12:15", "12:30", "Free"),
          ],
          peregrine2: [
            block("09:15", "10:40", ""), block("10:40", "11:00", "Break"),
            block("11:00", "12:25", ""), block("12:25", "12:30", "Free"),
          ],
          albatross2: [
            block("09:00", "10:25", ""), block("10:25", "10:45", "Break"),
            block("10:45", "12:15", ""), block("12:15", "12:30", "Free"),
          ],
          albatross3: [
            block("09:20", "10:35", ""), block("10:35", "10:55", "Break"),
            block("10:55", "12:20", ""), block("12:20", "12:30", "Free"),
          ],
        },
      },
    ],
  };
}

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

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

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

    if (day.mode === "simple") {
      panel.appendChild(buildSimpleTable(day));
    } else {
      panel.appendChild(buildTimeline(day));
      const addBar = document.createElement("div");
      addBar.className = "add-row-bar";
      addBar.innerHTML = `<button class="add-row-btn" data-action="add-shared" data-day="${day.id}">+ Add synced full-width block (like Lunch/Dinner)</button>`;
      panel.appendChild(addBar);
    }

    root.appendChild(panel);
  });
}

/* ---- Day 1 style simple table (no parallel tracks that evening) ---- */

function buildSimpleTable(day) {
  const table = document.createElement("table");
  table.className = "schedule-table simple-table";
  const tbody = document.createElement("tbody");
  day.rows.forEach(row => {
    const tr = document.createElement("tr");
    tr.className = "plenary-row";
    const timeTd = document.createElement("td");
    timeTd.className = "time-cell";
    timeTd.contentEditable = editMode;
    timeTd.textContent = row.time;
    timeTd.addEventListener("blur", () => { row.time = timeTd.textContent.trim(); save(); });
    tr.appendChild(timeTd);

    const td = document.createElement("td");
    td.className = "plenary-cell";
    td.contentEditable = editMode;
    td.innerHTML = `<span class="plenary-tag">${escapeHtml(row.tag || "")}</span>` + escapeHtml(row.text);
    td.addEventListener("focus", () => { td.innerHTML = row.text; });
    td.addEventListener("blur", () => {
      row.text = td.textContent.trim();
      td.innerHTML = `<span class="plenary-tag">${escapeHtml(row.tag || "")}</span>` + escapeHtml(row.text);
      save();
    });
    tr.appendChild(td);

    const ctrlTd = document.createElement("td");
    ctrlTd.className = "row-controls";
    ctrlTd.innerHTML = `<button title="Delete row">✕</button>`;
    ctrlTd.querySelector("button").addEventListener("click", () => {
      if (!confirm("Delete this item?")) return;
      day.rows = day.rows.filter(r => r.id !== row.id);
      save(); render();
    });
    tr.appendChild(ctrlTd);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  return table;
}

/* ---- Day 2/3 style staggered timeline ---- */

function buildTimeline(day) {
  const dayStartMin = toMinutes(day.dayStart);
  const dayEndMin = toMinutes(day.dayEnd);
  const totalMin = dayEndMin - dayStartMin;
  const totalHeight = totalMin * PX_PER_MIN;

  const wrap = document.createElement("div");
  wrap.className = "timeline-wrap";
  wrap.style.height = (totalHeight + HEADER_HEIGHT) + "px";

  // time axis
  const axis = document.createElement("div");
  axis.className = "timeline-axis";
  for (let m = dayStartMin; m <= dayEndMin; m += 30) {
    const top = HEADER_HEIGHT + (m - dayStartMin) * PX_PER_MIN;
    const label = document.createElement("div");
    label.className = "axis-label" + (m % 60 === 0 ? " hour" : "");
    label.style.top = top + "px";
    label.textContent = minutesToLabel(m);
    axis.appendChild(label);
  }
  wrap.appendChild(axis);

  // hall columns
  const colsWrap = document.createElement("div");
  colsWrap.className = "timeline-cols";
  TRACKS.forEach(track => {
    const col = document.createElement("div");
    col.className = "timeline-col";

    const head = document.createElement("div");
    head.className = "col-head";
    head.style.background = track.color;
    head.innerHTML = `<span class="hall-name">${escapeHtml(track.hall)}</span><span class="track-name">${escapeHtml(track.track)}</span>`;
    col.appendChild(head);

    const body = document.createElement("div");
    body.className = "col-body";
    body.style.height = totalHeight + "px";

    // hour gridlines for this column
    for (let m = dayStartMin; m <= dayEndMin; m += 30) {
      const line = document.createElement("div");
      line.className = "gridline" + (m % 60 === 0 ? " hour" : "");
      line.style.top = ((m - dayStartMin) * PX_PER_MIN) + "px";
      body.appendChild(line);
    }

    (day.tracks[track.id] || []).forEach(b => {
      body.appendChild(buildBlock(day, track, b, dayStartMin));
    });

    if (editMode) {
      const addBtn = document.createElement("button");
      addBtn.className = "add-block-btn";
      addBtn.textContent = "+ Add block";
      addBtn.style.top = (totalHeight + 6) + "px";
      addBtn.addEventListener("click", () => {
        const lastBlock = (day.tracks[track.id] || []).slice(-1)[0];
        const newStart = lastBlock ? lastBlock.end : day.dayStart;
        day.tracks[track.id].push(block(newStart, addMinutes(newStart, 60), ""));
        save(); render();
      });
      body.appendChild(addBtn);
    }

    col.appendChild(body);
    colsWrap.appendChild(col);
  });
  wrap.appendChild(colsWrap);

  // shared full-width bands (drawn above columns, offset to start below axis+col headers via top calc; positioned within col-body coordinate space)
  const sharedWrap = document.createElement("div");
  sharedWrap.className = "timeline-shared";
  sharedWrap.style.top = "0px";
  (day.shared || []).forEach(s => {
    sharedWrap.appendChild(buildSharedBlock(day, s, dayStartMin));
  });
  colsWrap.appendChild(sharedWrap);

  return wrap;
}

function buildBlock(day, track, b, dayStartMin) {
  const startMin = toMinutes(b.start);
  const endMin = toMinutes(b.end);
  const top = (startMin - dayStartMin) * PX_PER_MIN;
  const height = Math.max((endMin - startMin) * PX_PER_MIN, 26);

  const isBreak = /break|free|networking/i.test(b.title || "");
  const div = document.createElement("div");
  div.className = "block" + (isBreak ? " block-break" : " block-session");
  div.style.top = top + "px";
  div.style.height = height + "px";
  if (!isBreak) div.style.borderLeftColor = track.color;

  const timeEl = document.createElement("div");
  timeEl.className = "block-time";
  timeEl.contentEditable = editMode;
  timeEl.textContent = fmtRange(b.start, b.end);
  timeEl.addEventListener("blur", () => {
    const parsed = parseRange(timeEl.textContent);
    if (parsed) { b.start = parsed.start; b.end = parsed.end; }
    timeEl.textContent = fmtRange(b.start, b.end);
    save(); render();
  });
  div.appendChild(timeEl);

  const titleEl = document.createElement("div");
  titleEl.className = "block-title";
  titleEl.contentEditable = editMode;
  titleEl.dataset.placeholder = isBreak ? "Break / free time" : "+ Add session title";
  titleEl.textContent = b.title;
  titleEl.addEventListener("blur", () => {
    b.title = titleEl.textContent.trim();
    save();
    const nowBreak = /break|free|networking/i.test(b.title || "");
    div.classList.toggle("block-break", nowBreak);
    div.classList.toggle("block-session", !nowBreak);
    div.style.borderLeftColor = nowBreak ? "" : track.color;
  });
  div.appendChild(titleEl);

  if (!isBreak) {
    const select = document.createElement("select");
    select.className = "theme-select-inline";
    select.style.background = themeById(b.theme).color;
    THEMES.forEach(th => {
      const opt = document.createElement("option");
      opt.value = th.id; opt.textContent = th.label;
      if (th.id === b.theme) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener("change", () => {
      b.theme = select.value;
      select.style.background = themeById(b.theme).color;
      save();
    });
    div.appendChild(select);
  }

  if (editMode) {
    const del = document.createElement("button");
    del.className = "block-delete";
    del.textContent = "✕";
    del.title = "Delete block";
    del.addEventListener("click", () => {
      day.tracks[track.id] = day.tracks[track.id].filter(x => x.id !== b.id);
      save(); render();
    });
    div.appendChild(del);
  }

  return div;
}

function buildSharedBlock(day, s, dayStartMin) {
  const startMin = toMinutes(s.start);
  const endMin = toMinutes(s.end);
  const top = HEADER_HEIGHT + (startMin - dayStartMin) * PX_PER_MIN;
  const height = Math.max((endMin - startMin) * PX_PER_MIN, 30);

  const div = document.createElement("div");
  div.className = "shared-block";
  div.style.top = top + "px";
  div.style.height = height + "px";

  const timeEl = document.createElement("span");
  timeEl.className = "shared-time";
  timeEl.contentEditable = editMode;
  timeEl.textContent = fmtRange(s.start, s.end);
  timeEl.addEventListener("blur", () => {
    const parsed = parseRange(timeEl.textContent);
    if (parsed) { s.start = parsed.start; s.end = parsed.end; }
    timeEl.textContent = fmtRange(s.start, s.end);
    save(); render();
  });

  const tagEl = document.createElement("span");
  tagEl.className = "shared-tag";
  tagEl.contentEditable = editMode;
  tagEl.textContent = s.tag || "";
  tagEl.addEventListener("blur", () => { s.tag = tagEl.textContent.trim(); save(); });

  const textEl = document.createElement("span");
  textEl.className = "shared-text";
  textEl.contentEditable = editMode;
  textEl.textContent = s.text || "";
  textEl.addEventListener("blur", () => { s.text = textEl.textContent.trim(); save(); });

  div.appendChild(timeEl);
  div.appendChild(tagEl);
  div.appendChild(textEl);

  if (editMode) {
    const del = document.createElement("button");
    del.className = "shared-delete";
    del.textContent = "✕";
    del.title = "Delete";
    del.addEventListener("click", () => {
      day.shared = day.shared.filter(x => x.id !== s.id);
      save(); render();
    });
    div.appendChild(del);
  }

  return div;
}

function minutesToLabel(m) {
  const h = Math.floor(m / 60), mi = m % 60;
  return String(h).padStart(2, "0") + ":" + String(mi).padStart(2, "0");
}
function addMinutes(hhmm, mins) {
  const total = toMinutes(hhmm) + mins;
  return minutesToLabel(((total % 1440) + 1440) % 1440);
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
  if (btn.dataset.action === "add-shared") {
    day.shared.push(shared(day.dayStart, addMinutes(day.dayStart, 30), "", "New synced item"));
  }
  save(); render();
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

