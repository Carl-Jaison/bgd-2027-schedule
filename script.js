/* ===========================================================
   Bangalore Global Dialogue 2027 — Programme Grid
   Static, client-side editable schedule. All state lives in
   localStorage on this browser; use Export/Import JSON to
   move a schedule between machines or hand it off.
=========================================================== */

const STORAGE_KEY = "bgd2027-schedule-v12";
const PX_PER_MIN = 2.4;
const HEADER_HEIGHT = 64;

const TRACKS = [
  { id: "durbarA",    hall: "Durbar 3A",    track: "Takshashila Track 1",            color: "var(--t-durbar-a)" },
  { id: "durbarB",    hall: "Durbar 3B",    track: "Takshashila Track 2",            color: "var(--t-durbar-b)" },
  { id: "peregrine1", hall: "Peregrine 1",  track: "Takshashila Track 3",            color: "var(--t-peregrine-1)" },
  { id: "peregrine2", hall: "Peregrine 2",  track: "Partner Track — Diplomacy & Business", color: "var(--t-peregrine-2)" },
  { id: "albatross2", hall: "Albatross 2",  track: "Bangalore Space Exercise",       color: "var(--t-albatross-2)" },
  { id: "albatross3", hall: "Albatross 3",  track: "Closed-Door Roundtable",         color: "var(--t-albatross-3)" },
];

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

