# Bangalore Global Dialogue 2027 — Programme Grid

A static, editable schedule grid: 3 days × 6 halls, colour-coded by track, with a theme tag per session. No build step — just HTML/CSS/JS.

## Host it on GitHub Pages

1. Create a new repository (or use an existing one) and add these three files (`index.html`, `style.css`, `script.js`) to the root — or to a `/docs` folder if you'd rather keep it alongside other content.
2. Push to GitHub.
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Pick the branch (usually `main`) and the folder (`/root` or `/docs`, matching where you put the files), then **Save**.
6. GitHub gives you a URL like `https://<your-username>.github.io/<repo-name>/` within a minute or two — that's your live schedule.

## Making changes

**Quick day-to-day edits (no coding, no GitHub needed):**
Just open the live site and click into any cell:
- **Session cells** — click the placeholder text, type a title, click away to save. Use the dropdown under each session to tag a theme.
- **Times** — click directly on a time and retype it.
- **Break/meal/plenary rows** (the shaded full-width rows) — click and edit the text the same way.
- **Add a row** — use the two "+ Add" buttons at the bottom of each day.
- **Delete a row** — the ✕ button on the right of each row.

These edits save automatically to that browser's local storage. They will **not** appear for someone else opening the site on a different device/browser — see "Sharing edits" below.

**Turning editing off** (e.g. before sharing a link publicly): click **Editing: ON** in the top right to switch to view-only. Click again to re-enable.

## Sharing edits / making them permanent for everyone

Since this is a static site, live edits only live in your own browser until you either:

- **Export JSON** (top right) → this downloads a file with your current schedule. Send that file to whoever needs it; they can use **Import JSON** to load it into their own browser.
- **Bake it into the site permanently**: open `script.js`, find the `defaultData()` function near the top, and update the `text`, `time`, or `cells` values there directly to match your latest schedule. Commit and push — anyone loading the site fresh (or after hitting **Reset to default**) will now see your changes.

## Structure

- `index.html` — page layout, day tabs, legend, toolbar
- `style.css` — all styling, colour tokens for tracks/themes, print layout
- `script.js` — schedule data, rendering, and all editing logic

Halls/tracks and themes are defined near the top of `script.js` (`TRACKS` and `THEMES` arrays) — add, remove, or recolour them there if the track list changes.
