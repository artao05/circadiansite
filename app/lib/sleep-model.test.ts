import { describe, expect, it } from "vitest";
import {
  caffeineConcentration,
  compareCaffeineSleep,
  forcedDesynchronyProtocolOptions,
  generateSleepData,
  getForcedDesynchronyBiologicalHour,
  getForcedDesynchronyPhaseDrift,
  getForcedDesynchronySchedule,
  getSleepModelHorizon,
  getPredictedSleepWindows,
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
      caffeineDoses: [
        { hour: 0, milligrams: 200 },
        { hour: 10, milligrams: 200 },
        { hour: 20, milligrams: 200 },
      ],
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

describe("paper-grounded caffeine hybrid", () => {
  it("keeps the no-caffeine normal routine close to 11 PM to 7 AM", () => {
    const windows = getPredictedSleepWindows(
      generateSleepData({ scenario: "normal", step: 0.25 }),
    );

    expect(windows[0]?.start).toBeCloseTo(16, 1);
    expect(windows[0]?.end).toBeGreaterThanOrEqual(23.75);
    expect(windows[0]?.end).toBeLessThanOrEqual(24.25);
  });

  it("peaks within about an hour and adds overlapping doses", () => {
    const doses = [{ hour: 8, milligrams: 200 }];
    const concentrationAtPeak = caffeineConcentration(8.9, doses);

    expect(concentrationAtPeak).toBeGreaterThan(caffeineConcentration(8.1, doses));
    expect(concentrationAtPeak).toBeGreaterThan(caffeineConcentration(11, doses));
    expect(caffeineConcentration(9, [...doses, { hour: 8, milligrams: 200 }])).toBeCloseTo(
      caffeineConcentration(9, doses) * 2,
      3,
    );
  });

  it("keeps masking below true pressure", () => {
    const data = generateSleepData({
      scenario: "normal",
      caffeineDoses: [{ hour: 15, milligrams: 400 }],
    });

    expect(data.every((point) => point.feltS <= point.processS)).toBe(true);
  });

  it("predicts more sleep disruption for later and larger doses", () => {
    const baseline = generateSleepData({ scenario: "normal" });
    const morning = generateSleepData({
      scenario: "normal",
      caffeineDoses: [{ hour: 8, milligrams: 200 }],
    });
    const late200 = generateSleepData({
      scenario: "normal",
      caffeineDoses: [{ hour: 15, milligrams: 200 }],
    });
    const late400 = generateSleepData({
      scenario: "normal",
      caffeineDoses: [{ hour: 15, milligrams: 400 }],
    });
    const morningComparison = compareCaffeineSleep(baseline, morning);
    const late200Comparison = compareCaffeineSleep(baseline, late200);
    const late400Comparison = compareCaffeineSleep(baseline, late400);

    expect(late200Comparison.sleepOnsetDelayMinutes).toBeGreaterThanOrEqual(
      morningComparison.sleepOnsetDelayMinutes,
    );
    expect(late400Comparison.sleepOnsetDelayMinutes).toBeGreaterThanOrEqual(
      late200Comparison.sleepOnsetDelayMinutes,
    );
    expect(late400Comparison.sleepDurationChangeMinutes).toBeLessThanOrEqual(
      late200Comparison.sleepDurationChangeMinutes,
    );
  });

  it("returns deterministic caffeine data", () => {
    const options = {
      scenario: "all-nighter" as const,
      caffeineDoses: [{ hour: 20, milligrams: 200 }],
    };

    expect(generateSleepData(options)).toEqual(generateSleepData(options));
  });
});
