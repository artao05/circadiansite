"use client";

import { useMemo, useState } from "react";
import * as d3 from "d3";
import { Info, RotateCcw } from "lucide-react";
import {
  getRhythmCombination,
  rhythmChronotypes,
  rhythmScenarios,
  type RhythmPoint,
  type RhythmScenario,
} from "../content/rhythm-scenarios";
import { useCircadianTime } from "./CircadianTimeProvider";

type NumericControlKey = "period" | "amplitude" | "phase";

type Control = {
  key: NumericControlKey;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  description: string;
};

type RhythmState = {
  period: number;
  amplitude: number;
  phase: number;
  scenarioId: string;
  chronotypeId: string;
};

type CortisolProfileKey = RhythmScenario["cortisolProfile"];

const initialCombination = getRhythmCombination("regular", "neutral");

const initialState: RhythmState = {
  period: initialCombination.model.intrinsicPeriodHours,
  amplitude: 100,
  phase: 12,
  scenarioId: "regular",
  chronotypeId: "neutral",
};

const controls: Control[] = [
  {
    key: "period",
    label: "Cycle length (period)",
    min: 23.8,
    max: 24.8,
    step: 0.05,
    unit: "h",
    description:
      "How long one cycle takes without outside timing cues.",
  },
  {
    key: "amplitude",
    label: "Swing size (amplitude)",
    min: 55,
    max: 115,
    step: 1,
    unit: "%",
    description:
      "How far the signal moves above and below its average.",
  },
  {
    key: "phase",
    label: "Clock time",
    min: 0,
    max: 48,
    step: 0.5,
    unit: "h",
    description:
      "Where the marker sits. Clock time and body time can differ.",
  },
];

const melatoninBase = [
  40, 60, 80, 95, 80, 60, 30, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14,
  13, 12, 15, 20, 25, 30, 40,
];

const cbtBase = [
  55, 50, 45, 42, 40, 42, 45, 50, 55, 60, 65, 68, 70, 72, 72, 72, 70, 68,
  65, 65, 65, 65, 62, 58, 55,
];

const cortisolProfiles: Record<
  CortisolProfileKey,
  { label: string; values: number[]; note: string }
> = {
  reference: {
    label: "Reference cortisol",
    values: [
      25, 25, 28, 35, 45, 60, 75, 85, 80, 70, 60, 55, 50, 45, 40, 37, 34,
      30, 28, 26, 25, 24, 24, 24, 25,
    ],
    note: "Reference daily cortisol profile.",
  },
  aging: {
    label: "Aging cortisol overlay",
    values: [
      42, 43, 48, 58, 74, 92, 104, 101, 90, 82, 74, 68, 63, 58, 54, 51, 48,
      46, 44, 43, 42, 42, 42, 42, 42,
    ],
    note: "Higher baseline and peak with lower swing as a percentage of the maximum.",
  },
  misaligned: {
    label: "Misaligned cortisol example",
    values: [
      36, 37, 40, 46, 55, 66, 74, 76, 72, 68, 63, 59, 55, 52, 50, 48, 46,
      44, 42, 40, 38, 37, 36, 36, 36,
    ],
    note: "Illustrative damped and elevated pattern for circadian disruption.",
  },
};

function positiveModulo(value: number, modulus: number) {
  return ((value % modulus) + modulus) % modulus;
}

function formatClockHour(hour: number | null) {
  if (hour === null) return "n/a";
  const normalized = positiveModulo(hour, 24);
  const wholeHour = Math.floor(normalized);
  const minutes = Math.round((normalized - wholeHour) * 60);
  const displayHour = minutes === 60 ? (wholeHour + 1) % 24 : wholeHour;
  const displayMinutes = minutes === 60 ? 0 : minutes;
  return `${String(displayHour).padStart(2, "0")}:${String(displayMinutes).padStart(2, "0")}`;
}

function formatControlValue(control: Control, value: number) {
  if (control.key === "period") return value.toFixed(2);
  if (control.key === "phase") return value.toFixed(1);
  return Math.round(value).toString();
}

