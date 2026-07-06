import { describe, expect, it } from "vitest";
import {
  forcedDesynchronyProtocolOptions,
  generateSleepData,
  getForcedDesynchronyBiologicalHour,
  getForcedDesynchronyPhaseDrift,
  getForcedDesynchronySchedule,
  getSleepModelHorizon,
  getSleepWindows,
  type SleepBudgetMode,
} from "./sleep-model";

const budgetModes: SleepBudgetMode[] = ["control", "csr"];

describe("forced desynchrony sleep model", () => {
  it("matches configured horizons and cycle counts", () => {
    for (const protocol of forcedDesynchronyProtocolOptions) {
      const options = { protocol: protocol.value, budget: "control" as const };
      const windows = getSleepWindows("forced-desynchrony", options);

      expect(getSleepModelHorizon("forced-desynchrony", options)).toBeCloseTo(
        protocol.horizon,
        2,
      );
      expect(windows).toHaveLength(protocol.cycles);
      expect(windows.at(-1)?.end).toBeCloseTo(protocol.horizon, 2);
    }
  });

  it("keeps each protocol cycle equal to wake plus sleep", () => {
    for (const protocol of forcedDesynchronyProtocolOptions) {
      for (const budget of budgetModes) {
        const options = { protocol: protocol.value, budget };
        const schedule = getForcedDesynchronySchedule(options);
        const windows = getSleepWindows("forced-desynchrony", options);

        expect(schedule.wakeHours + schedule.sleepHours).toBeCloseTo(
          protocol.protocolLength,
          2,
        );
        for (const window of windows) {
          expect(window.end - window.start).toBeCloseTo(schedule.sleepHours, 2);
        }
      }
    }
  });

  it("preserves the intended 24-hour sleep equivalents", () => {
    for (const protocol of forcedDesynchronyProtocolOptions) {
      for (const budget of budgetModes) {
        const schedule = getForcedDesynchronySchedule({
          protocol: protocol.value,
          budget,
        });
        const equivalentSleep =
          (schedule.sleepHours / protocol.protocolLength) * 24;

        expect(equivalentSleep).toBeCloseTo(schedule.equivalentSleepPer24, 1);
      }
    }
  });

  it("disables caffeine masking during forced desynchrony", () => {
    const data = generateSleepData({
      scenario: "forced-desynchrony",
      caffeineEvents: [0, 10, 20],
      forcedDesynchrony: { protocol: "20", budget: "control" },
      step: 1,
    });

    expect(data.every((point) => point.caffeineEffect === 0)).toBe(true);
  });

  it("advances biological time on the near-24-hour pacemaker", () => {
    expect(getForcedDesynchronyBiologicalHour(0)).toBeCloseTo(7, 2);
    expect(getForcedDesynchronyBiologicalHour(24.15)).toBeCloseTo(7, 2);
  });

  it("decouples non-24-hour protocols while T = 24 h stays near-coupled", () => {
    expect(getForcedDesynchronyPhaseDrift(80, "20")).toBeGreaterThan(6);
    expect(getForcedDesynchronyPhaseDrift(85.7, "42.85")).toBeGreaterThan(8);
    expect(getForcedDesynchronyPhaseDrift(72, "24")).toBeLessThan(1);
  });

  it("marks at least one FD point as misaligned and opposing", () => {
    const data = generateSleepData({
      scenario: "forced-desynchrony",
      forcedDesynchrony: { protocol: "20", budget: "control" },
      step: 0.25,
    });

    expect(data.some((point) => point.misaligned)).toBe(true);
    expect(data.some((point) => point.alignmentLabel === "Opposing")).toBe(true);
  });
});
