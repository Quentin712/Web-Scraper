import { readFile, writeFile } from 'node:fs/promises';

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function statusClass(status) {
  return 'status-' + status.replace(/\s+/g, '-');
}

async function main() {
  const raw = await readFile('public/assignments.json', 'utf8');
  const data = JSON.parse(raw);

  const cards = data.assignments
    .map((a) => {
      const dueText = a.due_at ? new Date(a.due_at).toLocaleString() : 'No due date';
      const gradeText =
        a.grade !== null
          ? `${a.grade}${a.points_possible ? ' / ' + a.points_possible : ''}`
          : 'Not graded yet';

      return `
    <article class="card ${statusClass(a.status)}">
      <h2>${escapeHtml(a.title)}</h2>
      <span class="badge">${escapeHtml(a.status)}</span>
      <p class="due">Due: ${escapeHtml(dueText)}</p>
      <p class="grade">Grade: ${escapeHtml(gradeText)}</p>
      <p class="overview">${escapeHtml(a.overview)}</p>
      <a href="${escapeHtml(a.html_url)}" target="_blank">Open in Canvas</a>
    </article>`;
    })
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(data.course)} Report</title>
<style>
:root {
  --bg: #f5f6fa; --card-bg: #ffffff; --text: #1c1e26; --muted: #6b7280;
  --border: #e5e7eb; --open: #16a34a; --closed: #dc2626; --pending: #9333ea;
  --pastdue: #d97706; --accent: #2563eb;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: var(--bg); color: var(--text); }
header { padding: 2rem 2rem 1rem; background: var(--card-bg); border-bottom: 1px solid var(--border); }
header h1 { margin: 0 0 0.25rem; font-size: 1.6rem; }
header p { margin: 0; color: var(--muted); font-size: 0.9rem; }
main { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; padding: 2rem; }
.card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.card h2 { margin: 0; font-size: 1.05rem; }
.badge { display: inline-block; width: fit-content; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #fff; }
.status-open .badge { background: var(--open); }
.status-closed .badge { background: var(--closed); }
.status-not-yet-open .badge { background: var(--pending); }
.status-past-due .badge { background: var(--pastdue); }
.due, .grade { margin: 0; font-size: 0.9rem; color: var(--muted); }
.overview { margin: 0.25rem 0 0; font-size: 0.9rem; line-height: 1.4; }
.card a { margin-top: auto; color: var(--accent); font-size: 0.9rem; text-decoration: none; font-weight: 600; }
.card a:hover { text-decoration: underline; }
</style>
</head>
<body>
<header>
  <h1>${escapeHtml(data.course)}</h1>
  <p>${data.assignment_count} assignments &middot; generated ${escapeHtml(new Date(data.generated_at).toLocaleString())}</p>
</header>
<main>
${cards}
</main>
</body>
</html>
`;

  await writeFile('report.html', html);
  console.log('Wrote report.html. Open it directly, no server needed.');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