function block(start, end, title, code, key) { return { id: rid(), start, end, title, code: code || "", key: !!key }; }
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
        id: "day0", label: "Day 0", date: "Fri, 26 March 2027", note: "Evening only", mode: "simple",
        rows: [
          { id: rid(), time: "18:00 – 19:30", tag: "Arrival", text: "Registration & Welcome Coffee" },
          { id: rid(), time: "19:30 – 21:00", tag: "Dinner", text: "Welcome Dinner — Lap Pool" },
        ],
      },
      {
        id: "day1", label: "Day 1", date: "Sat, 27 March 2027", note: "Staggered — 75-min sessions", mode: "timeline",
        dayStart: "09:00", dayEnd: "21:30",
        shared: [
          shared("09:00", "09:20", "Opening", "Opening Remarks"),
          shared("09:20", "10:15", "Plenary", "Main Plenary — Durbar 3 (full hall, not staggered)"),
          shared("12:45", "14:00", "Lunch", "Lunch (outside Durbar 3A — does not block other halls)"),
          shared("20:00", "21:30", "Dinner", "Dinner (joint, all halls)"),
        ],
        tracks: {
          durbarA: [
            block("10:10", "11:00", "Not Available — Hall Setup in Progress (post-Plenary partition)"),
            block("11:00", "12:10", "Future of AI Geopolitics", "A1", true),
            block("12:10", "12:15", "Break"),
            block("12:15", "13:15", "Projecting Nuclear Weapons Environment to 2035 — Ankit Panda, Jeffrey Lewis", "A2"),
            block("14:00", "15:15", "Developing DeepTech in Europe & India — Safran/Volvo (to suggest)", "A3"),
            block("15:15", "15:45", "Networking Break"),
            block("15:45", "17:00", "Technology & Future of Warfare — Ukrainian & Israeli speakers, Justin Bronk, Paul Scharre, Kimberley Kagan", "A4"),
            block("17:00", "17:05", "Break"),
            block("17:05", "20:00", "Financing Generational Projects", "A5", true),
          ],
          durbarB: [
            block("10:10", "11:00", "Not Available — Hall Setup in Progress (post-Plenary partition)"),
            block("11:00", "12:10", "Future of World Order — Fukuyama, Marandi*, Bilahari Kausikan", "B1", true),
            block("12:10", "12:15", "Break"),
            block("12:15", "13:15", "How Biotech will Shape 2035", "B2"),
            block("14:10", "15:25", "Dealing with Chokepoints: Food, Fuel & Chips — Henry Farrell, Gargash, Chris Miller", "B3"),
            block("15:25", "15:55", "Networking Break"),
            block("15:55", "17:10", "Building International Financial Rails for the 21st Century — Tyler Cowen, Brian Armstrong", "B4"),
            block("17:10", "17:15", "Break"),
            block("17:15", "20:00", "Engaging Europe — Pascal Lamy", "B5", true),
          ],
          peregrine1: [
            block("10:10", "11:00", "Future of War — Mick Ryan", "C1", true),
            block("11:00", "11:05", "Break"),
            block("11:05", "12:15", "Economic Statecraft — Dan Drezner", "C2"),
            block("12:15", "12:20", "Break"),
            block("12:20", "13:15", "Climate Change, Economic Growth & National Security", "C3"),
            block("14:00", "15:15", "Sharing of Natural Resources Beyond Boundaries — ASEAN & Australian speaker", "C4"),
            block("15:15", "15:20", "Break"),
            block("15:20", "16:35", "Financing Generational Projects", "C5", true),
            block("16:35", "18:00", "Unconference"),
            block("18:00", "18:15", "Break"),
            block("18:15", "19:45", "Great Powers Show — Live Podcast"),
            block("19:45", "20:00", "Free / Networking"),
          ],
          peregrine2: [
            block("10:10", "11:00", "Consulate Partner — title TBD"),
            block("11:05", "12:15", "Corporate Partner — title TBD"),
            block("12:20", "13:15", "University Partner — title TBD"),
            block("14:00", "15:00", "Consulate Partner — title TBD"),
            block("15:05", "16:05", "Corporate Partner — title TBD"),
            block("16:10", "20:00", "University Partner — title TBD"),
          ],
          albatross2: [
            block("10:10", "15:00", "Bangalore Space Exercise — runs through the morning"),
          ],
          albatross3: [
            block("10:10", "20:00", "Closed-Door Roundtable — content to be populated"),
          ],
        },
      },
      {
        id: "day2", label: "Day 2", date: "Sun, 28 March 2027", note: "Staggered — 75-min sessions", mode: "timeline",
        dayStart: "09:00", dayEnd: "18:45",
        shared: [
          shared("09:00", "09:15", "Opening", "Opening Recap"),
          shared("12:45", "14:00", "Lunch", "Lunch (joint, all halls)"),
          shared("18:15", "18:45", "Closing", "Closing Remarks"),
        ],
        tracks: {
          durbarA: [
            block("09:15", "10:30", "Future of Growth — Mokyr, Roy, VAN", "A6", true),
            block("10:30", "10:35", "Break"),
            block("10:35", "11:50", "Business & Government in the AI Age", "A7"),
            block("11:50", "12:45", "Break"),
            block("14:00", "15:15", "Social Contract in 2035", "A8"),
            block("15:15", "15:20", "Break"),
            block("15:20", "16:35", "Path to Re-Globalisation — Montek Singh Ahluwalia", "A9"),
            block("16:35", "16:40", "Break"),
            block("16:40", "17:55", "AI & Epistemology", "A10", true),
          ],
          durbarB: [
            block("09:25", "10:40", "Dealing with China — Kevin Rudd, Yan", "B6", true),
            block("10:40", "10:45", "Break"),
            block("10:45", "12:00", "Attracting Capital", "B7"),
            block("12:00", "12:45", "Break"),
            block("14:10", "15:25", "GeoAI in 2035 — Srikant Sastry, Simonetta Cheli", "B8"),
            block("15:25", "15:30", "Break"),
            block("15:30", "16:45", "Creating New Energy", "B9"),
            block("16:45", "16:50", "Break"),
            block("16:50", "18:05", "Dealing with the USA — Condoleezza Rice, Husain Haqqani", "B10", true),
          ],
          peregrine1: [
            block("09:35", "10:50", "Transforming Defence Industrial Base", "C6", true),
            block("10:50", "10:55", "Break"),
            block("10:55", "12:10", "Global Cooperation in Bioeconomy Governance", "C7"),
            block("12:10", "12:45", "Break"),
            block("14:20", "15:35", "How Companies Should Deal with Global Risk & Volatility — Ian Bremmer", "C8"),
            block("15:35", "15:40", "Break"),
            block("15:40", "16:55", "Technology & Democracy", "C9"),
            block("16:55", "17:00", "Break"),
            block("17:00", "18:15", "Sovereign States in Limitless Space — Awais Ahmed", "C10", true),
          ],
          peregrine2: [
            block("09:20", "10:20", "Consulate Partner — title TBD"),
            block("10:25", "11:25", "Corporate Partner — title TBD"),
            block("11:30", "12:45", "Break"),
            block("14:05", "15:05", "Consulate Partner — title TBD"),
            block("15:10", "16:10", "Corporate Partner — title TBD"),
            block("16:15", "17:15", "Consulate Partner — title TBD"),
            block("17:15", "18:15", "Free / Networking"),
          ],
          albatross2: [
            block("09:15", "18:15", "Bangalore Space Exercise — runs through the day"),
          ],
          albatross3: [
            block("09:15", "18:15", "Closed-Door Roundtable — content to be populated"),
          ],
        },
      },
    ],
  };
}

let state = load();
let activeMainTab = "programme"; // "programme" | "day01" | "day2"
let editMode = true;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { console.warn("Could not load saved schedule, using default.", e); }
  return defaultData();
}

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

