export function calculateExactDuration(startDate?: string, endDate?: string): string {
  if (!startDate) return '-';

  const start = new Date(startDate);
  // If endDate is not provided, use the current date
  const end = endDate ? new Date(endDate) : new Date();

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return '-';
  }

  // Calculate the difference in milliseconds
  const diff = end.getTime() - start.getTime();

  if (diff < 0) return '-';

  // Constants for time calculations
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const DAYS_PER_YEAR = 365.25;
  const DAYS_PER_MONTH = 30.44;

  const totalDays = Math.floor(diff / MS_PER_DAY);

  if (totalDays === 0) return '0 days';

  const years = Math.floor(totalDays / DAYS_PER_YEAR);
  let remainingDays = totalDays - Math.floor(years * DAYS_PER_YEAR);

  const months = Math.floor(remainingDays / DAYS_PER_MONTH);
  remainingDays = remainingDays - Math.floor(months * DAYS_PER_MONTH);

  const weeks = Math.floor(remainingDays / 7);
  const days = remainingDays % 7;

  const parts = [];

  if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
  if (weeks > 0) parts.push(`${weeks} week${weeks > 1 ? 's' : ''}`);
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);

  return parts.join(', ') || '-';
}

export function formatTenureYears(startDate?: string, endDate?: string): string {
  if (!startDate) return '-';
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return '-';
  const startYear = start.getFullYear();

  if (!endDate) return `${startYear} - Present`;

  const end = new Date(endDate);
  if (isNaN(end.getTime())) return `${startYear} - Present`;
  const endYear = end.getFullYear();
  if (startYear === endYear) return `${startYear}`;

  return `${startYear} - ${endYear}`;
}

// Public-facing long form, e.g. "March 15, 2021" — used for "First Appointed" labels.
export function formatFullDate(dateStr?: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
