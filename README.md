# Canvas Assignment Tracker

Pulls every assignment for one Canvas course (default: "Frontend Web Development") from Canvas's official API, saves it as JSON, and shows it as a report page. No browser automation, no login scripting, no scraping.


## How it works

1. `fetch-assignments.js` calls the Canvas API with your personal token and writes `public/assignments.json` (title, status, due date, points, grade, short overview).
2. `build-report.js` turns that JSON into one standalone `report.html`. Just open it. No server needed.
3. Optional: `serve.js` + `public/index.html` (jQuery) show the same data at `http://localhost:5173`.

## Requirements

* Linux, Git, and Node.js 18 or higher (older Node has no built in `fetch`). Check with `node -v`.
* If your Node is too old, install nvm from https://github.com/nvm-sh/nvm (copy the install command from its README), reopen the terminal, then run:

```
nvm install --lts
```

## Setup

**1. Clone and install**

```
git clone https://github.com/Quentin712/Web-Scraper.git
cd Web-Scraper
npm install
```

**2. Generate your Canvas token**

Log into https://alueducation.instructure.com/ (Google sign in). Click Account in the left bar, then Settings, scroll to Approved Integrations, click + New Access Token, name it "assignment tracker", click Generate Token. Copy it right away, Canvas shows it once.

Never paste the token into any chat or commit it. It works like a password.

**3. Create your .env**

```
cp .env.example .env
nano .env
```

Fill in real values (no trailing slash on the URL):

```
CANVAS_URL=https://alueducation.instructure.com
CANVAS_TOKEN=your_real_token
COURSE_NAME=Frontend Web Development
```

Do not leave the placeholder `your-school` in there, that causes the "domain not found" error.

**4. Fetch your assignments**

```
npm run fetch
```

**5. Build and open the report**

```
node build-report.js
```

Then open `report.html`:

* Linux desktop: `xdg-open report.html`
* WSL on Windows: `explorer.exe report.html`
* Remote server or sandbox (no browser): download `report.html` to your own computer (for example with `scp`) and double click it.

**Refresh later:** run `npm run fetch` then `node build-report.js` again.

## Optional: localhost view

```
npm run serve
```

Open `http://localhost:5173`. The terminal stays busy while it runs, that is normal. Stop it with Ctrl+C. This only works if your browser and terminal are on the same machine. If it says "connection refused", use `report.html` instead.

## Status meanings

* not yet open: before `unlock_at`
* closed: after `lock_at`
* past due: no lock date, but after `due_at`
* open: anything else

## Troubleshooting

* **404 "domain not found"**: `CANVAS_URL` is still the placeholder or has a typo. Check it safely with `grep CANVAS_URL .env`.
* **Trailing slash in the URL**: `fetch-assignments.js` should strip it with this line: `const CANVAS_URL = (process.env.CANVAS_URL || '').replace(/\/+$/, '');`
* **401 error**: token is wrong or expired. Generate a new one and update `.env`.
* **Missing CANVAS_URL or CANVAS_TOKEN**: you have not created `.env` yet.
* **fetch is not defined**: Node is older than 18, upgrade with nvm.
* **Course not found**: the script prints your active courses, copy the exact name into `COURSE_NAME`.
* **`./fetch-assignments.js` does not run**: use `npm run fetch` or `node fetch-assignments.js`. Files here are not executable scripts.
* **`explorer.exe` or `xdg-open` not found**: you are on a remote or headless machine, download `report.html` and open it locally.

## Notes

* The overview is the description with HTML removed and cut to about 220 characters. Use "Open in Canvas" for the full text.
* Ungraded work shows "Not graded yet", that is expected.
* Read only: the token cannot submit, edit, or delete anything.
* `.gitignore` should contain `.env`, `node_modules/`, `public/assignments.json`, and `report.html`. The last two hold your grades, so do not push them.
* If you zip the folder to share it, make sure `.env` is not inside.
