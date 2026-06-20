export type SleepScenario = "normal" | "all-nighter";

export type SleepDatum = {
  hour: number;
  label: string;
  clockLabel: string;
  dayLabel: string;
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
  step?: number;
};

const startClockHour = 7;
const maxHour = 48;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function formatClockTime(hour: number) {
  const absoluteHour = (startClockHour + hour) % 24;
  const wholeHour = Math.floor(absoluteHour);
  const minutes = Math.round((absoluteHour - wholeHour) * 60);
  const normalizedHour = (wholeHour + Math.floor(minutes / 60)) % 24;
  const normalizedMinutes = minutes % 60;
  const suffix = normalizedHour >= 12 ? "PM" : "AM";
  const displayHour = normalizedHour % 12 === 0 ? 12 : normalizedHour % 12;

  return `${displayHour}:${normalizedMinutes.toString().padStart(2, "0")} ${suffix}`;
}

export function getSleepWindows(scenario: SleepScenario): SleepWindow[] {
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

function circadianWakeDrive(hour: number) {
  const clockHour = (startClockHour + hour) % 24;
  return clamp(0.5 + 0.5 * Math.sin(((clockHour - 10) * Math.PI * 2) / 24));
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
  step = 0.25,
}: GenerateSleepDataOptions) {
  const sleepWindows = getSleepWindows(scenario);
  const data: SleepDatum[] = [];
  let processS = 0.18;

  for (let hour = 0; hour <= maxHour + 0.001; hour += step) {
    const normalizedHour = round(hour, 2);
    const isAsleep = isAsleepAt(normalizedHour, sleepWindows);
    const target = isAsleep ? 0.12 : 1;
    const tau = isAsleep ? 4.2 : 14;
    processS += (target - processS) * (1 - Math.exp(-step / tau));

    const processC = circadianWakeDrive(normalizedHour);
    const caffeineEffect = caffeineBlockade(normalizedHour, caffeineEvents);
    const feltS = clamp(processS - caffeineEffect);
    const netSleepiness = clamp(0.56 * feltS + 0.44 * (1 - processC));
    const netAlertness = clamp(1 - netSleepiness);

    data.push({
      hour: normalizedHour,
      label: `${round(normalizedHour, 1)}h`,
      clockLabel: formatClockTime(normalizedHour),
      dayLabel: normalizedHour < 24 ? "Day 1" : "Day 2",
      processS: round(processS * 100),
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
        processS,
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
): SleepNarrative {
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
