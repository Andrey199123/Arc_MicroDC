/**
 * Returns a date as a `YYYY-MM-DD` key using the viewer's LOCAL timezone.
 *
 * Task dates (scheduledDate) are stored as plain local calendar-day strings
 * (see convex/ai.ts, which parses them with `new Date(year, month-1, day)`).
 * Using `new Date().toISOString()` to derive "today" computes the date in UTC,
 * which rolls over a day early for users in negative-offset timezones (e.g. the
 * US in the evening) — making the app show tomorrow's tasks as today's.
 * Always compare against this local key instead.
 */
export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
