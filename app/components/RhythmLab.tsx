"use client";

import { useMemo, useState } from "react";
import * as d3 from "d3";
import { RotateCcw } from "lucide-react";
import { useCircadianTime } from "./CircadianTimeProvider";

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
};

const initialState: RhythmState = {
  period: 24,
  amplitude: 34,
  phase: 12,
};

const controls: Control[] = [
  { key: "period", label: "Period", min: 16, max: 32, step: 1, unit: "h" },
  { key: "amplitude", label: "Amplitude", min: 5, max: 48, step: 1, unit: "" },
  { key: "phase", label: "Current Time (Phase)", min: 0, max: 48, step: 0.5, unit: "h" },
];

export function RhythmLab() {
  const { hour: masterHour } = useCircadianTime();
  const [syncedMasterHour, setSyncedMasterHour] = useState(masterHour);
  const [state, setState] = useState<RhythmState>({
    ...initialState,
    phase: masterHour,
  });
  const effectiveState = useMemo(
    () =>
      syncedMasterHour === masterHour ? state : { ...state, phase: masterHour },
    [masterHour, state, syncedMasterHour],
  );

  if (syncedMasterHour !== masterHour) {
    setSyncedMasterHour(masterHour);
    setState((current) => ({ ...current, phase: masterHour }));
  }

  const chart = useMemo(() => {
    const width = 860;
    const height = 360;
    const margin = { top: 32, right: 110, bottom: 42, left: 24 };
    const x = d3.scaleLinear().domain([0, 48]).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([0, 105]).range([height - margin.bottom, margin.top]);
    
    const melatoninBase = [40, 60, 80, 95, 80, 60, 30, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 14, 13, 12, 15, 20, 25, 30, 40];
    const cortisolBase = [25, 25, 28, 35, 45, 60, 75, 85, 80, 70, 60, 55, 50, 45, 40, 37, 34, 30, 28, 26, 25, 24, 24, 24, 25];
    const cbtBase = [55, 50, 45, 42, 40, 42, 45, 50, 55, 60, 65, 68, 70, 72, 72, 72, 70, 68, 65, 65, 65, 65, 62, 58, 55];
    
    const melatoninInterp = d3.scaleLinear().domain(d3.range(25)).range(melatoninBase);
    const cortisolInterp = d3.scaleLinear().domain(d3.range(25)).range(cortisolBase);
    const cbtInterp = d3.scaleLinear().domain(d3.range(25)).range(cbtBase);

    const mMean = d3.mean(melatoninBase) ?? 30;
    const coMean = d3.mean(cortisolBase) ?? 45;
    const cbMean = d3.mean(cbtBase) ?? 60;

    const generateCurve = (interp: d3.ScaleLinear<number, number, never>, mean: number) => {
      return d3.range(0, 49, 0.5).map((t) => {
        const normTime = ((t % effectiveState.period) / effectiveState.period) * 24;
        const baseVal = interp(normTime);
        const scale = effectiveState.amplitude / 34;
        const rhythm = mean + (baseVal - mean) * scale;
        return { t, value: Math.max(0, Math.min(104, rhythm)) };
      });
    };

    const cbtPoints = generateCurve(cbtInterp, cbMean);
    const cortisolPoints = generateCurve(cortisolInterp, coMean);
    const melatoninPoints = generateCurve(melatoninInterp, mMean);

    const referencePoints = d3.range(0, 49, 0.5).map((t) => {
    const rhythm = 50 + effectiveState.amplitude * Math.sin(((t - 6) / effectiveState.period) * Math.PI * 2);
      return { t, value: Math.max(0, Math.min(104, rhythm)) };
    });

    const line = d3
      .line<{ t: number; value: number }>()
      .x((d) => x(d.t))
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX);
    
    const phaseT = effectiveState.phase;
    const normPhase = ((phaseT % effectiveState.period) / effectiveState.period) * 24;
    const scaleAmp = effectiveState.amplitude / 34;
    
    const phaseMarker = {
      x: x(phaseT),
      cbtY: y(cbMean + (cbtInterp(normPhase) - cbMean) * scaleAmp),
      cortisolY: y(coMean + (cortisolInterp(normPhase) - coMean) * scaleAmp),
      melatoninY: y(mMean + (melatoninInterp(normPhase) - mMean) * scaleAmp),
      refY: y(Math.max(0, Math.min(104, 50 + effectiveState.amplitude * Math.sin(((phaseT - 6) / effectiveState.period) * Math.PI * 2))))
    };
    
    return { 
      width, height, margin,
      cbtPath: line(cbtPoints) ?? "", 
      cortisolPath: line(cortisolPoints) ?? "", 
      melatoninPath: line(melatoninPoints) ?? "", 
      refPath: line(referencePoints) ?? "",
      x, y, phaseMarker
    };
  }, [effectiveState]);

  return (
    <div className="interactive-block rhythm-lab">
      <div className="visual-panel rhythm-panel" aria-label="Interactive rhythm waveform">
        <div className="panel-heading">
          <div className="legend" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.875rem' }}>CBT</span>
            <span style={{ color: '#0ea5e9', fontWeight: 600, fontSize: '0.875rem' }}>Melatonin</span>
            <span style={{ color: '#1f2937', fontWeight: 600, fontSize: '0.875rem' }}>Cortisol</span>
            <span style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <svg width="24" height="4" viewBox="0 0 24 4" style={{ overflow: 'visible' }}><line x1="0" y1="2" x2="24" y2="2" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="5 3" opacity="0.6" /></svg>
              Reference Cycle
            </span>
          </div>
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
          
          <g className="day-night-bg">
            <rect x={chart.x(0)} width={chart.x(6) - chart.x(0)} y={chart.margin.top} height={chart.height - chart.margin.top - chart.margin.bottom} fill="#e5e7eb" opacity="0.6" />
            <rect x={chart.x(22)} width={chart.x(30) - chart.x(22)} y={chart.margin.top} height={chart.height - chart.margin.top - chart.margin.bottom} fill="#e5e7eb" opacity="0.6" />
            <rect x={chart.x(46)} width={chart.x(48) - chart.x(46)} y={chart.margin.top} height={chart.height - chart.margin.top - chart.margin.bottom} fill="#e5e7eb" opacity="0.6" />
          </g>

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
          {/* Reference Cycle */}
          <path d={chart.refPath} fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="8 8" opacity="0.5" />

          {/* Curves */}
          <path d={chart.melatoninPath} fill="none" stroke="#0ea5e9" strokeWidth="3" opacity="0.9" />
          <path d={chart.cortisolPath} fill="none" stroke="#1f2937" strokeWidth="3" opacity="0.9" />
          <path d={chart.cbtPath} fill="none" stroke="#ef4444" strokeWidth="3" opacity="0.9" />

          {/* Phase Marker */}
          <g className="phase-marker">
            <line 
              x1={chart.phaseMarker.x} x2={chart.phaseMarker.x} 
              y1={chart.margin.top} y2={chart.height - chart.margin.bottom} 
              stroke="#6b7280" strokeWidth="2" strokeDasharray="4 4" 
            />
            <circle cx={chart.phaseMarker.x} cy={chart.phaseMarker.refY} r="5" fill="#94a3b8" opacity="0.5" />
            <circle cx={chart.phaseMarker.x} cy={chart.phaseMarker.melatoninY} r="5" fill="#0ea5e9" />
            <circle cx={chart.phaseMarker.x} cy={chart.phaseMarker.cortisolY} r="5" fill="#1f2937" />
            <circle cx={chart.phaseMarker.x} cy={chart.phaseMarker.cbtY} r="5" fill="#ef4444" />
          </g>

          {/* Y-Axes */}
          <g className="y-axes" style={{ fontSize: '10px', fill: '#6b7280' }}>
            {/* Cortisol Axis */}
            <line x1={chart.width - 100} x2={chart.width - 100} y1={chart.y(100)} y2={chart.y(0)} stroke="#d1d5db" />
            <text x={chart.width - 100} y={chart.y(100) - 8} textAnchor="middle" fill="#1f2937" fontWeight="bold">30ug/dl</text>
            <text x={chart.width - 100} y={chart.y(0) + 12} textAnchor="middle" fill="#1f2937" fontWeight="bold">0ug/dl</text>
            <line x1={chart.width - 103} x2={chart.width - 97} y1={chart.y(100)} y2={chart.y(100)} stroke="#d1d5db" />
            <line x1={chart.width - 103} x2={chart.width - 97} y1={chart.y(0)} y2={chart.y(0)} stroke="#d1d5db" />

            {/* CBT Axis */}
            <line x1={chart.width - 60} x2={chart.width - 60} y1={chart.y(100)} y2={chart.y(0)} stroke="#d1d5db" />
            <text x={chart.width - 60} y={chart.y(100) - 8} textAnchor="middle" fill="#ef4444" fontWeight="bold">38°C</text>
            <text x={chart.width - 60} y={chart.y(0) + 12} textAnchor="middle" fill="#ef4444" fontWeight="bold">36°C</text>
            <line x1={chart.width - 63} x2={chart.width - 57} y1={chart.y(100)} y2={chart.y(100)} stroke="#d1d5db" />
            <line x1={chart.width - 63} x2={chart.width - 57} y1={chart.y(0)} y2={chart.y(0)} stroke="#d1d5db" />

            {/* Melatonin Axis */}
            <line x1={chart.width - 20} x2={chart.width - 20} y1={chart.y(100)} y2={chart.y(0)} stroke="#d1d5db" />
            <text x={chart.width - 20} y={chart.y(100) - 8} textAnchor="middle" fill="#0ea5e9" fontWeight="bold">80pmol/l</text>
            <text x={chart.width - 20} y={chart.y(0) + 12} textAnchor="middle" fill="#0ea5e9" fontWeight="bold">0pmol/l</text>
            <line x1={chart.width - 23} x2={chart.width - 17} y1={chart.y(100)} y2={chart.y(100)} stroke="#d1d5db" />
            <line x1={chart.width - 23} x2={chart.width - 17} y1={chart.y(0)} y2={chart.y(0)} stroke="#d1d5db" />
          </g>
        </svg>
      </div>

      <div className="control-panel" aria-label="Rhythm controls">
        {controls.map((control) => (
          <label className="range-control" key={control.key}>
            <span>
              {control.label}
              <strong>
                {effectiveState[control.key]}
                {control.unit}
              </strong>
            </span>
            <input
              type="range"
              min={control.min}
              max={control.max}
              step={control.step}
              value={effectiveState[control.key]}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  [control.key]: Number(event.currentTarget.value),
                }))
              }
              onInput={(event) =>
                setState((current) => ({
                  ...current,
                  [control.key]: Number(event.currentTarget.value),
                }))
              }
            />
          </label>
        ))}
        <p className="microcopy">
          Use the Current Time slider to move the vertical marker across the 48-hour
          period and sample the expected physiological levels at any given point.
        </p>
      </div>
    </div>
  );
}
