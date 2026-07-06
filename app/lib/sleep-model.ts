export type SleepScenario = "normal" | "all-nighter" | "forced-desynchrony";

export type ForcedDesynchronyProtocol = "20" | "24" | "42.85";

export type SleepBudgetMode = "control" | "csr";

export type ForcedDesynchronyOptions = {
  protocol: ForcedDesynchronyProtocol;
  budget: SleepBudgetMode;
};

export type AlignmentLabel = "Coupled" | "Decoupling" | "Opposing";

export type SleepDatum = {
  hour: number;
  label: string;
  clockLabel: string;
  dayLabel: string;
  biologicalHour: number;
  biologicalLabel: string;
  protocolCycle: number;
  misaligned: boolean;
  alignmentLabel: AlignmentLabel;
  processS: number;
  feltS: number;
  processC: number;
  caffeineEffect: number;
  netSleepiness: number;
  netAlertness: number;
  isAsleep: boolean;
  state: string;
};

export type SleepWindow = {
  start: number;
  end: number;
  label: string;
};

export type SleepNarrative = {
  eyebrow: string;
  title: string;
  body: string;
};

type GenerateSleepDataOptions = {
  scenario: SleepScenario;
  caffeineEvents?: number[];
  forcedDesynchrony?: Partial<ForcedDesynchronyOptions>;
  step?: number;
};

type ForcedDesynchronyProtocolOption = {
  value: ForcedDesynchronyProtocol;
  label: string;
  shortLabel: string;
  protocolLength: number;
  cycles: number;
  horizon: number;
  description: string;
};

type ForcedDesynchronySchedule = {
  wakeHours: number;
  sleepHours: number;
  equivalentSleepPer24: number;
};

const startClockHour = 7;
const standardHorizon = 48;

export const forcedDesynchronyTau = 24.15;

export const forcedDesynchronyDefaults: ForcedDesynchronyOptions = {
  protocol: "20",
  budget: "control",
};

export const forcedDesynchronyProtocolOptions: ForcedDesynchronyProtocolOption[] = [
  {
    value: "20",
    label: "T = 20 h",
    shortLabel: "20 h",
    protocolLength: 20,
    cycles: 4,
    horizon: 80,
    description: "Fast beat",
  },
  {
    value: "24",
    label: "T = 24 h",
    shortLabel: "24 h",
    protocolLength: 24,
    cycles: 3,
    horizon: 72,
    description: "Near-coupled control",
  },
  {
    value: "42.85",
    label: "T = 42.85 h",
    shortLabel: "42.85 h",
    protocolLength: 42.85,
    cycles: 2,
    horizon: 85.7,
    description: "Slow beat",
  },
];

export const sleepBudgetOptions: Array<{
  value: SleepBudgetMode;
  label: string;
  description: string;
}> = [
  {
    value: "control",
    label: "Control",
    description: "8 h sleep per 24 h",
  },
  {
    value: "csr",
    label: "CSR",
    description: "5.6 h sleep per 24 h",
  },
];

const forcedDesynchronySchedules: Record<
  ForcedDesynchronyProtocol,
  Record<SleepBudgetMode, ForcedDesynchronySchedule>