/* ---------------- Full-programme overview (single glance, sequential, fit-to-page) ---------------- */

function renderOverview() {
  const root = document.getElementById("overviewRoot");
  root.innerHTML = "";

  state.days.forEach(day => {
    const dayBlock = document.createElement("div");
    dayBlock.className = "overview-day-block";

    const heading = document.createElement("div");
    heading.className = "overview-day-heading";
    heading.textContent = `${day.label} — ${day.date}`;
    dayBlock.appendChild(heading);

    const table = document.createElement("table");
    table.className = "overview-table";
    const colgroup = document.createElement("colgroup");
    colgroup.innerHTML = `<col class="ov-col-time">` + TRACKS.map(() => `<col>`).join("");
    table.appendChild(colgroup);

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    headRow.innerHTML = `<th>Time</th>` + TRACKS.map(t => `
      <th style="background:${t.color}">${escapeHtml(t.hall)}</th>
    `).join("");
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    if (day.mode === "simple") {
      day.rows.forEach(r => {
        const tr = document.createElement("tr");
        tr.className = "ov-shared-row";
        tr.innerHTML = `<td class="ov-time-cell">${escapeHtml(r.time)}</td><td class="ov-shared-cell" colspan="${TRACKS.length}"><span class="ov-tag">${escapeHtml(r.tag || "")}</span>${escapeHtml(r.text)}</td>`;
        tbody.appendChild(tr);
      });
    } else {
      // Segment each track's sessions by the shared items (Lunch, Dinner, etc.) that fall
      // between them, so a row never mixes sessions that are actually before vs. after
      // a shared break — even when different halls have different numbers of sessions
      // on either side of it (e.g. Peregrine 1 has 3 sessions before Lunch, Durbar only 2).
      const perTrackAll = {};
      TRACKS.forEach(t => {
        perTrackAll[t.id] = (day.tracks[t.id] || []).filter(b => !/break|free|networking/i.test(b.title || ""));
      });
      const pointers = {};
      TRACKS.forEach(t => { pointers[t.id] = 0; });

      const sharedSorted = [...(day.shared || [])].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
      const rows = [];
      let slotCounter = 0;

      function emitSlotsUntil(boundaryMin) {
        const countsBefore = TRACKS.map(t => {
          const arr = perTrackAll[t.id];
          let p = pointers[t.id], c = 0;
          while (p < arr.length && (boundaryMin === null || toMinutes(arr[p].start) < boundaryMin)) { c++; p++; }
          return c;
        });
        const maxBefore = Math.max(0, ...countsBefore);
        for (let i = 0; i < maxBefore; i++) {
          slotCounter++;
          const cells = {};
          TRACKS.forEach((t, idx) => {
            if (i < countsBefore[idx]) cells[t.id] = perTrackAll[t.id][pointers[t.id] + i];
          });
          rows.push({ kind: "slot", slotLabel: slotCounter, cells });
        }
        TRACKS.forEach((t, idx) => { pointers[t.id] += countsBefore[idx]; });
      }

      sharedSorted.forEach(s => {
        emitSlotsUntil(toMinutes(s.start));
        rows.push({ kind: "shared", data: s });
      });
      emitSlotsUntil(null); // any remaining sessions after the last shared item

      rows.forEach(row => {
        const tr = document.createElement("tr");
        if (row.kind === "shared") {
          const s = row.data;
          tr.className = "ov-shared-row";
          tr.innerHTML = `<td class="ov-time-cell">${escapeHtml(fmtRange(s.start, s.end))}</td><td class="ov-shared-cell" colspan="${TRACKS.length}"><span class="ov-tag">${escapeHtml(s.tag || "")}</span>${escapeHtml(s.text)}</td>`;
        } else {
          const timeTd = document.createElement("td");
          timeTd.className = "ov-time-cell";
          timeTd.textContent = "Slot " + row.slotLabel;
          tr.appendChild(timeTd);
          TRACKS.forEach(t => {
            const b = row.cells[t.id];
            const td = document.createElement("td");
            if (b) {
              td.className = "ov-cell" + (b.key ? " ov-key" : "");
              td.style.borderLeftColor = t.color;
              const shortTitle = (b.title || "").split(" — ")[0];
              td.innerHTML = `<span class="ov-cell-time">${escapeHtml(fmtRange(b.start, b.end))}</span>` +
                (shortTitle ? `<span class="ov-title-text" title="${escapeHtml(b.title || "")}">${escapeHtml(shortTitle)}</span>` : `<span class="ov-empty">—</span>`);
            } else {
              td.className = "ov-cell ov-empty-cell";
              td.innerHTML = `<span class="ov-empty">—</span>`;
            }
            tr.appendChild(td);
          });
        }
        tbody.appendChild(tr);
      });
    }

    table.appendChild(tbody);
    dayBlock.appendChild(table);
    root.appendChild(dayBlock);
  });

  fitOverviewToPage();
}

