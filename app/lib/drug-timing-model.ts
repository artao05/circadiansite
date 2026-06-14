export type DrugExposureProfile = {
  id: string;
  label: string;
  halfLifeHours: number;
  peakHours: number;
  tailHours: number;
  copy: string;
};

export type TargetRhythmProfile = {
  label: string;
  peakHour: number;
  widthHours: number;
  baseline: number;
  amplitude: number;
  copy: string;
};

export type CurvePoint = {
  hour: number;
  exposure: number;
  target: number;
  overlap: number;
};

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function formatClockHour(hour: number) {
  const normalized = ((Math.round(hour) % 24) + 24) % 24;
  return `${String(normalized).padStart(2, "0")}:00`;
}

export function hoursSinceDose(hour: number, doseHour: number) {
  return (((hour - doseHour) % 24) + 24) % 24;
}

export function exposureAtHour(
  hour: number,
  doseHour: number,
  profile: DrugExposureProfile,
) {
  const elapsed = hoursSinceDose(hour, doseHour);
  const rise = clamp01(elapsed / Math.max(profile.peakHours, 0.25));
  const decayElapsed = Math.max(0, elapsed - profile.peakHours);
  const decay = Math.pow(0.5, decayElapsed / profile.halfLifeHours);
  const tailFade = elapsed > profile.tailHours ? Math.max(0, 1 - (elapsed - profile.tailHours) / 4) : 1;
  return clamp01(rise * decay * tailFade);
}

export function targetAtHour(hour: number, rhythm: TargetRhythmProfile) {
  const rawDistance = Math.abs(hour - rhythm.peakHour);
  const distance = Math.min(rawDistance, 24 - rawDistance);
  const shaped = Math.max(0, Math.cos((distance / rhythm.widthHours) * (Math.PI / 2)));
  return clamp01(rhythm.baseline + rhythm.amplitude * shaped);
}

export function buildTimingCurve(
  doseHour: number,
  exposureProfile: DrugExposureProfile,
  rhythm: TargetRhythmProfile,
) {
  const points: CurvePoint[] = Array.from({ length: 97 }, (_, index) => {
    const hour = index / 4;
    const exposure = exposureAtHour(hour, doseHour, exposureProfile);
    const target = targetAtHour(hour, rhythm);
    return {
      hour,
      exposure,
      target,
      overlap: exposure * target,
    };
  });
  const targetArea = points.reduce((sum, point) => sum + point.target, 0);
  const overlapArea = points.reduce((sum, point) => sum + point.overlap, 0);
  return {
    points,
    overlapScore: Math.round((overlapArea / Math.max(targetArea, 0.001)) * 100),
  };
}

export function interpretOverlap(score: number, interpretation: {
  low: string;
  medium: string;
  high: string;
}) {
  if (score >= 45) return interpretation.high;
  if (score >= 24) return interpretation.medium;
  return interpretation.low;
}

