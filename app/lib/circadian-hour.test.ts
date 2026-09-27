import { describe, expect, it } from "vitest";
import { hourInTimeZone, parseHourParam } from "./circadian-hour";

describe("parseHourParam", () => {
  it("accepts hours 0-23 with or without zero padding", () => {
    expect(parseHourParam("0")).toBe(0);
    expect(parseHourParam("09")).toBe(9);
    expect(parseHourParam("23")).toBe(23);
    expect(parseHourParam(["21", "4"])).toBe(21);
  });

  it("rejects anything that is not a whole hour on the clock", () => {
    for (const value of ["24", "-1", "7.5", "7pm", "", "123", undefined, null]) {
      expect(parseHourParam(value)).toBeNull();
    }
  });
});

describe("hourInTimeZone", () => {
  const noonUtc = new Date("2026-01-15T12:30:00Z");

  it("reads the wall-clock hour in the given zone", () => {
    expect(hourInTimeZone("UTC", noonUtc)).toBe(12);
    expect(hourInTimeZone("America/New_York", noonUtc)).toBe(7);
    expect(hourInTimeZone("Asia/Tokyo", noonUtc)).toBe(21);
  });

  it("returns 0 rather than 24 at midnight", () => {
    expect(hourInTimeZone("UTC", new Date("2026-01-15T00:10:00Z"))).toBe(0);
  });

  it("returns null for unknown zones", () => {
    expect(hourInTimeZone("Not/AZone", noonUtc)).toBeNull();
  });
});