function fitOverviewToPage() {
  const wrap = document.getElementById("overviewRoot");
  wrap.style.zoom = 1;
  const naturalHeight = wrap.scrollHeight;
  const top = wrap.getBoundingClientRect().top;
  const available = window.innerHeight - top - 16;
  const scale = Math.min(1, available / naturalHeight);
  wrap.style.zoom = scale;
}

/* ---------------- Rendering ---------------- */

function render() {
  renderTabs();
  const overviewSection = document.querySelector(".overview-section");
  const legendSection = document.querySelector(".legend");
  const footNote = document.querySelector(".foot-note");
  if (activeMainTab === "programme") {
    overviewSection.style.display = "";
    document.getElementById("scheduleRoot").style.display = "none";
    legendSection.style.display = "none";
    footNote.style.display = "none";
    renderOverview();
  } else {
    overviewSection.style.display = "none";
    document.getElementById("scheduleRoot").style.display = "";
    legendSection.style.display = "";
    footNote.style.display = "";
    renderDays();
  }
  renderLegend();
  document.body.classList.toggle("view-only", !editMode);
}

const MAIN_TABS = [
  { id: "programme", label: "Full Programme", sub: "26–28 March, at a glance" },
  { id: "day01", label: "Day 0 & Day 1", sub: "26–27 March, detailed" },
  { id: "day2", label: "Day 2", sub: "28 March, detailed" },
];

function renderTabs() {
  const nav = document.getElementById("dayTabs");
  nav.innerHTML = "";
  MAIN_TABS.forEach(t => {
    const btn = document.createElement("button");
    btn.className = "daytab" + (t.id === activeMainTab ? " active" : "");
    btn.innerHTML = `${escapeHtml(t.label)}<span class="sub">${escapeHtml(t.sub)}</span>`;
    btn.addEventListener("click", () => { activeMainTab = t.id; render(); });
    nav.appendChild(btn);
  });
}

function renderDays() {
  const root = document.getElementById("scheduleRoot");
  root.innerHTML = "";
  const dayIds = activeMainTab === "day01" ? ["day0", "day1"] : ["day2"];
  state.days.filter(d => dayIds.includes(d.id)).forEach(day => {
    const panel = document.createElement("div");
    panel.className = "day-panel active";
    panel.id = "panel-" + day.id;
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
  div.className = "block" + (isBreak ? " block-break" : " block-session") + (b.key ? " block-key" : "");
  div.style.top = top + "px";
  div.style.height = height + "px";
  if (!isBreak) div.style.borderLeftColor = track.color;

  const timeRow = document.createElement("div");
  timeRow.className = "block-time-row";

  const timeEl = document.createElement("span");
  timeEl.className = "block-time";
  timeEl.contentEditable = editMode;
  timeEl.textContent = fmtRange(b.start, b.end);
  timeEl.addEventListener("blur", () => {
    const parsed = parseRange(timeEl.textContent);
    if (parsed) { b.start = parsed.start; b.end = parsed.end; }
    timeEl.textContent = fmtRange(b.start, b.end);
    save(); render();
  });
  timeRow.appendChild(timeEl);

  if (!isBreak) {
    const codeEl = document.createElement("span");
    codeEl.className = "block-code";
    codeEl.contentEditable = editMode;
    codeEl.textContent = b.code || "";
    codeEl.dataset.placeholder = "code";
    codeEl.addEventListener("blur", () => { b.code = codeEl.textContent.trim(); save(); });
    timeRow.appendChild(codeEl);
  }
  div.appendChild(timeRow);

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



  if (b.key) {
    const badge = document.createElement("span");
    badge.className = "key-badge";
    badge.textContent = "★ KEY";
    div.appendChild(badge);
  }

  if (editMode) {
    const keyBtn = document.createElement("button");
    keyBtn.className = "block-key-toggle" + (b.key ? " active" : "");
    keyBtn.textContent = "★";
    keyBtn.title = "Toggle key session";
    keyBtn.addEventListener("click", () => {
      b.key = !b.key;
      save(); render();
    });
    div.appendChild(keyBtn);

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

window.addEventListener("resize", () => {
  if (activeMainTab === "programme") fitOverviewToPage();
});

render();

