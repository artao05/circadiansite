"use client";

import { useId, useMemo, useState, type CSSProperties } from "react";
import {
  Activity,
  AlarmClock,
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
  markerY: number;
  description: string;
};

type Preset = {
  id: string;
  label: string;
  schedule: SignalSchedule;
  copy: string;
};

type ClockEstimate = {
  id: string;
  label: string;
  cue: string;
  offset: number;
  color: string;
};

type AdaptationStep = {
  day: number;
  offset: number;
  left: number;
};

type AlignmentTone = "aligned" | "shifted" | "mixed" | "split";

type AlignmentStatus = {
  tone: AlignmentTone;
  title: string;
  copy: string;
};

const axis = {
  left: 72,
  right: 668,
  top: 42,
  width: 596,
};

const clusterAxis = {
  min: -3,
  max: 4.5,
  left: 92,
  width: 520,
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
    markerY: 102,
    description:
      "Evening light is a strong timing signal for the brain clock.",
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
    markerY: 126,
    description:
      "The sleep window helps mark biological night in this teaching model.",
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
    markerY: 150,
    description:
      "Wake time is a morning anchor that can pull rhythms earlier or later.",
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
    markerY: 174,
    description:
      "Food timing is a particularly visible cue for metabolic clocks.",
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
    markerY: 198,
    description:
      "Movement and exertion add timing evidence for active biological day.",
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
    copy: "The metabolic cue points later than the light and sleep cues.",
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
    copy: "Light and food point later while activity still points earlier, so the evidence is less unified.",
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

function describeBodyOffset(offset: number) {
  const absoluteOffset = Math.abs(offset);

  if (absoluteOffset < 0.25) {
    return "body time is close to wall time in this model";
  }

  const direction = offset > 0 ? "lags" : "leads";
  return `body time ${direction} wall time by about ${roundToTenth(
    absoluteOffset,
  )} h`;
}

function hourToAxisX(hour: number) {
  return axis.left + (hour / 24) * axis.width;
}

function timeToX(hour: number) {
  return hourToAxisX(normalizeHour(hour));
}

function offsetToX(offset: number) {
  const bounded = clamp(offset, clusterAxis.min, clusterAxis.max);
  return (
    clusterAxis.left +
    ((bounded - clusterAxis.min) / (clusterAxis.max - clusterAxis.min)) *
      clusterAxis.width
  );
}

function offsetToPercent(offset: number) {
  const bounded = clamp(offset, clusterAxis.min, clusterAxis.max);
  return (
    ((bounded - clusterAxis.min) / (clusterAxis.max - clusterAxis.min)) * 100
  );
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

function getSignalShift(schedule: SignalSchedule, key: SignalKey) {
  return schedule[key] - referenceSchedule[key];
}

function buildClockEstimates(schedule: SignalSchedule): ClockEstimate[] {
  const lightShift = getSignalShift(schedule, "lightOff");
  const sleepStartShift = getSignalShift(schedule, "sleepStart");
  const sleepEndShift = getSignalShift(schedule, "sleepEnd");
  const mealShift = getSignalShift(schedule, "lastMeal");
  const activityShift = getSignalShift(schedule, "activityPeak");

  return [
    {
      id: "central",
      label: "Light clock",
      cue: "brain / SCN",
      offset: clamp(
        lightShift * 0.56 + sleepStartShift * 0.24 + sleepEndShift * 0.12,
        clusterAxis.min,
        clusterAxis.max,
      ),
      color: "var(--cyan)",
    },
    {
      id: "sleep",
      label: "Sleep clock",
      cue: "night window",
      offset: clamp(
        sleepStartShift * 0.42 + sleepEndShift * 0.42 + lightShift * 0.16,
        clusterAxis.min,
        clusterAxis.max,
      ),
      color: "var(--violet)",
    },
    {
      id: "metabolic",
      label: "Meal clock",
      cue: "metabolism",
      offset: clamp(
        mealShift * 0.66 +
          sleepStartShift * 0.14 +
          lightShift * 0.1 +
          activityShift * 0.1,
        clusterAxis.min,
        clusterAxis.max,
      ),
      color: "var(--coral)",
    },
    {
      id: "activity",
      label: "Activity clock",
      cue: "movement",
      offset: clamp(
        activityShift * 0.48 +
          sleepEndShift * 0.22 +
          lightShift * 0.14 +
          mealShift * 0.12,
        clusterAxis.min,
        clusterAxis.max,
      ),
      color: "var(--green)",
    },
  ];
}

function getStatus(spread: number, meanOffset: number): AlignmentStatus {
  const absoluteMean = Math.abs(meanOffset);

  if (spread < 0.7 && absoluteMean < 0.7) {
    return {
      tone: "aligned",
      title: "Aligned signal cluster",
      copy: "The simplified clocks sit close together because the cues tell a consistent story about day and night.",
    };
  }

  if (spread < 1.4 && absoluteMean >= 1.2) {
    return {
      tone: "shifted",
      title: "Coherent but shifted",
      copy: "Several cues lean in the same direction, so the model moves body time as a group instead of splitting the clocks apart.",
    };
  }

  if (spread < 1.8) {
    return {
      tone: "mixed",
      title: "Readable, slightly mixed",
      copy: "The cues are still mostly clustered, but one system receives a stronger timing nudge than the others.",
    };
  }

  return {
    tone: "split",
    title: "Split evidence",
    copy: "Different cues point to different biological times, so the model spreads the clock estimates apart.",
  };
}

function analyzeSchedule(schedule: SignalSchedule, wallHour: number) {
  const estimates = buildClockEstimates(schedule);
  const offsets = estimates.map((estimate) => estimate.offset);
  const minOffset = Math.min(...offsets);
  const maxOffset = Math.max(...offsets);
  const spread = maxOffset - minOffset;
  const meanOffset =
    offsets.reduce((total, offset) => total + offset, 0) / offsets.length;
  const alignmentScore = clamp(
    Math.round(100 - spread * 22 - Math.abs(meanOffset) * 8),
    0,
    100,
  );
  const bodyHour = normalizeHour(wallHour - meanOffset);

  return {
    estimates,
    minOffset,
    maxOffset,
    spread,
    meanOffset,
    alignmentScore,
    bodyHour,
    status: getStatus(spread, meanOffset),
  };
}

function buildAdaptationSteps(meanOffset: number): AdaptationStep[] {
  return [1, 2, 3, 4, 5].map((day) => {
    const offset = meanOffset * (1 - Math.exp(-day / 2.25));

    return {
      day,
      offset,
      left: offsetToPercent(offset),
    };
  });
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
  const adaptationSteps = useMemo(
    () => buildAdaptationSteps(model.meanOffset),
    [model.meanOffset],
  );
  const selectedPreset = presets.find((preset) => preset.id === activePreset);
  const presetCopy =
    selectedPreset?.copy ??
    "Custom signal mix: the model recomputes the clock cluster from the edited cues.";
  const scoreStyle = getCssVars({
    "--alignment-score": `${model.alignmentScore}%`,
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
    <div className="signal-alignment-studio interactive-block entrainment">
      <section
        className="entrainment-sandbox"
        aria-labelledby={`${id}-studio-title`}
      >
        <div className="signal-studio-header">
          <div>
            <p className="kicker">Signal Alignment Studio</p>
            <h3 id={`${id}-studio-title`}>
              Your body does not read the clock. It reads evidence.
            </h3>
            <p className="microcopy">
              Move the signals and watch a simplified clock cluster respond.
              The display is educational: it sketches timing evidence, not a
              diagnosis, treatment plan, or medication-timing recommendation.
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

        <fieldset className="signal-control-grid">
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
                    updateSignal(signal.key, Number(event.currentTarget.value))
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

      <div className="entrainment-grid">
        <section
          className="signal-timeline-panel entrainment-visual visual-panel"
          aria-labelledby={`${id}-visual-title`}
        >
          <div className="signal-row">
            <span id={`${id}-visual-title`}>
              <Clock3 size={18} aria-hidden="true" />
              Wall time schedule
            </span>
            <span>
              <AlarmClock size={18} aria-hidden="true" />
              Body time estimate
            </span>
          </div>

          <svg
            className="studio-svg timeline-svg"
            viewBox="0 0 720 238"
            role="img"
            aria-labelledby={`${id}-timeline-title ${id}-timeline-desc`}
          >
            <title id={`${id}-timeline-title`}>
              Twenty-four hour wall-time signal schedule
            </title>
            <desc id={`${id}-timeline-desc`}>
              A wall-time ruler showing light, sleep, meal, and activity cues
              across one day.
            </desc>
            <rect
              x={axis.left}
              y="50"
              width={axis.width}
              height="22"
              rx="11"
              fill="rgba(16, 24, 32, 0.08)"
            />
            <rect
              x={timeToX(6)}
              y="50"
              width={timeToX(18) - timeToX(6)}
              height="22"
              rx="11"
              fill="rgba(247, 178, 103, 0.3)"
            />
            {getSleepSegments(schedule).map((segment) => (
              <rect
                key={`${segment.start}-${segment.end}`}
                x={hourToAxisX(segment.start)}
                y="78"
                width={hourToAxisX(segment.end) - hourToAxisX(segment.start)}
                height="14"
                rx="7"
                fill="rgba(159, 140, 255, 0.36)"
              />
            ))}
            {[0, 6, 12, 18, 24].map((hour) => (
              <g key={hour}>
                <line
                  x1={axis.left + (hour / 24) * axis.width}
                  x2={axis.left + (hour / 24) * axis.width}
                  y1="42"
                  y2="212"
                  stroke="rgba(16, 24, 32, 0.12)"
                />
                <text
                  x={axis.left + (hour / 24) * axis.width}
                  y="32"
                  fill="var(--muted)"
                  fontSize="12"
                  fontWeight="800"
                  textAnchor="middle"
                >
                  {hour === 24 ? "24" : String(hour).padStart(2, "0")}
                </text>
              </g>
            ))}
            <text
              x="18"
              y="65"
              fill="var(--muted)"
              fontSize="12"
              fontWeight="800"
            >
              daylight
            </text>
            <text
              x="18"
              y="90"
              fill="var(--muted)"
              fontSize="12"
              fontWeight="800"
            >
              sleep
            </text>
            {signalDefinitions.map((signal) => {
              const x = timeToX(schedule[signal.key]);
              const shift = getSignalShift(schedule, signal.key);

              return (
                <g key={signal.key}>
                  <line
                    x1={x}
                    x2={x}
                    y1="96"
                    y2={signal.markerY}
                    stroke={signal.color}
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx={x}
                    cy={signal.markerY}
                    r="7"
                    fill={signal.color}
                    stroke="var(--control-bg)"
                    strokeWidth="3"
                  />
                  <text
                    x={x}
                    y={signal.markerY + 24}
                    fill="var(--ink)"
                    fontSize="12"
                    fontWeight="800"
                    textAnchor="middle"
                  >
                    {signal.shortLabel}
                  </text>
                  <text
                    x={x}
                    y={signal.markerY + 39}
                    fill="var(--muted)"
                    fontSize="11"
                    textAnchor="middle"
                  >
                    {formatOffset(shift)}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="clock-cluster-section">
            <div className="signal-row">
              <span>Clock cluster</span>
              <span>{formatOffset(model.meanOffset)} average shift</span>
            </div>
            <svg
              className="studio-svg cluster-svg"
              viewBox="0 0 720 278"
              role="img"
              aria-labelledby={`${id}-cluster-title ${id}-cluster-desc`}
            >
              <title id={`${id}-cluster-title`}>
                Wall time versus body time clock cluster
              </title>
              <desc id={`${id}-cluster-desc`}>
                Four estimated tissue clocks arranged by phase offset from wall
                time.
              </desc>
              <rect
                x={offsetToX(model.minOffset)}
                y="34"
                width={offsetToX(model.maxOffset) - offsetToX(model.minOffset)}
                height="204"
                rx="10"
                fill="rgba(255, 107, 107, 0.14)"
              />
              {[-3, -2, -1, 0, 1, 2, 3, 4].map((offset) => (
                <g key={offset}>
                  <line
                    x1={offsetToX(offset)}
                    x2={offsetToX(offset)}
                    y1="28"
                    y2="244"
                    stroke={
                      offset === 0
                        ? "rgba(16, 24, 32, 0.34)"
                        : "rgba(16, 24, 32, 0.1)"
                    }
                    strokeWidth={offset === 0 ? 2 : 1}
                  />
                  <text
                    x={offsetToX(offset)}
                    y="266"
                    fill="var(--muted)"
                    fontSize="12"
                    fontWeight="800"
                    textAnchor="middle"
                  >
                    {offset > 0 ? `+${offset}` : offset}
                  </text>
                </g>
              ))}
              <text
                x={offsetToX(0)}
                y="18"
                fill="var(--ink)"
                fontSize="12"
                fontWeight="900"
                textAnchor="middle"
              >
                wall time
              </text>
              <text
                x={clusterAxis.left}
                y="266"
                fill="var(--muted)"
                fontSize="12"
                fontWeight="800"
                textAnchor="end"
              >
                earlier
              </text>
              <text
                x={clusterAxis.left + clusterAxis.width}
                y="266"
                fill="var(--muted)"
                fontSize="12"
                fontWeight="800"
                textAnchor="start"
              >
                later
              </text>
              {model.estimates.map((estimate, index) => {
                const y = 58 + index * 52;
                const x = offsetToX(estimate.offset);

                return (
                  <g key={estimate.id}>
                    <text
                      x="18"
                      y={y + 5}
                      fill="var(--ink)"
                      fontSize="13"
                      fontWeight="900"
                    >
                      {estimate.label}
                    </text>
                    <text
                      x="18"
                      y={y + 22}
                      fill="var(--muted)"
                      fontSize="11"
                      fontWeight="700"
                    >
                      {estimate.cue}
                    </text>
                    <line
                      x1={offsetToX(0)}
                      x2={x}
                      y1={y}
                      y2={y}
                      stroke={estimate.color}
                      strokeWidth="4"
                      strokeLinecap="round"
                      opacity="0.38"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r="10"
                      fill={estimate.color}
                      stroke="var(--control-bg)"
                      strokeWidth="4"
                    />
                    <text
                      x={Math.min(678, x + 18)}
                      y={y + 5}
                      fill="var(--ink)"
                      fontSize="12"
                      fontWeight="800"
                    >
                      {formatOffset(estimate.offset)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div
            className="adaptation-strip"
            aria-label="Illustrative repeated cue response"
          >
            <div className="signal-row">
              <span>Repeated cues</span>
              <span>illustrative response</span>
            </div>
            <div className="adaptation-days">
              {adaptationSteps.map((step) => (
                <div className="adaptation-day" key={step.day}>
                  <span>Day {step.day}</span>
                  <div className="adaptation-track" aria-hidden="true">
                    <i
                      style={getCssVars({
                        "--response-left": `${step.left}%`,
                      })}
                    />
                  </div>
                  <strong>{formatOffset(step.offset)}</strong>
                </div>
              ))}
            </div>
            <p>
              The marker moves partway toward repeated timing evidence instead
              of jumping instantly.
            </p>
          </div>
        </section>

        <aside
          className="alignment-readout explain-panel"
          data-status={readoutStatus}
          aria-live="polite"
        >
          <p className="kicker">Readout</p>
          <h3 data-tone={model.status.tone}>
            {model.status.title}
          </h3>
          <p>{model.status.copy}</p>

          <div className="readout-details">
            <div className="readout-time-grid">
              <div>
                <span className="readout-label">Wall time</span>
                <strong className="readout-time">
                  {formatTime(wallHour)}
                </strong>
              </div>
              <div>
                <span className="readout-label">
                  Model body time
                </span>
                <strong className="readout-time">
                  {formatTime(model.bodyHour)}
                </strong>
              </div>
            </div>

            <p className="readout-note">
              At the current wall-time marker, {describeBodyOffset(model.meanOffset)}.
            </p>

            <div>
              <div className="meter-label">
                <span>Signal alignment</span>
                <span>{model.alignmentScore}%</span>
              </div>
              <div
                className="sandbox-meter"
                role="meter"
                aria-label="Signal alignment score"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={model.alignmentScore}
              >
                <i style={scoreStyle} />
              </div>
            </div>

            <dl className="readout-facts">
              <div>
                <dt>Cluster spread</dt>
                <dd>
                  {roundToTenth(model.spread)} h
                </dd>
              </div>
              <div>
                <dt>Concept</dt>
                <dd>
                  Entrainment
                </dd>
              </div>
            </dl>
          </div>

          <p className="readout-caveat">
            Entrainment means biological rhythms lock onto repeated signals.
            Real circadian phase requires measurement and clinical context; this
            studio only shows why timing evidence can agree, drift, or conflict.
          </p>
        </aside>
      </div>
    </div>
  );
}
