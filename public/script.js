$(function () {
  $.getJSON('assignments.json')
    .done(function (data) {
      $('#course-title').text(data.course);
      $('#meta').text(
        `${data.assignment_count} assignments · updated ${new Date(data.generated_at).toLocaleString()}`
      );

      const $list = $('#assignment-list');

      data.assignments.forEach(function (a) {
        const dueText = a.due_at ? new Date(a.due_at).toLocaleString() : 'No due date';
        const gradeText =
          a.grade !== null
            ? `${a.grade}${a.points_possible ? ' / ' + a.points_possible : ''}`
            : 'Not graded yet';
        const statusClass = 'status-' + a.status.replace(/\s+/g, '-');

        const $card = $('<article>').addClass('card').addClass(statusClass);
        $card.append($('<h2>').text(a.title));
        $card.append($('<span>').addClass('badge').text(a.status));
        $card.append($('<p>').addClass('due').text('Due: ' + dueText));
        $card.append($('<p>').addClass('grade').text('Grade: ' + gradeText));
        $card.append($('<p>').addClass('overview').text(a.overview));
        $card.append($('<a>').attr('href', a.html_url).attr('target', '_blank').text('Open in Canvas'));

        $list.append($card);
      });
    })
    .fail(function () {
      $('#assignment-list').text('Could not load assignments.json. Run "npm run fetch" first.');
    });
});
