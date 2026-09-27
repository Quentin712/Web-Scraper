# Canvas Assignment Tracker

Pulls every assignment for one Canvas course (default: "Frontend Web Development") straight from Canvas's own API, saves it as JSON, and shows it in a small local web page. No browser automation, no login scripting, no scraping. Canvas gives you a proper API for your own data, so that's what this uses.

## How it works

1. `fetch-assignments.js` talks to Canvas's REST API using a personal access token, finds the course you named, and pulls its assignments (title, due date, lock/unlock dates, points, your grade if one exists, and a short plain text summary of the description).
2. It writes all of that to `public/assignments.json`.
3. `serve.js` runs a tiny local web server (needed because browsers block a plain HTML file from loading a local JSON file directly, this sidesteps that).
4. `public/index.html` + `script.js` (jQuery) load that JSON and render one card per assignment, color coded by status.

## Setup

**1. Install the one dependency**

```bash
npm install
```

**2. Get your Canvas web address**

Log into Canvas in your browser like normal. Look at the address bar. It'll be something like `https://your-school.instructure.com`. Copy just that part, nothing after it.

**3. Generate a personal access token**

In Canvas: click **Account** in the left sidebar → **Settings** → scroll down to **Approved Integrations** → **+ New Access Token** → give it a purpose like "assignment tracker" → **Generate Token**.

Canvas shows you the token exactly once. Copy it immediately somewhere safe. If you lose it, you just generate a new one, no harm done, the old one can be deleted from that same settings page.

**Do not paste this token into ChatGPT, Claude, or any other chat. It works like a password to your account. It only ever goes into your local `.env` file below.**

**4. Configure**

```bash
cp .env.example .env
```

Open `.env` and fill in your real values:

```
CANVAS_URL=https://your-school.instructure.com
CANVAS_TOKEN=the_token_you_just_generated
COURSE_NAME=Frontend Web Development
```

**5. Pull your assignments**

```bash
npm run fetch
```

This writes `public/assignments.json`. Run it again any time you want fresh data, it's not automatic or scheduled, you run it on demand.

**6. View the UI**

```bash
npm run serve
```

Then open `http://localhost:5173` in your browser.

## How "status" is worked out

Canvas doesn't hand you a single "open or closed" flag, so this is computed from three dates it does give you:

- **not yet open**: current time is before `unlock_at`
- **closed**: current time is after `lock_at`
- **past due**: no lock date exists, but current time is after `due_at`
- **open**: anything else

## Notes and honest limitations

- If `COURSE_NAME` doesn't match any of your active courses, the script prints your actual course list to the terminal so you can copy the exact name. It matches on partial, case insensitive text, so "frontend" alone would probably work too.
- The "overview" field is the assignment description with HTML tags stripped and cut to about 220 characters. It's a summary for a quick glance, not the full instructions, click "Open in Canvas" on any card for the complete thing.
- Grades only show if Canvas has actually graded the submission. Ungraded work shows "Not graded yet," that's expected, not a bug.
- This only ever reads your own enrolled courses and your own submissions. It has no write access and can't submit, edit, or delete anything, the token only has the permissions your own account has.
- If you ever regenerate your token or it stops working, redo step 3 and update `.env`. Tokens can expire depending on what expiry you picked when creating it.
