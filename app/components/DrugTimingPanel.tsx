"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Clock3,
  FlaskConical,
  HeartPulse,
} from "lucide-react";
import { medicineExamples } from "../content/site-data";
import {
  buildTimingCurve,
  formatClockHour,
  interpretOverlap,
} from "../lib/drug-timing-model";
import type { CurvePoint } from "../lib/drug-timing-model";

const graphWidth = 760;
const graphHeight = 330;
const graphMargin = { top: 34, right: 28, bottom: 48, left: 48 };

function xForHour(hour: number) {
  return (
    graphMargin.left +
    (hour / 24) * (graphWidth - graphMargin.left - graphMargin.right)
  );
}

function yForValue(value: number) {
  return (
    graphHeight -
    graphMargin.bottom -
    value * (graphHeight - graphMargin.top - graphMargin.bottom)
  );
}

function linePath(points: CurvePoint[], key: "exposure" | "target" | "overlap") {
  return points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${xForHour(point.hour).toFixed(2)} ${yForValue(point[key]).toFixed(2)}`;
    })
    .join(" ");
}

function areaPath(points: CurvePoint[]) {
  const top = points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${xForHour(point.hour).toFixed(2)} ${yForValue(point.overlap).toFixed(2)}`;
    })
    .join(" ");
  const last = points[points.length - 1];
  const first = points[0];
  return `${top} L ${xForHour(last.hour).toFixed(2)} ${yForValue(0).toFixed(2)} L ${xForHour(first.hour).toFixed(2)} ${yForValue(0).toFixed(2)} Z`;
}

