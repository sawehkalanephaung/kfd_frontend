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

/** Year-only form, e.g. "2021" — used where a full date is more detail than needed. */
export function formatYear(dateStr?: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  return String(date.getFullYear());
}

/**
 * Completed years of service between two dates, e.g. "5 years" — defaults
 * the end date to today for an ongoing tenure. Anniversary-aware: doesn't
 * count a year until the month/day has actually passed, so Jan 2020 to
 * Dec 2023 correctly reads "3 years", not "4 years".
 */
export function formatYearsOfService(startDate?: string, endDate?: string): string {
  if (!startDate) return '-';
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return '-';
  const end = endDate ? new Date(endDate) : new Date();
  if (isNaN(end.getTime())) return '-';

  let years = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();
  const dayDiff = end.getDate() - start.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    years -= 1;
  }
  years = Math.max(years, 0);

  return `${years} year${years === 1 ? '' : 's'}`;
}
