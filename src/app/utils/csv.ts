import { Form, Submission } from '../types';

export function exportToCSV(form: Form, submissions: Submission[]): void {
  if (submissions.length === 0) {
    alert('No submissions to export');
    return;
  }

  // Create headers from form fields
  const headers = ['Submission ID', 'Submitted At', ...form.fields.map(f => f.label)];
  
  // Create rows from submissions
  const rows = submissions.map(submission => {
    const row = [
      submission.id,
      new Date(submission.submittedAt).toLocaleString(),
      ...form.fields.map(field => {
        const value = submission.data[field.id];
        if (Array.isArray(value)) {
          return value.join('; ');
        }
        return value || '';
      })
    ];
    return row;
  });

  // Combine headers and rows
  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${form.name.replace(/\s+/g, '_')}_submissions_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