> = {
  "20": {
    control: { wakeHours: 13.33, sleepHours: 6.67, equivalentSleepPer24: 8 },
    csr: { wakeHours: 15.33, sleepHours: 4.67, equivalentSleepPer24: 5.6 },
  },
  "24": {
    control: { wakeHours: 16, sleepHours: 8, equivalentSleepPer24: 8 },
    csr: { wakeHours: 18.4, sleepHours: 5.6, equivalentSleepPer24: 5.6 },
  },
  "42.85": {
    control: { wakeHours: 28.57, sleepHours: 14.28, equivalentSleepPer24: 8 },
    csr: { wakeHours: 32.85, sleepHours: 10, equivalentSleepPer24: 5.6 },
  },
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function positiveModulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

function normalizeForcedDesynchronyOptions(
  options?: Partial<ForcedDesynchronyOptions>,
): ForcedDesynchronyOptions {
  return {
    protocol: options?.protocol ?? forcedDesynchronyDefaults.protocol,
    budget: options?.budget ?? forcedDesynchronyDefaults.budget,
  };
}

export function getForcedDesynchronyProtocol(
  protocol: ForcedDesynchronyProtocol = forcedDesynchronyDefaults.protocol,
) {
  const found = forcedDesynchronyProtocolOptions.find(
    (option) => option.value === protocol,
  );

  return found ?? forcedDesynchronyProtocolOptions[0];
}

export function getForcedDesynchronySchedule(
  options?: Partial<ForcedDesynchronyOptions>,
) {
  const normalized = normalizeForcedDesynchronyOptions(options);
  return forcedDesynchronySchedules[normalized.protocol][normalized.budget];
}

export function formatHourOfDay(hour: number) {
  const wholeHour = Math.floor(positiveModulo(hour, 24));
  const minutes = Math.round((positiveModulo(hour, 24) - wholeHour) * 60);
  const normalizedHour = (wholeHour + Math.floor(minutes / 60)) % 24;
  const normalizedMinutes = minutes % 60;
  const suffix = normalizedHour >= 12 ? "PM" : "AM";
  const displayHour = normalizedHour % 12 === 0 ? 12 : normalizedHour % 12;

  return `${displayHour}:${normalizedMinutes.toString().padStart(2, "0")} ${suffix}`;
}

export function formatClockTime(hour: number) {
  return formatHourOfDay(startClockHour + hour);
}

export function formatElapsedHours(hour: number) {
  const rounded = round(hour, 1);
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}h`;
}

export function getSleepModelHorizon(
  scenario: SleepScenario,
  forcedDesynchrony?: Partial<ForcedDesynchronyOptions>,
) {
  if (scenario !== "forced-desynchrony") return standardHorizon;

  return getForcedDesynchronyProtocol(
    normalizeForcedDesynchronyOptions(forcedDesynchrony).protocol,
  ).horizon;
}

export function getSleepChartTicks(
  scenario: SleepScenario,
  forcedDesynchrony?: Partial<ForcedDesynchronyOptions>,
) {
  if (scenario !== "forced-desynchrony") {
    return [0, 8, 16, 24, 32, 40, 48];
  }

  const protocol = getForcedDesynchronyProtocol(
    normalizeForcedDesynchronyOptions(forcedDesynchrony).protocol,
  );
  const interval =
    protocol.protocolLength > 30
      ? protocol.protocolLength / 2
      : protocol.protocolLength;
  const ticks: number[] = [];

  for (let tick = 0; tick <= protocol.horizon + 0.001; tick += interval) {
    ticks.push(round(tick, 1));
  }

  if (ticks.at(-1) !== protocol.horizon) {
    ticks.push(protocol.horizon);
  }

  return Array.from(new Set(ticks));
}

export function getSleepWindows(
  scenario: SleepScenario,
  forcedDesynchrony?: Partial<ForcedDesynchronyOptions>,
): SleepWindow[] {
  if (scenario === "forced-desynchrony") {
    const normalized = normalizeForcedDesynchronyOptions(forcedDesynchrony);
    const protocol = getForcedDesynchronyProtocol(normalized.protocol);
    const schedule = getForcedDesynchronySchedule(normalized);

    return Array.from({ length: protocol.cycles }, (_, index) => {
      const cycleStart = protocol.protocolLength * index;
      return {
        start: round(cycleStart + schedule.wakeHours, 2),
        end: round(cycleStart + protocol.protocolLength, 2),
        label: `Cycle ${index + 1} sleep`,
      };
    });
  }

  if (scenario === "all-nighter") {
    return [{ start: 39, end: 48, label: "Recovery sleep" }];
  }

  return [
    { start: 16, end: 24, label: "Night 1 sleep" },
    { start: 40, end: 48, label: "Night 2 sleep" },
  ];
}

function isInsideWindow(hour: number, window: SleepWindow) {
  return hour >= window.start && hour < window.end;
}

function isAsleepAt(hour: number, sleepWindows: SleepWindow[]) {
  return sleepWindows.some((window) => isInsideWindow(hour, window));
}

function circadianWakeDriveFromClockHour(clockHour: number) {
  return clamp(0.5 + 0.5 * Math.sin(((clockHour - 10) * Math.PI * 2) / 24));
}

function circadianWakeDrive(hour: number) {
  return circadianWakeDriveFromClockHour((startClockHour + hour) % 24);
}

function caffeineBlockade(hour: number, caffeineEvents: number[]) {
  return caffeineEvents.reduce((total, eventHour) => {
    const age = hour - eventHour;
    if (age < 0 || age > 7) return total;

    const fastOnset = clamp(age / 0.6);
    const slowFade = Math.exp(-age / 3.2);
    const tail = clamp(1 - age / 7);
    return total + 0.34 * fastOnset * slowFade * tail;
  }, 0);
}

export function getForcedDesynchronyBiologicalHour(hour: number) {
  return positiveModulo(startClockHour + (hour * 24) / forcedDesynchronyTau, 24);
}

function getForcedDesynchronyProtocolHour(
  hour: number,
  protocolValue: ForcedDesynchronyProtocol,
) {
  const protocol = getForcedDesynchronyProtocol(protocolValue);
  const cyclePosition = positiveModulo(hour, protocol.protocolLength);
  return positiveModulo(
    startClockHour + (cyclePosition / protocol.protocolLength) * 24,
    24,
  );
}

function circularHourDistance(firstHour: number, secondHour: number) {
  const difference = Math.abs(firstHour - secondHour) % 24;
  return Math.min(difference, 24 - difference);
}

export function getForcedDesynchronyPhaseDrift(
  hour: number,
  protocolValue: ForcedDesynchronyProtocol = forcedDesynchronyDefaults.protocol,
) {
  return round(
    circularHourDistance(
      getForcedDesynchronyProtocolHour(hour, protocolValue),
      getForcedDesynchronyBiologicalHour(hour),
    ),
    2,
  );
}

function protocolCycleForHour(
  hour: number,
  forcedDesynchrony?: Partial<ForcedDesynchronyOptions>,
) {
  const normalized = normalizeForcedDesynchronyOptions(forcedDesynchrony);
  const protocol = getForcedDesynchronyProtocol(normalized.protocol);
  const boundedHour = Math.min(hour, protocol.horizon - 0.001);
  return Math.min(
    protocol.cycles,
    Math.floor(Math.max(0, boundedHour) / protocol.protocolLength) + 1,
  );
}

function completedWakeEpisodesForHour(
  hour: number,
  forcedDesynchrony?: Partial<ForcedDesynchronyOptions>,
) {
  const normalized = normalizeForcedDesynchronyOptions(forcedDesynchrony);
  const protocol = getForcedDesynchronyProtocol(normalized.protocol);
  const schedule = getForcedDesynchronySchedule(normalized);
  const boundedHour = Math.min(hour, protocol.horizon - 0.001);
  const cycleIndex = Math.floor(Math.max(0, boundedHour) / protocol.protocolLength);
  const cyclePosition = boundedHour - cycleIndex * protocol.protocolLength;

  return cycleIndex + (cyclePosition >= schedule.wakeHours ? 1 : 0);
}

function alignmentLabel({
  scenario,
  protocol,
  hour,
  isAsleep,
  processC,
}: {
  scenario: SleepScenario;
  protocol: ForcedDesynchronyProtocol;
  hour: number;
  isAsleep: boolean;
  processC: number;
}): AlignmentLabel {
  if (scenario !== "forced-desynchrony") {
    if (scenario === "all-nighter" && !isAsleep && processC < 0.28) {
      return "Opposing";
    }

    return "Coupled";
  }

  const drift = getForcedDesynchronyPhaseDrift(hour, protocol);

  if ((isAsleep && processC > 0.62) || (!isAsleep && processC < 0.24)) {
    return "Opposing";
  }

  if (drift < 2) return "Coupled";
  if (drift < 6) return "Decoupling";
  return "Opposing";
}

function stateLabel({
  scenario,
  hour,
  isAsleep,
  processS,
  processC,
  caffeineEffect,
}: {
  scenario: SleepScenario;
  hour: number;
  isAsleep: boolean;
  processS: number;
  processC: number;
  caffeineEffect: number;
}) {
  if (scenario === "forced-desynchrony") {
    if (isAsleep && processC > 0.62) return "Misaligned sleep";
    if (isAsleep) return "Scheduled sleep";
    if (processS > 0.72 && processC < 0.32) return "Opposing drives";
    if (processC > processS + 0.12) return "Clock-supported wake";
    return "Scheduled wake";
  }

  if (isAsleep) return scenario === "all-nighter" ? "Recovery sleep" : "Rest phase";
  if (caffeineEffect > 0.08) return "Caffeine mask";
  if (scenario === "all-nighter" && hour >= 24 && hour < 34 && processC > 0.62) {
    return "Second wind";
  }
  if (processS > 0.78 && processC < 0.35) return "High sleep pressure";
  if (processC > processS + 0.12) return "Clock-supported wakefulness";
  return "Awake";
}

export function generateSleepData({
  scenario,
  caffeineEvents = [],
  forcedDesynchrony,
  step = 0.25,
}: GenerateSleepDataOptions) {
  const normalizedForcedDesynchrony =
    normalizeForcedDesynchronyOptions(forcedDesynchrony);
  const sleepWindows = getSleepWindows(scenario, normalizedForcedDesynchrony);
  const horizon = getSleepModelHorizon(scenario, normalizedForcedDesynchrony);
  const data: SleepDatum[] = [];
  let processS = 0.18;

  for (let hour = 0; hour <= horizon + 0.001; hour += step) {
    const normalizedHour = round(Math.min(hour, horizon), 2);
    const isForcedDesynchrony = scenario === "forced-desynchrony";
    const isAsleep = isAsleepAt(normalizedHour, sleepWindows);
    const isCsr =
      isForcedDesynchrony && normalizedForcedDesynchrony.budget === "csr";
    const target = isAsleep ? (isCsr ? 0.24 : 0.12) : 1;
    const tau = isAsleep ? (isCsr ? 5.2 : 4.2) : isCsr ? 11.8 : 14;
    processS += (target - processS) * (1 - Math.exp(-step / tau));

    const chronicOffset = isCsr
      ? Math.min(
          0.14,
          completedWakeEpisodesForHour(
            normalizedHour,
            normalizedForcedDesynchrony,
          ) * 0.025,
        )
      : 0;
    const effectiveProcessS = clamp(processS + chronicOffset);
    const biologicalHour = isForcedDesynchrony
      ? getForcedDesynchronyBiologicalHour(normalizedHour)
      : positiveModulo(startClockHour + normalizedHour, 24);
    const processC = isForcedDesynchrony
      ? circadianWakeDriveFromClockHour(biologicalHour)
      : circadianWakeDrive(normalizedHour);
    const caffeineEffect = isForcedDesynchrony
      ? 0
      : caffeineBlockade(normalizedHour, caffeineEvents);
    const feltS = clamp(effectiveProcessS - caffeineEffect);
    const netSleepiness = clamp(0.56 * feltS + 0.44 * (1 - processC));
    const netAlertness = clamp(1 - netSleepiness);
    const currentCycle = isForcedDesynchrony
      ? protocolCycleForHour(normalizedHour, normalizedForcedDesynchrony)
      : Math.floor(normalizedHour / 24) + 1;
    const currentAlignmentLabel = alignmentLabel({
      scenario,
      protocol: normalizedForcedDesynchrony.protocol,
      hour: normalizedHour,
      isAsleep,
      processC,
    });
    const misaligned = isForcedDesynchrony && isAsleep && processC > 0.62;

    data.push({
      hour: normalizedHour,
      label: formatElapsedHours(normalizedHour),
      clockLabel: isForcedDesynchrony
        ? `Protocol ${formatElapsedHours(normalizedHour)}`
        : formatClockTime(normalizedHour),
      dayLabel: isForcedDesynchrony
        ? `Protocol cycle ${currentCycle}`
        : normalizedHour < 24
          ? "Day 1"
          : "Day 2",
      biologicalHour: round(biologicalHour, 2),
      biologicalLabel: formatHourOfDay(biologicalHour),
      protocolCycle: currentCycle,
      misaligned,
      alignmentLabel: currentAlignmentLabel,
      processS: round(effectiveProcessS * 100),
      feltS: round(feltS * 100),
      processC: round(processC * 100),
      caffeineEffect: round(caffeineEffect * 100),
      netSleepiness: round(netSleepiness * 100),
      netAlertness: round(netAlertness * 100),
      isAsleep,
      state: stateLabel({
        scenario,
        hour: normalizedHour,
        isAsleep,
        processS: effectiveProcessS,
        processC,
        caffeineEffect,
      }),
    });
  }

  return data;
}

export function getNarrative(
  scenario: SleepScenario,
  currentTime: number,
  forcedDesynchrony?: Partial<ForcedDesynchronyOptions>,
): SleepNarrative {
  if (scenario === "forced-desynchrony") {
    const normalized = normalizeForcedDesynchronyOptions(forcedDesynchrony);
    const protocol = getForcedDesynchronyProtocol(normalized.protocol);
    const schedule = getForcedDesynchronySchedule(normalized);
    const drift = getForcedDesynchronyPhaseDrift(currentTime, normalized.protocol);

    if (normalized.protocol === "24") {
      return {
        eyebrow: "Near-coupled control",
        title: "A 24-hour protocol almost closes the beat.",
        body: "Process S and Process C remain close because the lab schedule is near the pacemaker period. The small drift helps show why forced desynchrony deliberately avoids ordinary 24-hour timing.",
      };
    }

    if (currentTime < protocol.protocolLength) {
      return {
        eyebrow: "First FD cycle",
        title: "The lab day starts by looking familiar.",
        body: `Participants follow a ${protocol.label} schedule with ${schedule.wakeHours} h awake before scheduled sleep. The pacemaker keeps advancing on biological time underneath.`,
      };
    }

    if (drift < 6) {
      return {
        eyebrow: "The beat opens",
        title: "Schedule time and biological time separate.",
        body: "Process S follows the imposed sleep-wake windows, while Process C follows the free-running pacemaker. The same biological phase begins appearing at new levels of sleep pressure.",
      };
    }

    return {
      eyebrow: "Forced desynchrony",
      title: "The confound is visible now.",
      body: "The protocol has pulled time awake and biological night apart. That is the lab trick: researchers can compare circadian phase without holding sleep debt fixed, and sleep debt without holding circadian phase fixed.",
    };
  }

  if (scenario === "all-nighter") {
    if (currentTime < 14) {
      return {
        eyebrow: "All-nighter setup",
        title: "The day still starts normally.",
        body: "Sleep pressure rises through the waking day while the circadian clock supplies enough alerting signal to keep the system upright.",
      };
    }

    if (currentTime < 24) {
      return {
        eyebrow: "Skipped rest phase",
        title: "Process S keeps climbing.",
        body: "The clock expects a night of sleep, but adenosine is not being cleared. The two processes now pull in the same sleepy direction.",
      };
    }

    if (currentTime < 34) {
      return {
        eyebrow: "Second wind",
        title: "The clock can temporarily hide the debt.",
        body: "Morning circadian wake drive returns even though true sleep pressure is still high. This is the classic all-nighter trap: feeling better is not the same as being recovered.",
      };
    }

    if (currentTime < 39) {
      return {
        eyebrow: "Fragile wakefulness",
        title: "The system is running on timing, not recovery.",
        body: "Wake drive may prop up alertness, but sustained sleep pressure makes performance brittle as the day stretches on.",
      };
    }

    return {
      eyebrow: "Recovery sleep",
      title: "Adenosine finally clears.",
      body: "Sleep lets Process S decay, while the circadian rhythm continues its own cycle underneath the recovery window.",
    };
  }

  if (currentTime < 10) {
    return {
      eyebrow: "Normal routine",
      title: "Two forces rise together.",
      body: "Adenosine accumulates while the circadian alerting signal strengthens, so sleep pressure can build without immediately making you sleepy.",
    };
  }

  if (currentTime < 16) {
    return {
      eyebrow: "Afternoon buffer",
      title: "The clock protects wakefulness.",
      body: "Process S is higher than it was in the morning, but Process C is near its daily high and helps oppose sleepiness.",
    };
  }

  if (currentTime < 24) {
    return {
      eyebrow: "Rest phase",
      title: "Sleep pressure drops during sleep.",
      body: "In the model, sleep switches Process S from accumulation to clearance. The clock keeps cycling in the background.",
    };
  }

  if (currentTime < 40) {
    return {
      eyebrow: "Second day",
      title: "The rhythm repeats, but not from zero.",
      body: "After sleep, adenosine is lower, but the next day still depends on the balance between homeostatic pressure and circadian timing.",
    };
  }

  return {
    eyebrow: "Rest phase",
    title: "The second sleep window closes the loop.",
    body: "The repeated pattern is the teaching point: pressure depends on recent sleep, while the clock depends on biological time.",
  };
}
