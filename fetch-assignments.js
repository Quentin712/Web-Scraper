import 'dotenv/config';
import { writeFile } from 'node:fs/promises';

const CANVAS_URL = process.env.CANVAS_URL;
const CANVAS_TOKEN = process.env.CANVAS_TOKEN;
const COURSE_NAME = process.env.COURSE_NAME || 'Frontend Web Development';

if (!CANVAS_URL || !CANVAS_TOKEN) {
  console.error('Missing CANVAS_URL or CANVAS_TOKEN. Copy .env.example to .env and fill both in.');
  process.exit(1);
}

const headers = { Authorization: `Bearer ${CANVAS_TOKEN}` };

async function canvasGet(path) {
  const res = await fetch(`${CANVAS_URL}${path}`, { headers });
  if (!res.ok) {
    throw new Error(`Canvas request failed (${res.status}) for ${path}: ${await res.text()}`);
  }
  return res.json();
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function summarize(text, maxLength = 220) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}

function getStatus(assignment) {
  const now = new Date();
  const unlockAt = assignment.unlock_at ? new Date(assignment.unlock_at) : null;
  const lockAt = assignment.lock_at ? new Date(assignment.lock_at) : null;
  const dueAt = assignment.due_at ? new Date(assignment.due_at) : null;

  if (unlockAt && now < unlockAt) return 'not yet open';
  if (lockAt && now > lockAt) return 'closed';
  if (!lockAt && dueAt && now > dueAt) return 'past due';
  return 'open';
}

async function main() {
  console.log(`Looking for course: ${COURSE_NAME}`);
  const courses = await canvasGet('/api/v1/courses?enrollment_state=active&per_page=100');
  const course = courses.find((c) =>
    (c.name || '').toLowerCase().includes(COURSE_NAME.toLowerCase())
  );

  if (!course) {
    console.error(`Could not find a course matching "${COURSE_NAME}". Your active courses are:`);
    courses.forEach((c) => console.error(` - ${c.name}`));
    process.exit(1);
  }

  console.log(`Found course: ${course.name} (id ${course.id})`);

  const assignments = await canvasGet(
    `/api/v1/courses/${course.id}/assignments?per_page=100&include[]=submission`
  );

  const cleaned = assignments.map((a) => {
    const submission = a.submission || {};
    const plainDescription = stripHtml(a.description);

    return {
      id: a.id,
      title: a.name,
      status: getStatus(a),
      due_at: a.due_at,
      unlock_at: a.unlock_at,
      lock_at: a.lock_at,
      points_possible: a.points_possible,
      grade: submission.grade ?? null,
      score: submission.score ?? null,
      submission_status: submission.workflow_state || 'unsubmitted',
      overview: summarize(plainDescription) || 'No description provided.',
      html_url: a.html_url
    };
  });

  const output = {
    course: course.name,
    generated_at: new Date().toISOString(),
    assignment_count: cleaned.length,
    assignments: cleaned
  };

  await writeFile('public/assignments.json', JSON.stringify(output, null, 2));
  console.log(`Saved ${cleaned.length} assignments to public/assignments.json`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
