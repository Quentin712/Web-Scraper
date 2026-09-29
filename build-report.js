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

function formatDate(iso) {
  if (!iso) return 'No due date';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function simpleStatus(iso) {
  if (!iso) return 'active';
  return new Date() > new Date(iso) ? 'past due' : 'active';
}

async function main() {
  const raw = await readFile('public/assignments.json', 'utf8');
  const data = JSON.parse(raw);

  const cards = data.assignments
    .map((a) => {
      const status = simpleStatus(a.due_at);
      const gradeText =
        a.grade !== null
          ? `${a.grade}${a.points_possible ? ' / ' + a.points_possible : ''}`
          : 'ungraded';

      return `
    <article class="card status-${status.replace(' ', '-')}">
      <h2><a href="${escapeHtml(a.html_url)}" target="_blank">${escapeHtml(a.title)}</a></h2>
      <p>Due date: ${escapeHtml(formatDate(a.due_at))}</p>
      <p>status: ${status}</p>
      <p>grade: ${escapeHtml(gradeText)}</p>
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
:root { --bg:#f5f6fa; --card-bg:#fff; --text:#1c1e26; --muted:#6b7280; --border:#e5e7eb; --active:#16a34a; --pastdue:#dc2626; --accent:#2563eb; }
* { box-sizing: border-box; }
body { margin:0; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; background:var(--bg); color:var(--text); }
header { padding:2rem 2rem 1rem; background:var(--card-bg); border-bottom:1px solid var(--border); }
header h1 { margin:0 0 0.25rem; font-size:1.6rem; }
header p { margin:0; color:var(--muted); font-size:0.9rem; }
main { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1.25rem; padding:2rem; }
.card { background:var(--card-bg); border:1px solid var(--border); border-radius:10px; padding:1.25rem; display:flex; flex-direction:column; gap:0.4rem; box-shadow:0 1px 2px rgba(0,0,0,0.04); }
.card h2 { margin:0; font-size:1.05rem; }
.card h2 a { color:var(--accent); text-decoration:none; }
.card h2 a:hover { text-decoration:underline; }
.card p { margin:0; font-size:0.9rem; color:var(--muted); }
.status-active p:nth-of-type(2) { color:var(--active); font-weight:600; }
.status-past-due p:nth-of-type(2) { color:var(--pastdue); font-weight:600; }
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
  console.log('Wrote report.html.');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
