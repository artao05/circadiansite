/** Master-clock hour used when neither the URL nor the visitor's zone says otherwise. */
export const DEFAULT_HOUR = 8;

/** Query parameter that shares a master-clock hour, e.g. `/?t=23`. */
export const HOUR_PARAM = "t";

/** Request header the Worker fills from Cloudflare's IP-based time zone. */
export const VISITOR_TIME_ZONE_HEADER = "x-visitor-timezone";

/** Parses a shared hour (`"0"`–`"23"`, optionally zero-padded); anything else is null. */
export function parseHourParam(
  value: string | string[] | null | undefined,
): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !/^\d{1,2}$/.test(raw)) return null;
  const hour = Number(raw);
  return hour <= 23 ? hour : null;
}

/** Current hour (0–23) in an IANA time zone, or null when the zone is unknown. */
export function hourInTimeZone(
  timeZone: string,
  date: Date = new Date(),
): number | null {
  try {
    const hour = Number(
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        hourCycle: "h23",
        timeZone,
      }).format(date),
    );
    return Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : null;
  } catch {
    return null;
  }
}