function buildDarkSegments(points: RhythmPoint[]) {
  const segments: { start: number; end: number; opacity: number }[] = [];
  let active: { start: number; luxValues: number[] } | null = null;

  points.forEach((point, index) => {
    const nextHour = points[index + 1]?.hour ?? point.hour + 0.5;
    const isDark = point.lightLux < 20;

    if (isDark && !active) {
      active = { start: point.hour, luxValues: [point.lightLux] };
    } else if (isDark && active) {
      active.luxValues.push(point.lightLux);
    } else if (!isDark && active) {
      const meanLux = d3.mean(active.luxValues) ?? 0;
      segments.push({
        start: active.start,
        end: point.hour,
        opacity: meanLux < 2 ? 0.68 : 0.48,
      });
      active = null;
    }

    if (index === points.length - 1 && active) {
      const meanLux = d3.mean(active.luxValues) ?? 0;
      segments.push({
        start: active.start,
        end: nextHour,
        opacity: meanLux < 2 ? 0.68 : 0.48,
      });
    }
  });

  return segments;
}

function getSelectedScenario(scenarioId: string) {
  return (
    rhythmScenarios.find((scenario) => scenario.id === scenarioId) ??
    rhythmScenarios[0]
  );
}

function getSelectedCombination(state: RhythmState) {
  return getRhythmCombination(state.scenarioId, state.chronotypeId);
}

