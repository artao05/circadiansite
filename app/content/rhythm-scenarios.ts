import rhythmScenarioExport from "../../rhythm-lab-model/generated/rhythm-scenarios.json";

export type RhythmPoint = {
  hour: number;
  lightLux: number;
  oscillator: number;
  processN: number;
};

export type RhythmScenario = {
  id: string;
  label: string;
  summary: string;
  signalScale: number;
  cortisolProfile: "reference" | "aging" | "misaligned";
  caveat: string;
};

export type RhythmChronotype = {
  id: string;
  label: string;
  periodHours: number;
  phaseOffsetHours: number;
  summary: string;
};

export type RhythmCombination = {
  id: string;
  scenarioId: string;
  chronotypeId: string;
  model: {
    name: string;
    intrinsicPeriodHours: number;
    dtHours: number;
    simulationDays: number;
    displayHours: number;
  };
  metrics: {
    finalAmplitude: number;
    meanWindowAmplitude: number | null;
    finalPhaseRadians: number;
    latestCbtMinDisplayHour: number | null;
    latestDlmoDisplayHour: number | null;
    latestCbtMinClockHour: number | null;
    latestDlmoClockHour: number | null;
    esri: number | null;
    lightRegularity: number | null;
    meanLightLux: number;
    maxLightLux: number;
  };
  display: {
    signalScale: number;
    chronotypePhaseOffsetHours: number;
    modelPhaseOffsetHours: number;
  };
  points: RhythmPoint[];
};

export type RhythmScenarioExport = {
  metadata: {
    generatedAt: string;
    generator: string;
    package: string;
    packageVersion: string;
    modelScope: string;
  };
  scenarios: RhythmScenario[];
  chronotypes: RhythmChronotype[];
  combinations: RhythmCombination[];
};

export const rhythmScenarioData =
  rhythmScenarioExport as RhythmScenarioExport;

export const rhythmScenarios = rhythmScenarioData.scenarios;
export const rhythmChronotypes = rhythmScenarioData.chronotypes;

export function getRhythmCombination(
  scenarioId: string,
  chronotypeId: string,
) {
  const combination = rhythmScenarioData.combinations.find(
    (item) =>
      item.scenarioId === scenarioId && item.chronotypeId === chronotypeId,
  );

  if (!combination) {
    throw new Error(
      `Missing rhythm model export for ${scenarioId}/${chronotypeId}`,
    );
  }

  return combination;
}
