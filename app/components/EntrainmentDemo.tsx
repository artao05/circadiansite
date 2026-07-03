"use client";

import { useId, useMemo, useState, type CSSProperties } from "react";
import {
  Activity,
  Bed,
  Clock3,
  Moon,
  RotateCcw,
  SunMedium,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { useCircadianTime } from "./CircadianTimeProvider";

type SignalKey =
  | "lightOff"
  | "sleepStart"
  | "sleepEnd"
  | "lastMeal"
  | "activityPeak";

type SignalSchedule = Record<SignalKey, number>;

type SignalDefinition = {
  key: SignalKey;
  label: string;
  shortLabel: string;
  min: number;
  max: number;
  step: number;
  reference: number;
  icon: LucideIcon;
  color: string;
  description: string;
};

type Preset = {
  id: string;
  label: string;
  schedule: SignalSchedule;
  copy: string;
};

type RhythmKey = "scn" | "sleep" | "metabolic" | "activity";

type RhythmDefinition = {
  id: RhythmKey;
  label: string;
  shortLabel: string;
  cue: string;
  color: string;
  amplitude: number;
  referencePhase: number;
  weights: Partial<Record<SignalKey, number>>;
};

type RhythmModel = RhythmDefinition & {
  phase: number;
  shift: number;
  path: string;
  crestX: number;
  crestY: number;
};

type WavePoint = {
  hour: number;
  x: number;
  y: number;
  positive: number;
};

type AlignmentTone = "aligned" | "shifted" | "mixed" | "split";

type AlignmentStatus = {
  tone: AlignmentTone;
  title: string;
  copy: string;
};

const waveAxis = {
  left: 62,
  right: 710,
  top: 52,
  midY: 178,
  width: 648,
  height: 220,
  coherenceBaseY: 374,
  coherenceHeight: 96,
};

const sampleCount = 121;

const phaseShiftRange = {
  min: -4,
  max: 5,
};

const referenceSchedule: SignalSchedule = {
  lightOff: 22,
  sleepStart: 23,
  sleepEnd: 7,
  lastMeal: 19,
  activityPeak: 15,
};

const signalDefinitions: SignalDefinition[] = [
  {
    key: "lightOff",
    label: "Light low/off",
    shortLabel: "Light",
    min: 18,
    max: 27,
    step: 0.5,
    reference: referenceSchedule.lightOff,
    icon: SunMedium,
    color: "var(--amber)",
    description: "Moves the light-tuned SCN rhythm most strongly.",
  },
  {
    key: "sleepStart",
    label: "Sleep starts",
    shortLabel: "Sleep start",
    min: 20,
    max: 27,
    step: 0.5,
    reference: referenceSchedule.sleepStart,
    icon: Moon,
    color: "var(--violet)",
    description: "Helps mark the start of biological night.",
  },
  {
    key: "sleepEnd",
    label: "Sleep ends",
    shortLabel: "Wake",
    min: 5,
    max: 11,
    step: 0.5,
    reference: referenceSchedule.sleepEnd,
    icon: Bed,
    color: "var(--green)",
    description: "Acts as a morning anchor for the day rhythm.",
  },
  {
    key: "lastMeal",
    label: "Last meal",
    shortLabel: "Meal",
    min: 16,
    max: 24,
    step: 0.5,
    reference: referenceSchedule.lastMeal,
    icon: Utensils,
    color: "var(--coral)",
    description: "Moves the food-tuned metabolic rhythm most strongly.",
  },
  {
    key: "activityPeak",
    label: "Activity peak",
    shortLabel: "Activity",
    min: 7,
    max: 22,
    step: 0.5,
    reference: referenceSchedule.activityPeak,
    icon: Activity,
    color: "var(--cyan)",
    description: "Adds timing evidence for active biological day.",
  },
];

const rhythmDefinitions: RhythmDefinition[] = [
  {
    id: "scn",
    label: "SCN / light rhythm",
    shortLabel: "SCN",
    cue: "light-tuned",
    color: "var(--amber)",
    amplitude: 72,
    referencePhase: 15,
    weights: {
      lightOff: 0.62,
      sleepStart: 0.22,
      sleepEnd: 0.16,
    },
  },
  {
    id: "sleep",
    label: "Sleep / night rhythm",
    shortLabel: "Sleep",
    cue: "night window",
    color: "var(--violet)",
    amplitude: 58,
    referencePhase: 15,
    weights: {
      sleepStart: 0.45,
      sleepEnd: 0.35,
      lightOff: 0.2,
    },
  },
  {
    id: "metabolic",
    label: "Meal / metabolic rhythm",
    shortLabel: "Meal",
    cue: "food-tuned",
    color: "var(--coral)",
    amplitude: 64,
    referencePhase: 15,
    weights: {
      lastMeal: 0.68,
      sleepStart: 0.12,
      activityPeak: 0.12,
      lightOff: 0.08,
    },
  },
  {
    id: "activity",
    label: "Activity / day rhythm",
    shortLabel: "Activity",
    cue: "movement-tuned",
    color: "var(--green)",
    amplitude: 52,
    referencePhase: 15,
    weights: {
      activityPeak: 0.58,
      sleepEnd: 0.22,
      lightOff: 0.12,
      lastMeal: 0.08,
    },
  },
];

const presets: Preset[] = [
  {
    id: "aligned",
    label: "Aligned day",
    schedule: referenceSchedule,
    copy: "Light, sleep, food, and movement all point to a similar day-night pattern.",
  },
  {
    id: "late-light",
    label: "Late light",
    schedule: {
      lightOff: 25,
      sleepStart: 23.5,
      sleepEnd: 7.5,
      lastMeal: 19,
      activityPeak: 15,
    },
    copy: "The light cue moves later while meal and activity signals stay close to the reference day.",
  },
  {
    id: "late-meal",
    label: "Late meal",
    schedule: {
      lightOff: 22,
      sleepStart: 23,
      sleepEnd: 7,
      lastMeal: 22.5,
      activityPeak: 15,
    },
    copy: "The food cue moves later while the light-tuned rhythm stays closer to the reference day.",
  },
  {
    id: "mixed-cues",
    label: "Mixed cues",
    schedule: {
      lightOff: 25,
      sleepStart: 23,
      sleepEnd: 7,
      lastMeal: 22.5,
      activityPeak: 10,
    },
    copy: "Light and food point later while activity points earlier, so the waves no longer crest together.",
  },
  {
    id: "weekend-drift",
    label: "Weekend drift",
    schedule: {
      lightOff: 25.5,
      sleepStart: 25,
      sleepEnd: 10,
      lastMeal: 22,
      activityPeak: 18,
    },
    copy: "Several cues move later together, like a small social time-zone shift.",
  },
];

function normalizeHour(hour: number) {
  return ((hour % 24) + 24) % 24;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundToTenth(value: number) {
  return Math.round(value * 10) / 10;
}

function formatTime(hour: number, showNextDay = false) {
  const rounded = Math.round(hour * 2) / 2;
  const normalized = normalizeHour(rounded);
  const wholeHour = Math.floor(normalized);
  const minutes = normalized % 1 === 0 ? "00" : "30";
  const meridiem = wholeHour < 12 ? "AM" : "PM";
  const displayHour = wholeHour % 12 || 12;
  const nextDay = showNextDay && rounded >= 24 ? " next day" : "";

  return `${displayHour}:${minutes} ${meridiem}${nextDay}`;
}

function formatOffset(offset: number) {
  if (Math.abs(offset) < 0.05) return "0 h";
  return `${offset > 0 ? "+" : ""}${roundToTenth(offset)} h`;
}

function hourToX(hour: number) {
  return waveAxis.left + (hour / 24) * waveAxis.width;
}

function timeToX(hour: number) {
  return hourToX(normalizeHour(hour));
}

function getSignalShift(schedule: SignalSchedule, key: SignalKey) {
  return schedule[key] - referenceSchedule[key];
}

function getSleepSegments(schedule: SignalSchedule) {
  const start = normalizeHour(schedule.sleepStart);
  const end = normalizeHour(schedule.sleepEnd);

  if (start < end) return [{ start, end }];

  return [
    { start, end: 24 },
    { start: 0, end },
  ];
}

function signedCircularDistance(hour: number, reference: number) {
  const diff = normalizeHour(hour) - normalizeHour(reference);
  if (diff > 12) return diff - 24;
  if (diff < -12) return diff + 24;
  return diff;
}

function circularDistance(hour: number, reference: number) {
  return Math.abs(signedCircularDistance(hour, reference));
}

function circularMeanHour(hours: number[]) {
  const vectors = hours.reduce(
    (total, hour) => {
      const angle = (normalizeHour(hour) / 24) * Math.PI * 2;
      return {
        x: total.x + Math.cos(angle),
        y: total.y + Math.sin(angle),
      };
    },
    { x: 0, y: 0 },
  );
  const angle = Math.atan2(vectors.y / hours.length, vectors.x / hours.length);
  return normalizeHour((angle / (Math.PI * 2)) * 24);
}

function buildWaveSamples(phase: number, amplitude: number): WavePoint[] {
  return Array.from({ length: sampleCount }, (_, index) => {
    const hour = (index / (sampleCount - 1)) * 24;
    const angle = ((hour - phase) / 24) * Math.PI * 2;
    const wave = Math.cos(angle);
    const positive = (wave + 1) / 2;

    return {
      hour,
      x: hourToX(hour),
      y: waveAxis.midY - wave * amplitude,
      positive,
    };
  });
}

function pointsToPath(points: Array<{ x: number; y: number }>) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"}${roundToTenth(point.x)} ${roundToTenth(point.y)}`)
    .join(" ");
}

function getRhythmShift(schedule: SignalSchedule, rhythm: RhythmDefinition) {
  const shift = Object.entries(rhythm.weights).reduce(
    (total, [key, weight]) =>
      total + getSignalShift(schedule, key as SignalKey) * (weight ?? 0),
    0,
  );

  return clamp(shift, phaseShiftRange.min, phaseShiftRange.max);
}

function buildRhythms(schedule: SignalSchedule): RhythmModel[] {
  return rhythmDefinitions.map((rhythm) => {
    const shift = getRhythmShift(schedule, rhythm);
    const phase = normalizeHour(rhythm.referencePhase + shift);
    const samples = buildWaveSamples(phase, rhythm.amplitude);

    return {
      ...rhythm,
      phase,
      shift,
      path: pointsToPath(samples),
      crestX: timeToX(phase),
      crestY: waveAxis.midY - rhythm.amplitude,
    };
  });
}

function buildCoherenceArea(rhythms: RhythmModel[]) {
  const topPoints = Array.from({ length: sampleCount }, (_, index) => {
    const hour = (index / (sampleCount - 1)) * 24;
    const values = rhythms.map((rhythm) => {
      const angle = ((hour - rhythm.phase) / 24) * Math.PI * 2;
      return clamp((Math.cos(angle) + 1) / 2, 0.02, 1);
    });
    const product =
      values.reduce((total, value) => total * value, 1) ** (1 / values.length);

    return {
      x: hourToX(hour),
      y: waveAxis.coherenceBaseY - product * waveAxis.coherenceHeight,
    };
  });

  const first = topPoints[0];
  const last = topPoints[topPoints.length - 1];
  return `${pointsToPath(topPoints)} L${roundToTenth(last.x)} ${waveAxis.coherenceBaseY} L${roundToTenth(first.x)} ${waveAxis.coherenceBaseY} Z`;
}

function getStatus(
  rhythms: RhythmModel[],
  coherenceScore: number,
  meanShift: number,
): AlignmentStatus {
  const scn = rhythms.find((rhythm) => rhythm.id === "scn");
  const metabolic = rhythms.find((rhythm) => rhythm.id === "metabolic");
  const activity = rhythms.find((rhythm) => rhythm.id === "activity");
  const sleep = rhythms.find((rhythm) => rhythm.id === "sleep");
  const mealAgainstScn =
    scn && metabolic
      ? signedCircularDistance(metabolic.phase, scn.phase)
      : 0;
  const lightAgainstMeal =
    scn && metabolic
      ? signedCircularDistance(scn.phase, metabolic.phase)
      : 0;
  const activityAgainstScn =
    scn && activity
      ? signedCircularDistance(activity.phase, scn.phase)
      : 0;
  const sleepAgainstScn =
    scn && sleep ? signedCircularDistance(sleep.phase, scn.phase) : 0;

  if (coherenceScore >= 86 && Math.abs(meanShift) < 0.75) {
    return {
      tone: "aligned",
      title: "Aligned wave overlap",
      copy: "The waves crest together, so the simplified combined rhythm is tall and coherent.",
    };
  }

  if (coherenceScore >= 78) {
    return {
      tone: "shifted",
      title: "Coherent but shifted",
      copy: "Several cues move in the same direction, so the waves stay organized while the whole pattern shifts in time.",
    };
  }

  if (mealAgainstScn > 1.25) {
    return {
      tone: "split",
      title: "Late meal split",
      copy: "Meals moved later, so the metabolic rhythm trails while the light-tuned SCN rhythm stays closer to the light schedule.",
    };
  }

  if (lightAgainstMeal > 1.25) {
    return {
      tone: "split",
      title: "Late light split",
      copy: "Light moved later, so the SCN rhythm trails while the food-tuned rhythm stays nearer to the meal schedule.",
    };
  }

  if (Math.abs(activityAgainstScn) > 1.15 || Math.abs(sleepAgainstScn) > 1.15) {
    return {
      tone: "mixed",
      title: "Mixed timing evidence",
      copy: "One rhythm is no longer cresting with the others, so the overlap shape becomes lower and broader.",
    };
  }

  return {
    tone: "mixed",
    title: "Readable, slightly mixed",
    copy: "The signals still mostly agree, but the crests are spread enough to soften the combined rhythm.",
  };
}

function analyzeSchedule(schedule: SignalSchedule, wallHour: number) {
  const rhythms = buildRhythms(schedule);
  const phases = rhythms.map((rhythm) => rhythm.phase);
  const meanPhase = circularMeanHour(phases);
  const spread = Math.max(
    ...phases.map((phase) => circularDistance(phase, meanPhase)),
  );
  const meanShift =
    rhythms.reduce((total, rhythm) => total + rhythm.shift, 0) /
    rhythms.length;
  const coherenceScore = clamp(Math.round(100 - spread * 22), 0, 100);
  const coherencePath = buildCoherenceArea(rhythms);
  const bodyHour = normalizeHour(wallHour - meanShift);

  return {
    rhythms,
    meanPhase,
    spread,
    meanShift,
    coherenceScore,
    coherencePath,
    bodyHour,
    status: getStatus(rhythms, coherenceScore, meanShift),
  };
}

function getCssVars(vars: Record<`--${string}`, string>) {
  return vars as CSSProperties;
}

export function EntrainmentDemo() {
  const id = useId();
  const { hour: wallHour } = useCircadianTime();
  const [schedule, setSchedule] = useState<SignalSchedule>(
    presets[0].schedule,
  );
  const [activePreset, setActivePreset] = useState(presets[0].id);

  const model = useMemo(
    () => analyzeSchedule(schedule, wallHour),
    [schedule, wallHour],
  );
  const selectedPreset = presets.find((preset) => preset.id === activePreset);
  const presetCopy =
    selectedPreset?.copy ??
    "Custom signal mix: the model recomputes how the rhythm waves overlap.";
  const scoreStyle = getCssVars({
    "--alignment-score": `${model.coherenceScore}%`,
  });
  const readoutStatus =
    model.status.tone === "split"
      ? "strain"
      : model.status.tone === "mixed"
        ? "warning"
        : model.status.tone;

  const updateSignal = (key: SignalKey, value: number) => {
    setSchedule((current) => ({ ...current, [key]: value }));
    setActivePreset("custom");
  };

  const applyPreset = (preset: Preset) => {
    setSchedule(preset.schedule);
    setActivePreset(preset.id);
  };

  return (
    <div className="signal-alignment-studio rhythm-overlap-studio interactive-block entrainment">
      <section
        className="entrainment-sandbox overlap-intro"
        aria-labelledby={`${id}-studio-title`}
      >
        <div className="signal-studio-header">
          <div>
            <p className="kicker">Overlapping Rhythms Studio</p>
            <h3 id={`${id}-studio-title`}>
              Your body does not read the clock. It reads overlapping evidence.
            </h3>
            <p className="microcopy">
              Move light, sleep, food, and activity cues to see whether their
              rhythm waves reinforce or split apart. This is an educational
              model, not a measurement of circadian phase or a recommendation
              to change sleep, meals, activity, or medication timing.
            </p>
          </div>
          <div className="studio-reset">
            <button
              className="icon-button"
              type="button"
              aria-label="Reset to aligned day preset"
              onClick={() => applyPreset(presets[0])}
            >
              <RotateCcw size={17} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          className="signal-preset-row"
          role="group"
          aria-label="Signal schedule presets"
        >
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={preset.id === activePreset ? "selected" : ""}
              aria-pressed={preset.id === activePreset}
              onClick={() => applyPreset(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <p className="microcopy">{presetCopy}</p>
      </section>

      <div className="entrainment-grid overlap-grid">
        <section
          className="rhythm-wave-panel entrainment-visual visual-panel"
          aria-labelledby={`${id}-visual-title`}
        >
          <div className="signal-row overlap-heading">
            <span id={`${id}-visual-title`}>
              <Clock3 size={18} aria-hidden="true" />
              24-hour rhythm overlap
            </span>
          </div>

          <svg
            className="studio-svg rhythm-wave-svg"
            viewBox="0 0 760 430"
            role="img"
            aria-labelledby={`${id}-wave-title ${id}-wave-desc`}
          >
            <title id={`${id}-wave-title`}>
              Overlapping circadian rhythm waves
            </title>
            <desc id={`${id}-wave-desc`}>
              Four phase-shifted rhythm waves for light, sleep, meals, and
              activity, with a filled coherence shape that grows when the waves
              overlap.
            </desc>
            <defs>
              <linearGradient id={`${id}-coherence-fill`} x1="0" x2="1">
                <stop offset="0%" stopColor="rgba(84, 214, 194, 0.08)" />
                <stop offset="48%" stopColor="rgba(84, 214, 194, 0.42)" />
                <stop offset="100%" stopColor="rgba(247, 178, 103, 0.34)" />
              </linearGradient>
            </defs>

            <rect
              x={waveAxis.left}
              y={waveAxis.top}
              width={waveAxis.width}
              height={waveAxis.height}
              rx="16"
              fill="var(--surface-soft)"
            />
            <rect
              x={timeToX(6)}
              y={waveAxis.top}
              width={timeToX(18) - timeToX(6)}
              height={waveAxis.height}
              rx="0"
              fill="rgba(247, 178, 103, 0.12)"
            />
            {getSleepSegments(schedule).map((segment) => (
              <rect
                key={`${segment.start}-${segment.end}`}
                x={hourToX(segment.start)}
                y={waveAxis.top}
                width={hourToX(segment.end) - hourToX(segment.start)}
                height={waveAxis.height}
                fill="color-mix(in srgb, var(--ink) 8%, transparent)"
              />
            ))}

            {[0, 6, 12, 18, 24].map((hour) => (
              <g key={hour}>
                <line
                  x1={hourToX(hour)}
                  x2={hourToX(hour)}
                  y1={waveAxis.top - 18}
                  y2={waveAxis.coherenceBaseY + 12}
                  stroke={
                    hour === 0 || hour === 24
                      ? "color-mix(in srgb, var(--ink) 22%, transparent)"
                      : "color-mix(in srgb, var(--ink) 12%, transparent)"
                  }
                />
                <text
                  x={hourToX(hour)}
                  y={waveAxis.top - 26}
                  fill="var(--muted)"
                  fontSize="12"
                  fontWeight="850"
                  textAnchor="middle"
                >
                  {hour === 24 ? "24" : String(hour).padStart(2, "0")}
                </text>
              </g>
            ))}

            <line
              x1={waveAxis.left}
              x2={waveAxis.right}
              y1={waveAxis.midY}
              y2={waveAxis.midY}
              stroke="color-mix(in srgb, var(--ink) 22%, transparent)"
              strokeDasharray="4 8"
            />
            <text
              x={waveAxis.left}
              y={waveAxis.top - 2}
              fill="var(--muted)"
              fontSize="12"
              fontWeight="850"
            >
              rhythm waves
            </text>
            <text
              x={waveAxis.left}
              y={waveAxis.coherenceBaseY - waveAxis.coherenceHeight - 12}
              fill="var(--muted)"
              fontSize="12"
              fontWeight="850"
            >
              combined overlap
            </text>

            <path
              d={model.coherencePath}
              fill={`url(#${id}-coherence-fill)`}
              stroke="rgba(84, 214, 194, 0.6)"
              strokeWidth="2"
            />
            <line
              x1={waveAxis.left}
              x2={waveAxis.right}
              y1={waveAxis.coherenceBaseY}
              y2={waveAxis.coherenceBaseY}
              stroke="color-mix(in srgb, var(--ink) 22%, transparent)"
            />

            {model.rhythms.map((rhythm) => (
              <g key={rhythm.id}>
                <path
                  d={rhythm.path}
                  fill="none"
                  stroke={rhythm.color}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={rhythm.id === "sleep" ? 0.72 : 0.86}
                />
                <circle
                  cx={rhythm.crestX}
                  cy={rhythm.crestY}
                  r="7"
                  fill={rhythm.color}
                  stroke="var(--signal-paper)"
                  strokeWidth="3"
                />
              </g>
            ))}

            {signalDefinitions.map((signal, index) => {
              const x = timeToX(schedule[signal.key]);

              return (
                <g key={signal.key}>
                  <line
                    x1={x}
                    x2={x}
                    y1={waveAxis.top + 8}
                    y2={waveAxis.coherenceBaseY}
                    stroke={signal.color}
                    strokeWidth="1.5"
                    strokeDasharray="3 9"
                    opacity="0.54"
                  />
                  <circle
                    cx={x}
                    cy={waveAxis.coherenceBaseY + 24 + (index % 2) * 22}
                    r="6"
                    fill={signal.color}
                    stroke="var(--signal-paper)"
                    strokeWidth="3"
                  />
                  <text
                    x={x}
                    y={waveAxis.coherenceBaseY + 42 + (index % 2) * 22}
                    fill="var(--ink)"
                    fontSize="11"
                    fontWeight="850"
                    textAnchor="middle"
                  >
                    {signal.shortLabel}
                  </text>
                </g>
              );
            })}

            <line
              x1={timeToX(wallHour)}
              x2={timeToX(wallHour)}
              y1={waveAxis.top - 8}
              y2={waveAxis.coherenceBaseY + 60}
              stroke="color-mix(in srgb, var(--ink) 55%, transparent)"
              strokeWidth="2"
            />
            <text
              x={Math.min(waveAxis.right - 16, timeToX(wallHour) + 10)}
              y={waveAxis.top + 16}
              fill="var(--ink)"
              fontSize="11"
              fontWeight="900"
            >
              now
            </text>
          </svg>

          <div className="rhythm-legend" aria-label="Rhythm wave legend">
            {model.rhythms.map((rhythm) => (
              <div key={rhythm.id}>
                <i style={getCssVars({ "--legend-color": rhythm.color })} />
                <span>{rhythm.label}</span>
                <strong>{formatOffset(rhythm.shift)}</strong>
              </div>
            ))}
          </div>

          <fieldset className="signal-control-grid overlap-control-grid">
            <legend className="sr-only">Edit the timing cues</legend>
            {signalDefinitions.map((signal) => {
              const Icon = signal.icon;
              const controlId = `${id}-${signal.key}`;

              return (
                <label className="range-control" key={signal.key}>
                  <span>
                    <span className="range-label">
                      <Icon size={16} aria-hidden="true" />
                      {signal.label}
                    </span>
                    <strong>
                      <output htmlFor={controlId}>
                        {formatTime(schedule[signal.key], true)}
                      </output>
                    </strong>
                  </span>
                  <input
                    id={controlId}
                    type="range"
                    min={signal.min}
                    max={signal.max}
                    step={signal.step}
                    value={schedule[signal.key]}
                    aria-label={`Adjust ${signal.label.toLowerCase()} time`}
                    onChange={(event) =>
                      updateSignal(
                        signal.key,
                        Number(event.currentTarget.value),
                      )
                    }
                  />
                  <span className="range-description">
                    {signal.description}
                  </span>
                </label>
              );
            })}
          </fieldset>
        </section>

        <aside
          className="alignment-readout overlap-readout explain-panel"
          data-status={readoutStatus}
          aria-live="polite"
        >
          <p className="kicker">Readout</p>
          <h3 data-tone={model.status.tone}>{model.status.title}</h3>
          <p>{model.status.copy}</p>

          <div className="readout-details">
            <div>
              <div className="meter-label">
                <span>Wave coherence</span>
                <span>{model.coherenceScore}%</span>
              </div>
              <div
                className="sandbox-meter"
                role="meter"
                aria-label="Rhythm wave coherence score"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={model.coherenceScore}
              >
                <i style={scoreStyle} />
              </div>
            </div>

            <dl className="readout-facts">
              <div>
                <dt>Phase spread</dt>
                <dd>{roundToTenth(model.spread)} h</dd>
              </div>
              <div>
                <dt>Body-time sketch</dt>
                <dd>{formatTime(model.bodyHour)}</dd>
              </div>
            </dl>

            <p className="readout-note">
              The filled shape is strongest where the wave crests overlap. When
              one cue shifts away from the others, the product-like overlap
              drops.
            </p>
          </div>

          <p className="readout-caveat">
            Real circadian phase depends on light history, sleep, meals,
            activity, and individual biology. This studio only shows why timing
            evidence can agree, drift, or conflict.
          </p>
        </aside>
      </div>
    </div>
  );
}