export function RhythmLab() {
  const { hour: masterHour, setHour } = useCircadianTime();
  const [state, setState] = useState<RhythmState>({
    ...initialState,
    phase: masterHour,
  });

  const effectivePhase = useMemo(() => {
    const normalizedPhase = positiveModulo(Math.round(state.phase), 24);
    if (normalizedPhase === masterHour) return state.phase;

    const currentDayOffset = Math.floor(state.phase / 24) * 24;
    const nextPhase = currentDayOffset + masterHour;
    return nextPhase > 48 ? masterHour : nextPhase;
  }, [masterHour, state.phase]);

  const effectiveState = useMemo(
    () => ({ ...state, phase: effectivePhase }),
    [effectivePhase, state],
  );

  const selectedScenario = getSelectedScenario(state.scenarioId);
  const selectedCombination = getSelectedCombination(state);
  const selectedCortisolProfile =
    cortisolProfiles[selectedScenario.cortisolProfile];

  const chart = useMemo(() => {
    const width = 900;
    const height = 390;
    const margin = { top: 38, right: 118, bottom: 46, left: 28 };
    const x = d3
      .scaleLinear()
      .domain([0, 48])
      .range([margin.left, width - margin.right]);
    const y = d3
      .scaleLinear()
      .domain([0, 105])
      .range([height - margin.bottom, margin.top]);

    const domain = d3.range(25);
    const melatoninInterp = d3
      .scaleLinear()
      .domain(domain)
      .range(melatoninBase);
    const cbtInterp = d3.scaleLinear().domain(domain).range(cbtBase);
    const cortisolInterp = d3
      .scaleLinear()
      .domain(domain)
      .range(selectedCortisolProfile.values);

    const modelInterp = d3
      .scaleLinear()
      .domain(selectedCombination.points.map((point) => point.hour))
      .range(selectedCombination.points.map((point) => point.oscillator))
      .clamp(true);

    const mMean = d3.mean(melatoninBase) ?? 30;
    const cbMean = d3.mean(cbtBase) ?? 60;
    const cortisolMean = d3.mean(selectedCortisolProfile.values) ?? 45;
    const lightSegments = buildDarkSegments(selectedCombination.points);
    const totalPhaseShift = selectedCombination.display.modelPhaseOffsetHours;
    const signalScale =
      (effectiveState.amplitude / 100) * selectedCombination.display.signalScale;
    const hormoneScale = Math.max(0.42, Math.min(1.22, signalScale));

    const sampleHours = d3.range(0, 48.01, 0.5);

    const normalizedHour = (hour: number) =>
      (positiveModulo(hour - totalPhaseShift, effectiveState.period) /
        effectiveState.period) *
      24;

    const physiologyValue = (
      interp: d3.ScaleLinear<number, number, never>,
      mean: number,
      hour: number,
      scale: number,
    ) => {
      const baseValue = interp(normalizedHour(hour));
      return Math.max(0, Math.min(104, mean + (baseValue - mean) * scale));
    };

    const cortisolValue = (hour: number) => {
      const baseValue = cortisolInterp(normalizedHour(hour));
      if (selectedScenario.cortisolProfile === "aging") {
        return Math.max(0, Math.min(104, baseValue));
      }
      const scale =
        selectedScenario.cortisolProfile === "misaligned"
          ? Math.min(0.78, hormoneScale)
          : hormoneScale;
      return Math.max(
        0,
        Math.min(104, cortisolMean + (baseValue - cortisolMean) * scale),
      );
    };

    const cbtPoints = sampleHours.map((t) => ({
      t,
      value: physiologyValue(cbtInterp, cbMean, t, hormoneScale),
    }));
    const melatoninPoints = sampleHours.map((t) => ({
      t,
      value: physiologyValue(melatoninInterp, mMean, t, hormoneScale),
    }));
    const cortisolPoints = sampleHours.map((t) => ({
      t,
      value: cortisolValue(t),
    }));
    const modelPoints = selectedCombination.points.map((point) => ({
      t: point.hour,
      value: point.oscillator,
    }));

    const line = d3
      .line<{ t: number; value: number }>()
      .x((d) => x(d.t))
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    const phaseT = effectiveState.phase;
    const phaseMarker = {
      x: x(phaseT),
      cbtY: y(physiologyValue(cbtInterp, cbMean, phaseT, hormoneScale)),
      cortisolY: y(cortisolValue(phaseT)),
      melatoninY: y(
        physiologyValue(melatoninInterp, mMean, phaseT, hormoneScale),
      ),
      modelY: y(modelInterp(phaseT)),
    };

    const cortisolDayValues = d3.range(0, 24, 0.5).map(cortisolValue);
    const cortisolMin = d3.min(cortisolDayValues) ?? 0;
    const cortisolMax = d3.max(cortisolDayValues) ?? 0;
    const cortisolSwing = cortisolMax - cortisolMin;

    return {
      width,
      height,
      margin,
      cbtPath: line(cbtPoints) ?? "",
      cortisolPath: line(cortisolPoints) ?? "",
      melatoninPath: line(melatoninPoints) ?? "",
      modelPath: line(modelPoints) ?? "",
      x,
      y,
      lightSegments,
      phaseMarker,
      markerHours: [
        {
          key: "dlmo",
          label: "DLMO",
          hour: selectedCombination.metrics.latestDlmoDisplayHour,
          color: "var(--cyan)",
        },
        {
          key: "cbt",
          label: "CBTmin",
          hour: selectedCombination.metrics.latestCbtMinDisplayHour,
          color: "var(--coral)",
        },
      ].filter(
        (marker): marker is {
          key: string;
          label: string;
          hour: number;
          color: string;
        } => marker.hour !== null,
      ),
      cortisolStats: {
        min: cortisolMin,
        max: cortisolMax,
        swing: cortisolSwing,
        relativeSwing: cortisolMax > 0 ? (cortisolSwing / cortisolMax) * 100 : 0,
      },
    };
  }, [
    effectiveState,
    selectedCombination,
    selectedCortisolProfile,
    selectedScenario,
  ]);

  const regularityValue =
    selectedCombination.metrics.esri ??
    selectedCombination.metrics.lightRegularity;
  const regularityLabel =
    selectedCombination.metrics.esri === null ? "Light regularity" : "ESRI";

  return (
    <div className="interactive-block rhythm-lab">
      <div
        className="visual-panel rhythm-panel"
        aria-label="Interactive rhythm waveform"
      >
        <div className="panel-heading rhythm-heading">
          <div className="legend" aria-label="Chart legend">
            <span style={{ color: "var(--coral)" }}>CBT</span>
            <span style={{ color: "var(--cyan)" }}>Melatonin</span>
            <span style={{ color: "var(--ink)" }}>Cortisol</span>
            <span className="model-legend">
              <svg
                width="24"
                height="4"
                viewBox="0 0 24 4"
                style={{ overflow: "visible" }}
                aria-hidden="true"
              >
                <line
                  x1="0"
                  y1="2"
                  x2="24"
                  y2="2"
                  stroke="var(--green)"
                  strokeWidth="2.5"
                  strokeDasharray="5 3"
                  opacity="0.8"
                />
              </svg>
              Model signal
            </span>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={() =>
              setState({
                ...initialState,
                phase: masterHour,
              })
            }
            aria-label="Reset rhythm controls"
            title="Reset rhythm controls"
          >
            <RotateCcw size={18} aria-hidden="true" />
          </button>
        </div>
        <svg viewBox={`0 0 ${chart.width} ${chart.height}`} role="img">
          <title>Rhythm lab chart with model-derived schedule data</title>

          <g className="day-night-bg">
            {chart.lightSegments.map((segment) => (
              <rect
                key={`${segment.start}-${segment.end}`}
                x={chart.x(segment.start)}
                width={chart.x(segment.end) - chart.x(segment.start)}
                y={chart.margin.top}
                height={
                  chart.height - chart.margin.top - chart.margin.bottom
                }
                fill="var(--paper-deep)"
                opacity={segment.opacity}
              />
            ))}
          </g>

          {[0, 12, 24, 36, 48].map((tick) => (
            <g key={tick}>
              <line
                x1={chart.x(tick)}
                x2={chart.x(tick)}
                y1={chart.margin.top - 8}
                y2={chart.height - chart.margin.bottom}
                className="chart-grid"
              />
              <text
                x={chart.x(tick)}
                y={chart.height - chart.margin.bottom + 24}
                className="chart-label"
              >
                {tick}h
              </text>
            </g>
          ))}
          {[25, 50, 75, 100].map((tick) => (
            <line
              key={tick}
              x1={chart.margin.left}
              x2={chart.width - chart.margin.right}
              y1={chart.y(tick)}
              y2={chart.y(tick)}
              className="chart-grid soft"
            />
          ))}

          {chart.markerHours.map((marker) => (
            <g key={marker.key} className="model-marker">
              <line
                x1={chart.x(marker.hour)}
                x2={chart.x(marker.hour)}
                y1={chart.margin.top}
                y2={chart.height - chart.margin.bottom}
                stroke={marker.color}
                strokeWidth="1.5"
                strokeDasharray="3 6"
                opacity="0.5"
              />
              <text
                x={chart.x(marker.hour)}
                y={chart.margin.top - 13}
                fill={marker.color}
              >
                {marker.label}
              </text>
            </g>
          ))}

          <path
            d={chart.modelPath}
            fill="none"
            stroke="var(--green)"
            strokeWidth="3"
            strokeDasharray="8 8"
            opacity="0.78"
          />
          <path
            d={chart.melatoninPath}
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="3"
            opacity="0.9"
          />
          <path
            d={chart.cortisolPath}
            fill="none"
            stroke="var(--ink)"
            strokeWidth="3"
            opacity="0.92"
          />
          <path
            d={chart.cbtPath}
            fill="none"
            stroke="var(--coral)"
            strokeWidth="3"
            opacity="0.9"
          />

          <g className="phase-marker">
            <line
              x1={chart.phaseMarker.x}
              x2={chart.phaseMarker.x}
              y1={chart.margin.top}
              y2={chart.height - chart.margin.bottom}
              stroke="var(--muted)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <circle
              cx={chart.phaseMarker.x}
              cy={chart.phaseMarker.modelY}
              r="5"
              fill="var(--green)"
              opacity="0.85"
            />
            <circle
              cx={chart.phaseMarker.x}
              cy={chart.phaseMarker.melatoninY}
              r="5"
              fill="var(--cyan)"
            />
            <circle
              cx={chart.phaseMarker.x}
              cy={chart.phaseMarker.cortisolY}
              r="5"
              fill="var(--ink)"
            />
            <circle
              cx={chart.phaseMarker.x}
              cy={chart.phaseMarker.cbtY}
              r="5"
              fill="var(--coral)"
            />
          </g>

          <g className="y-axes">
            <line
              x1={chart.width - 104}
              x2={chart.width - 104}
              y1={chart.y(100)}
              y2={chart.y(0)}
              stroke="var(--line)"
            />
            <text
              x={chart.width - 104}
              y={chart.y(100) - 8}
              textAnchor="middle"
              fill="var(--ink)"
            >
              30 µg/dL
            </text>
            <text
              x={chart.width - 104}
              y={chart.y(0) + 13}
              textAnchor="middle"
              fill="var(--ink)"
            >
              0 µg/dL
            </text>

            <line
              x1={chart.width - 64}
              x2={chart.width - 64}
              y1={chart.y(100)}
              y2={chart.y(0)}
              stroke="var(--line)"
            />
            <text
              x={chart.width - 64}
              y={chart.y(100) - 8}
              textAnchor="middle"
              fill="var(--coral)"
            >
              38°C
            </text>
            <text
              x={chart.width - 64}
              y={chart.y(0) + 13}
              textAnchor="middle"
              fill="var(--coral)"
            >
              36°C
            </text>

            <line
              x1={chart.width - 24}
              x2={chart.width - 24}
              y1={chart.y(100)}
              y2={chart.y(0)}
              stroke="var(--line)"
            />
            <text
              x={chart.width - 24}
              y={chart.y(100) - 8}
              textAnchor="middle"
              fill="var(--cyan)"
            >
              80 pmol/L
            </text>
            <text
              x={chart.width - 24}
              y={chart.y(0) + 13}
              textAnchor="middle"
              fill="var(--cyan)"
            >
              0 pmol/L
            </text>
          </g>
        </svg>
      </div>

      <div className="control-panel rhythm-controls" aria-label="Rhythm controls">
        <details className="rhythm-language">
          <summary>Five words for reading a rhythm</summary>
          <p>
            <strong>Period</strong> is cycle length. <strong>Amplitude</strong>
            is swing size. <strong>Phase</strong> is when a peak lands.{" "}
            <strong>Baseline</strong> is the average level. <strong>Variation</strong>
            is the ordinary noise around the pattern.
          </p>
        </details>
        <div className="rhythm-control-group">
          <p className="control-eyebrow">Schedule</p>
          <div className="segmented-control rhythm-choice" role="group">
            {rhythmScenarios.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                className={scenario.id === state.scenarioId ? "selected" : ""}
                aria-pressed={scenario.id === state.scenarioId}
                title={scenario.summary}
                onClick={() =>
                  setState((current) => ({
                    ...current,
                    scenarioId: scenario.id,
                  }))
                }
              >
                {scenario.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rhythm-control-group">
          <p className="control-eyebrow">Chronotype</p>
          <div className="segmented-control rhythm-choice" role="group">
            {rhythmChronotypes.map((chronotype) => (
              <button
                key={chronotype.id}
                type="button"
                className={
                  chronotype.id === state.chronotypeId ? "selected" : ""
                }
                aria-pressed={chronotype.id === state.chronotypeId}
                title={chronotype.summary}
                onClick={() =>
                  setState((current) => {
                    const nextCombination = getRhythmCombination(
                      current.scenarioId,
                      chronotype.id,
                    );
                    return {
                      ...current,
                      chronotypeId: chronotype.id,
                      period: nextCombination.model.intrinsicPeriodHours,
                    };
                  })
                }
              >
                {chronotype.label}
              </button>
            ))}
          </div>
        </div>

        {controls.map((control) => (
          <label className="range-control" key={control.key}>
            <span>
              <span className="range-label">
                {control.label}
                <span className="custom-tooltip">
                  <Info size={14} aria-hidden="true" />
                  <span className="tooltip-text">{control.description}</span>
                </span>
              </span>
              <strong>
                {formatControlValue(control, effectiveState[control.key])}
                {control.unit}
              </strong>
            </span>
            <input
              type="range"
              min={control.min}
              max={control.max}
              step={control.step}
              value={effectiveState[control.key]}
              onChange={(event) => {
                const value = Number(event.currentTarget.value);
                setState((current) => ({
                  ...current,
                  [control.key]: value,
                }));
                if (control.key === "phase") setHour(value);
              }}
              onInput={(event) => {
                const value = Number(event.currentTarget.value);
                setState((current) => ({
                  ...current,
                  [control.key]: value,
                }));
                if (control.key === "phase") setHour(value);
              }}
            />
          </label>
        ))}

        <div className="rhythm-readout">
          <div>
            <h3>{selectedScenario.label}</h3>
            <p>{selectedScenario.summary}</p>
          </div>
          <details className="rhythm-model-details">
            <summary>Model readout</summary>
            <dl>
            <div>
              <dt>Model amplitude</dt>
              <dd>{selectedCombination.metrics.finalAmplitude.toFixed(2)}</dd>
            </div>
            <div>
              <dt>DLMO</dt>
              <dd>
                {formatClockHour(selectedCombination.metrics.latestDlmoClockHour)}
              </dd>
            </div>
            <div>
              <dt>CBT minimum</dt>
              <dd>
                {formatClockHour(selectedCombination.metrics.latestCbtMinClockHour)}
              </dd>
            </div>
            <div>
              <dt>{regularityLabel}</dt>
              <dd>
                {regularityValue === null
                  ? "n/a"
                  : regularityValue.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt>Cortisol swing</dt>
              <dd>{chart.cortisolStats.relativeSwing.toFixed(0)}% max</dd>
            </div>
            </dl>
            <p className="microcopy">{selectedCortisolProfile.note}</p>
            <p className="microcopy">{selectedScenario.caveat}</p>
          </details>
        </div>
      </div>
    </div>
  );
}
