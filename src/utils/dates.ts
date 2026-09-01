export function getLocalDateString(value = new Date()): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateDaysAgo(days: number): string {
  const value = new Date();
  value.setHours(12, 0, 0, 0);
  value.setDate(value.getDate() - days);
  return getLocalDateString(value);
}

export function getRecentDates(days: number): string[] {
  return Array.from({ length: days }, (_, index) => getDateDaysAgo(index));
}