function StatinVisualLab({
  example,
}: {
  example: (typeof medicineExamples)[number];
}) {
  const [doseHour, setDoseHour] = useState(example.doseWindow.defaultHour);
  const [profileId, setProfileId] = useState(example.exposureProfiles[0].id);

  const profile =
    example.exposureProfiles.find((item) => item.id === profileId) ??
    example.exposureProfiles[0];
  const model = useMemo(
    () => buildTimingCurve(doseHour, profile, example.targetRhythm),
    [doseHour, example.targetRhythm, profile],
  );
  const interpretation = interpretOverlap(
    model.overlapScore,
    example.interpretation,
  );
  const estimatedPeak = (doseHour + profile.peakHours) % 24;
  const overlapTone = Math.max(18, Math.min(92, model.overlapScore));

  return (
    <div className="drug-lab-grid">
      <section
        className="visual-panel body-drug-map"
        style={
          {
            "--liver-alpha": `${0.28 + overlapTone / 160}`,
            "--liver-glow": `${10 + overlapTone * 0.24}px`,
          } as CSSProperties
        }
        aria-label="Simplified body route for statin timing"
      >
        <div className="lab-panel-heading">
          <div>
            <p className="kicker">Body visual</p>
            <h3>{example.bodyTarget.organ}</h3>
          </div>
          <span>{example.bodyTarget.action}</span>
        </div>

        <div className="body-diagram">
          <div className="body-outline" aria-hidden="true">
            <div className="body-head" />
            <div className="body-torso">
              <div className="gut-node">gut</div>
              <div className="blood-node">blood</div>
              <div className="liver-node">liver</div>
            </div>
          </div>
          <div className="route-steps">
            {example.bodyTarget.route.map((step, index) => (
              <div key={step} className={index === 3 ? "active" : ""}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="dose-summary">
          <span>
            Dose time <strong>{formatClockHour(doseHour)}</strong>
          </span>
          <ArrowRight size={18} aria-hidden="true" />
          <span>
            Modeled peak <strong>{formatClockHour(estimatedPeak)}</strong>
          </span>
        </div>
      </section>

      <section className="visual-panel timing-graph-panel">
          <div className="lab-panel-heading">
            <div>
              <p className="kicker">Projection graph</p>
            <h3>{example.overlapLabel}</h3>
          </div>
          <span>{model.overlapScore}% overlap</span>
        </div>

        <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} role="img">
          <title>
            Simplified drug exposure, target rhythm, and overlap projection
          </title>
          <defs>
            <linearGradient id="overlapFill" x1="0" x2="1">
              <stop offset="0%" stopColor="#f7b267" stopOpacity="0.2" />
              <stop offset="65%" stopColor="#ff6b6b" stopOpacity="0.36" />
              <stop offset="100%" stopColor="#54d6c2" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <rect
            x={xForHour(20)}
            y={graphMargin.top}
            width={xForHour(24) - xForHour(20)}
            height={graphHeight - graphMargin.top - graphMargin.bottom}
            className="night-band"
          />
          <rect
            x={xForHour(0)}
            y={graphMargin.top}
            width={xForHour(6) - xForHour(0)}
            height={graphHeight - graphMargin.top - graphMargin.bottom}
            className="night-band"
          />
          {[0, 6, 12, 18, 24].map((hour) => (
            <g key={hour}>
              <line
                x1={xForHour(hour)}
                x2={xForHour(hour)}
                y1={graphMargin.top}
                y2={graphHeight - graphMargin.bottom}
                className="chart-grid"
              />
              <text x={xForHour(hour)} y={graphHeight - 18} className="chart-label">
                {hour === 24 ? "24h" : `${hour}h`}
              </text>
            </g>
          ))}
          {[0.25, 0.5, 0.75, 1].map((tick) => (
            <line
              key={tick}
              x1={graphMargin.left}
              x2={graphWidth - graphMargin.right}
              y1={yForValue(tick)}
              y2={yForValue(tick)}
              className="chart-grid soft"
            />
          ))}
          <path d={areaPath(model.points)} className="overlap-area" />
          <path d={linePath(model.points, "target")} className="target-curve" />
          <path d={linePath(model.points, "exposure")} className="exposure-curve" />
          <path d={linePath(model.points, "overlap")} className="overlap-curve" />
          <line
            x1={xForHour(doseHour)}
            x2={xForHour(doseHour)}
            y1={graphMargin.top - 8}
            y2={graphHeight - graphMargin.bottom}
            className="dose-line"
          />
          <text
            x={Math.min(xForHour(doseHour) + 6, graphWidth - 132)}
            y={graphMargin.top - 13}
            className="dose-label"
          >
            dose {formatClockHour(doseHour)}
          </text>
        </svg>

        <div className="curve-legend">
          <span className="exposure-key">Drug exposure</span>
          <span className="target-key">Target rhythm</span>
          <span className="overlap-key">Overlap</span>
        </div>
      </section>

      <section className="visual-panel lab-controls">
        <div className="range-control">
          <span>
            Dose time <strong>{formatClockHour(doseHour)}</strong>
          </span>
          <input
            type="range"
            min={example.doseWindow.minHour}
            max={example.doseWindow.maxHour}
            step="1"
            value={doseHour}
            onChange={(event) => setDoseHour(Number(event.target.value))}
          />
        </div>
        <div className="preset-row" aria-label="Dose time presets">
          {example.doseWindow.presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={doseHour === preset.hour ? "selected" : ""}
              onClick={() => setDoseHour(preset.hour)}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="profile-toggle" role="group" aria-label="Drug duration profile">
          {example.exposureProfiles.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === profileId ? "selected" : ""}
              onClick={() => setProfileId(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <aside className="visual-panel lab-readout">
        <Clock3 size={20} aria-hidden="true" />
        <strong>In this simplified model</strong>
        <p>{interpretation}</p>
        <p>{profile.copy}</p>
        <p>{example.targetRhythm.copy}</p>
      </aside>
    </div>
  );
}

function PlannedVisualScaffold({
  example,
}: {
  example: (typeof medicineExamples)[number];
}) {
  return (
    <section className="visual-panel planned-visual">
      <div className="lab-panel-heading">
        <div>
          <p className="kicker">Visual model scaffold</p>
          <h3>{example.bodyTarget.organ}</h3>
        </div>
        <FlaskConical size={22} aria-hidden="true" />
      </div>
      <div className="planned-route">
        {example.bodyTarget.route.map((step, index) => (
          <span key={step}>
            {step}
            {index < example.bodyTarget.route.length - 1 ? (
              <ArrowRight size={14} aria-hidden="true" />
            ) : null}
          </span>
        ))}
      </div>
      <div className="planned-mini-graph" aria-hidden="true">
        <i />
        <b />
      </div>
      <p>
        Next pass: this tab can use the same body, exposure, target-rhythm, and
        overlap model now built for statins.
      </p>
    </section>
  );
}

export function DrugTimingPanel() {
  const [selected, setSelected] = useState(medicineExamples[0].name);
  const example =
    medicineExamples.find((item) => item.name === selected) ??
    medicineExamples[0];
  const Icon = example.icon;

  return (
    <div className="interactive-block medicine-panel">
      <div className="medicine-tabs" role="tablist" aria-label="Medication examples">
        {medicineExamples.map((item) => {
          const ItemIcon = item.icon;
          return (
            <button
              key={item.name}
              type="button"
              role="tab"
              aria-selected={item.name === selected}
              className={item.name === selected ? "selected" : ""}
              onClick={() => setSelected(item.name)}
              title={item.name}
            >
              <ItemIcon size={18} aria-hidden="true" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      <div className="medicine-lab-shell">
        <section className="visual-panel medicine-main medicine-copy-panel">
          <div className="medicine-title">
            <Icon size={28} aria-hidden="true" />
            <div>
              <p className="kicker">
                {example.visualMode === "interactive"
                  ? "Example 1: full visual model"
                  : "Reusable visual model coming next"}
              </p>
              <h3>{example.name}</h3>
            </div>
          </div>
          <p>{example.whyTimingAppears}</p>
          <div className="timing-lenses">
            <div>
              <span>Morning lens</span>
              <p>{example.morningLens}</p>
            </div>
            <div>
              <span>Evening lens</span>
              <p>{example.eveningLens}</p>
            </div>
          </div>
        </section>

        <aside className="safety-note">
          <AlertTriangle size={20} aria-hidden="true" />
          <strong>Do not change medication timing from this site.</strong>
          <p>
            Use the label, pharmacist, and clinician guidance. This panel shows
            timing logic in simplified visuals, not what any individual should
            do.
          </p>
          <span>{example.safetyCaveat}</span>
        </aside>
      </div>

      {example.visualMode === "interactive" ? (
        <StatinVisualLab key={example.name} example={example} />
      ) : (
        <PlannedVisualScaffold example={example} />
      )}

      <div className="medicine-source-strip">
        <HeartPulse size={18} aria-hidden="true" />
        <span>
          Sources: {example.sources.join(", ")}. {example.labelCue}
        </span>
      </div>
    </div>
  );
}
