"use client";

import { useMemo, useState } from "react";
import * as d3 from "d3";
import { RotateCcw } from "lucide-react";

type Control = {
  key: keyof RhythmState;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
};

type RhythmState = {
  period: number;
  amplitude: number;
  phase: number;
  baseline: number;
  noise: number;
};

const initialState: RhythmState = {
  period: 24,
  amplitude: 34,
  phase: 6,
  baseline: 52,
  noise: 6,
};

const controls: Control[] = [
  { key: "period", label: "Period", min: 16, max: 32, step: 1, unit: "h" },
  { key: "amplitude", label: "Amplitude", min: 5, max: 48, step: 1, unit: "" },
  { key: "phase", label: "Phase", min: 0, max: 24, step: 1, unit: ":00" },
  { key: "baseline", label: "Baseline", min: 20, max: 80, step: 1, unit: "" },
  { key: "noise", label: "Noise", min: 0, max: 18, step: 1, unit: "" },
];

function noiseAt(index: number, strength: number) {
  const wave = Math.sin(index * 1.73) * 0.55 + Math.sin(index * 0.41) * 0.45;
  return wave * strength;
}

export function RhythmLab() {
  const [state, setState] = useState<RhythmState>(initialState);

  const chart = useMemo(() => {
    const width = 860;
    const height = 360;
    const margin = { top: 24, right: 28, bottom: 42, left: 52 };
    const x = d3.scaleLinear().domain([0, 48]).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([0, 105]).range([height - margin.bottom, margin.top]);
    const points = d3.range(0, 49, 0.5).map((t, index) => {
      const rhythm =
        state.baseline +
        state.amplitude *
          Math.sin(((t - state.phase) / state.period) * Math.PI * 2) +
        noiseAt(index, state.noise);
      return { t, value: Math.max(0, Math.min(104, rhythm)) };
    });
    const line = d3
      .line<(typeof points)[number]>()
      .x((d) => x(d.t))
      .y((d) => y(d.value))
      .curve(d3.curveCatmullRom.alpha(0.45));
    const baselinePath = `M ${x(0)} ${y(state.baseline)} L ${x(48)} ${y(state.baseline)}`;
    return { width, height, points, path: line(points) ?? "", x, y, baselinePath };
  }, [state]);

  return (
    <div className="interactive-block rhythm-lab">
      <div className="visual-panel rhythm-panel" aria-label="Interactive rhythm waveform">
        <div className="panel-heading">
          <span>Two-day signal</span>
          <button
            className="icon-button"
            type="button"
            onClick={() => setState(initialState)}
            aria-label="Reset rhythm controls"
            title="Reset rhythm controls"
          >
            <RotateCcw size={18} aria-hidden="true" />
          </button>
        </div>
        <svg viewBox={`0 0 ${chart.width} ${chart.height}`} role="img">
          <title>Interactive circadian rhythm waveform</title>
          <defs>
            <linearGradient id="rhythmStroke" x1="0" x2="1">
              <stop offset="0%" stopColor="#f7b267" />
              <stop offset="55%" stopColor="#54d6c2" />
              <stop offset="100%" stopColor="#ff6b6b" />
            </linearGradient>
          </defs>
          {[0, 12, 24, 36, 48].map((tick) => (
            <g key={tick}>
              <line
                x1={chart.x(tick)}
                x2={chart.x(tick)}
                y1="24"
                y2="318"
                className="chart-grid"
              />
              <text x={chart.x(tick)} y="342" className="chart-label">
                {tick}h
              </text>
            </g>
          ))}
          {[25, 50, 75, 100].map((tick) => (
            <line
              key={tick}
              x1="52"
              x2="832"
              y1={chart.y(tick)}
              y2={chart.y(tick)}
              className="chart-grid soft"
            />
          ))}
          <path d={chart.baselinePath} className="baseline-line" />
          <path d={chart.path} className="rhythm-line" />
          {chart.points
            .filter((point) => point.t % 12 === 0)
            .map((point) => (
              <circle
                key={point.t}
                cx={chart.x(point.t)}
                cy={chart.y(point.value)}
                r="5"
                className="rhythm-dot"
              />
            ))}
        </svg>
      </div>

      <div className="control-panel" aria-label="Rhythm controls">
        {controls.map((control) => (
          <label className="range-control" key={control.key}>
            <span>
              {control.label}
              <strong>
                {state[control.key]}
                {control.unit}
              </strong>
            </span>
            <input
              type="range"
              min={control.min}
              max={control.max}
              step={control.step}
              value={state[control.key]}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  [control.key]: Number(event.target.value),
                }))
              }
            />
          </label>
        ))}
        <p className="microcopy">
          Period is cycle length. Amplitude is swing size. Phase is where the
          wave lands in the day. Baseline is the average level. Noise is the
          messy part that makes biology look real.
        </p>
      </div>
    </div>
  );
}

