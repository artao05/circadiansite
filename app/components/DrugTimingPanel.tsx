"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Clock3,
  Droplets,
  FlaskConical,
  HeartPulse,
  Moon,
  Sunrise,
  Utensils,
  Zap,
} from "lucide-react";
import { medicineExamples } from "../content/site-data";
import {
  buildTimingCurve,
  exposureWindowScore,
  formatClockHour,
  interpretOverlap,
} from "../lib/drug-timing-model";
import type { CurvePoint, DrugExposureProfile } from "../lib/drug-timing-model";
import { useCircadianTime } from "./CircadianTimeProvider";

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

function timelinePercent(hour: number) {
  return `${((((hour % 24) + 24) % 24) / 24) * 100}%`;
}

function timelineSegments(startHour: number, durationHours: number) {
  const start = ((startHour % 24) + 24) % 24;
  const duration = Math.min(Math.max(durationHours, 0), 24);
  if (duration >= 24) return [{ left: 0, width: 100 }];
  const end = start + duration;
  if (end <= 24) {
    return [{ left: (start / 24) * 100, width: (duration / 24) * 100 }];
  }
  return [
    { left: (start / 24) * 100, width: ((24 - start) / 24) * 100 },
    { left: 0, width: ((end - 24) / 24) * 100 },
  ];
}

function bodyTargetKind(example: (typeof medicineExamples)[number]) {
  if (example.name === "Anticoagulants") return "vascular";
  return "liver";
}

const visualExampleOrder = [
  "Short-acting statins",
  "Anticoagulants",
  "ADHD medicines",
  "Sleep aids",
  "Acid reflux medicines",
];

function exampleOrdinal(example: (typeof medicineExamples)[number]) {
  if (example.visualMode !== "interactive") return null;
  const orderedIndex = visualExampleOrder.indexOf(example.name);
  if (orderedIndex >= 0) return orderedIndex + 1;
  const interactiveIndex = medicineExamples
    .filter((item) => item.visualMode === "interactive")
    .findIndex((item) => item.name === example.name);
  return interactiveIndex >= 0 ? interactiveIndex + 1 : null;
}

function getInitialProfile(example: (typeof medicineExamples)[number]) {
  return example.exposureProfiles[0];
}

function clampHour(hour: number, min: number, max: number) {
  return Math.min(max, Math.max(min, hour));
}

function useDrugProfile(example: (typeof medicineExamples)[number]) {
  const { hour: masterHour } = useCircadianTime();
  const syncedDoseHour = clampHour(
    masterHour,
    example.doseWindow.minHour,
    example.doseWindow.maxHour,
  );
  const [doseState, setDoseState] = useState({
    sourceHour: masterHour,
    doseHour: syncedDoseHour,
  });
  const [profileId, setProfileId] = useState(getInitialProfile(example).id);
  const profile =
    example.exposureProfiles.find((item) => item.id === profileId) ??
    getInitialProfile(example);
  const doseHour =
    doseState.sourceHour === masterHour ? doseState.doseHour : syncedDoseHour;

  if (doseState.sourceHour !== masterHour) {
    setDoseState({ sourceHour: masterHour, doseHour: syncedDoseHour });
  }

  return {
    doseHour,
    setDoseHour: (nextHour: number) =>
      setDoseState({ sourceHour: masterHour, doseHour: nextHour }),
    profile,
    profileId,
    setProfileId,
  };
}

function DoseControls({
  example,
  doseHour,
  setDoseHour,
  profile,
  profileId,
  setProfileId,
  profileLabel,
}: {
  example: (typeof medicineExamples)[number];
  doseHour: number;
  setDoseHour: (hour: number) => void;
  profile: DrugExposureProfile;
  profileId: string;
  setProfileId: (id: string) => void;
  profileLabel: string;
}) {
  return (
    <>
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
          onChange={(event) => setDoseHour(Number(event.currentTarget.value))}
          onInput={(event) => setDoseHour(Number(event.currentTarget.value))}
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
      <div className="profile-toggle" role="group" aria-label={profileLabel}>
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
      <p className="control-caption">{profile.copy}</p>
    </>
  );
}

function DrugVisualLab({
  example,
}: {
  example: (typeof medicineExamples)[number];
}) {
  const { doseHour, setDoseHour, profile, profileId, setProfileId } =
    useDrugProfile(example);
  const [absorptionId, setAbsorptionId] = useState(
    example.absorptionOptions?.[0]?.id ?? "standard",
  );

  const absorption =
    example.absorptionOptions?.find((item) => item.id === absorptionId) ??
    example.absorptionOptions?.[0];
  const model = useMemo(
    () =>
      buildTimingCurve(doseHour, profile, example.targetRhythm, {
        exposureMultiplier: absorption?.multiplier,
      }),
    [absorption?.multiplier, doseHour, example.targetRhythm, profile],
  );
  const interpretation = interpretOverlap(
    model.overlapScore,
    example.interpretation,
  );
  const estimatedPeak = (doseHour + profile.peakHours) % 24;
  const overlapTone = Math.max(18, Math.min(92, model.overlapScore));
  const targetKind = bodyTargetKind(example);
  const absorptionTone = absorption ? 0.22 + absorption.multiplier * 0.36 : 0.42;
  const profileLabel =
    example.exposureProfiles.length > 1 ? "Drug duration profile" : "Exposure profile";

  return (
    <div className="drug-lab-grid">
      <section
        className={`visual-panel body-drug-map ${targetKind}-body-map`}
        style={
          {
            "--target-alpha": `${0.28 + overlapTone / 160}`,
            "--target-glow": `${10 + overlapTone * 0.24}px`,
            "--absorption-alpha": `${absorptionTone}`,
          } as CSSProperties
        }
        aria-label={`Simplified body route for ${example.name.toLowerCase()} timing`}
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
            <div className={`body-torso ${targetKind}-torso`}>
              <div className="gut-node">gut</div>
              <div className="blood-node">blood</div>
              <div className="target-node">
                {targetKind === "vascular" ? "vessels" : "liver"}
              </div>
            </div>
          </div>
          <div className="route-steps">
            {example.bodyTarget.route.map((step, index) => (
              <div
                key={step}
                className={[
                  index === example.bodyTarget.route.length - 1 ? "active" : "",
                  absorption && index === 1 ? "absorption-step" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>
                  {step}
                  {absorption && index === 1 ? (
                    <small>{absorption.label}</small>
                  ) : null}
                </strong>
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
          <span className="target-key">{example.targetRhythm.label}</span>
          <span className="overlap-key">Overlap</span>
        </div>
      </section>

      <section className="visual-panel lab-controls">
        <DoseControls
          example={example}
          doseHour={doseHour}
          setDoseHour={setDoseHour}
          profile={profile}
          profileId={profileId}
          setProfileId={setProfileId}
          profileLabel={profileLabel}
        />
        {example.absorptionOptions ? (
          <div className="absorption-control">
            <span>Absorption setting</span>
            <div
              className="profile-toggle"
              role="group"
              aria-label="Absorption setting"
            >
              {example.absorptionOptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={item.id === absorptionId ? "selected" : ""}
                  onClick={() => setAbsorptionId(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <aside className="visual-panel lab-readout">
        <Clock3 size={20} aria-hidden="true" />
        <strong>In this simplified model</strong>
        <p>{interpretation}</p>
        <p>{profile.copy}</p>
        {absorption ? <p>{absorption.copy}</p> : null}
        <p>{example.targetRhythm.copy}</p>
      </aside>
    </div>
  );
}

function DayRunwayLab({
  example,
}: {
  example: (typeof medicineExamples)[number];
}) {
  const { doseHour, setDoseHour, profile, profileId, setProfileId } =
    useDrugProfile(example);
  const daytime = exposureWindowScore(doseHour, profile, 8, 17);
  const spillover = exposureWindowScore(doseHour, profile, 21, 6);
  const estimatedPeak = (doseHour + profile.peakHours) % 24;
  const effectSegments = timelineSegments(doseHour, profile.tailHours);
  const glow = Math.max(0.22, Math.min(0.82, daytime.score / 110));
  const spilloverClass =
    spillover.score >= 35 ? "high" : spillover.score >= 18 ? "medium" : "low";
  const interpretation =
    spillover.score >= 35
      ? "The modeled alerting effect is visibly crossing the sleep boundary."
      : daytime.score >= 42
        ? "The modeled effect mostly travels through the daytime focus lane."
        : "The modeled effect misses part of the daytime lane in this setup.";

  return (
    <div className="variant-lab-grid day-runway-lab">
      <section className="visual-panel runway-panel">
        <div className="lab-panel-heading">
          <div>
            <p className="kicker">Day runway</p>
            <h3>Benefit lane vs sleep boundary</h3>
          </div>
          <span>{daytime.score}% daytime coverage</span>
        </div>

        <div className="runway-track" aria-label="Day runway medication timing visual">
          <div className="runway-zone morning-zone" />
          <div className="runway-zone focus-zone" />
          <div className="runway-zone winddown-zone" />
          <div className="runway-zone sleep-zone early" />
          <div className="runway-zone sleep-zone late" />
          {effectSegments.map((segment, index) => (
            <div
              key={`${segment.left}-${index}`}
              className="runway-effect"
              style={{
                left: `${segment.left}%`,
                width: `${segment.width}%`,
              }}
            />
          ))}
          <span className="runway-marker dose" style={{ left: timelinePercent(doseHour) }}>
            dose
          </span>
          <span className="runway-marker peak" style={{ left: timelinePercent(estimatedPeak) }}>
            peak
          </span>
          <span className="runway-marker sleep" style={{ left: timelinePercent(21) }}>
            sleep
          </span>
          <div className="runway-labels" aria-hidden="true">
            <span>morning</span>
            <span>focus lane</span>
            <span>wind-down</span>
            <span>sleep boundary</span>
          </div>
        </div>

        <div className="timeline-ticks" aria-hidden="true">
          {[0, 6, 12, 18, 24].map((hour) => (
            <span key={hour}>{hour === 24 ? "24h" : `${hour}h`}</span>
          ))}
        </div>
      </section>

      <section
        className="visual-panel wake-body-panel"
        style={{ "--wake-glow": glow } as CSSProperties}
      >
        <div className="lab-panel-heading">
          <div>
            <p className="kicker">Body visual</p>
            <h3>{example.bodyTarget.organ}</h3>
          </div>
          <Brain size={24} aria-hidden="true" />
        </div>
        <div className="wake-brain" aria-hidden="true">
          <div className="brain-core">
            <Zap size={38} />
            <span>wake systems</span>
          </div>
        </div>
        <div className="score-pair">
          <div>
            <span>Daytime coverage</span>
            <strong>{daytime.score}%</strong>
          </div>
          <div className={spilloverClass}>
            <span>Sleep spillover</span>
            <strong>{spillover.score}%</strong>
          </div>
        </div>
      </section>

      <section className="visual-panel lab-controls">
        <DoseControls
          example={example}
          doseHour={doseHour}
          setDoseHour={setDoseHour}
          profile={profile}
          profileId={profileId}
          setProfileId={setProfileId}
          profileLabel="Effect duration"
        />
      </section>

      <aside className="visual-panel lab-readout">
        <Clock3 size={20} aria-hidden="true" />
        <strong>In this simplified model</strong>
        <p>{interpretation}</p>
        <p>{example.targetRhythm.copy}</p>
      </aside>
    </div>
  );
}

function NightWindowLab({
  example,
}: {
  example: (typeof medicineExamples)[number];
}) {
  const { doseHour, setDoseHour, profile, profileId, setProfileId } =
    useDrugProfile(example);
  const alignment = exposureWindowScore(doseHour, profile, 22, 6);
  const residue = exposureWindowScore(doseHour, profile, 6, 9);
  const estimatedPeak = (doseHour + profile.peakHours) % 24;
  const effectSegments = timelineSegments(doseHour, profile.tailHours);
  const residueClass =
    residue.score >= 35 ? "high" : residue.score >= 18 ? "medium" : "low";
  const interpretation =
    residue.score >= 35
      ? "The modeled effect reaches the sleep window but still lingers into the morning zone."
      : alignment.score >= 45
        ? "The modeled effect arrives close to the intended sleep window."
        : "The modeled effect only partially overlaps the intended sleep window.";

  return (
    <div className="variant-lab-grid night-window-lab">
      <section className="visual-panel night-window-panel">
        <div className="lab-panel-heading">
          <div>
            <p className="kicker">Night window</p>
            <h3>Sleep timing and morning residue</h3>
          </div>
          <span>{alignment.score}% sleep-window alignment</span>
        </div>

        <div className="night-window-track" aria-label="Night-window medication timing visual">
          <div className="night-zone evening" />
          <div className="night-zone sleep-main" />
          <div className="night-zone sleep-late" />
          <div className="night-zone dawn" />
          {effectSegments.map((segment, index) => (
            <div
              key={`${segment.left}-${index}`}
              className="night-effect"
              style={{
                left: `${segment.left}%`,
                width: `${segment.width}%`,
              }}
            />
          ))}
          <span className="night-marker dose" style={{ left: timelinePercent(doseHour) }}>
            dose
          </span>
          <span className="night-marker peak" style={{ left: timelinePercent(estimatedPeak) }}>
            peak
          </span>
          <span className="night-marker wake" style={{ left: timelinePercent(7) }}>
            wake
          </span>
          <div className="night-labels" aria-hidden="true">
            <span>evening</span>
            <span>intended sleep</span>
            <span>morning residue</span>
          </div>
        </div>
        <div className="timeline-ticks" aria-hidden="true">
          {[18, 21, 24, 3, 6, 9].map((hour) => (
            <span key={hour}>{hour === 24 ? "24h" : `${hour}h`}</span>
          ))}
        </div>
      </section>

      <section className="visual-panel sleep-body-panel">
        <div className="lab-panel-heading">
          <div>
            <p className="kicker">Body visual</p>
            <h3>{example.bodyTarget.organ}</h3>
          </div>
          <Moon size={24} aria-hidden="true" />
        </div>
        <div className="sleep-orbit" aria-hidden="true">
          <div className="moon-core">
            <Moon size={42} />
            <span>sleep window</span>
          </div>
          <div
            className="dawn-residue"
            style={{ "--residue": `${Math.max(8, residue.score)}%` } as CSSProperties}
          >
            <Sunrise size={20} />
          </div>
        </div>
        <div className="score-pair">
          <div>
            <span>Sleep-window alignment</span>
            <strong>{alignment.score}%</strong>
          </div>
          <div className={residueClass}>
            <span>Morning residue</span>
            <strong>{residue.score}%</strong>
          </div>
        </div>
      </section>

      <section className="visual-panel lab-controls">
        <DoseControls
          example={example}
          doseHour={doseHour}
          setDoseHour={setDoseHour}
          profile={profile}
          profileId={profileId}
          setProfileId={setProfileId}
          profileLabel="Effect tail"
        />
      </section>

      <aside className="visual-panel lab-readout">
        <Clock3 size={20} aria-hidden="true" />
        <strong>In this simplified model</strong>
        <p>{interpretation}</p>
        <p>{example.targetRhythm.copy}</p>
      </aside>
    </div>
  );
}

const pumpNodes = [
  { x: 31, y: 32 },
  { x: 40, y: 27 },
  { x: 50, y: 25 },
  { x: 60, y: 27 },
  { x: 69, y: 33 },
  { x: 75, y: 43 },
  { x: 77, y: 54 },
  { x: 72, y: 65 },
  { x: 63, y: 72 },
  { x: 51, y: 75 },
  { x: 39, y: 72 },
  { x: 29, y: 64 },
  { x: 23, y: 52 },
  { x: 23, y: 41 },
];

function AcidPumpLab({
  example,
}: {
  example: (typeof medicineExamples)[number];
}) {
  const { doseHour, setDoseHour, profile, profileId, setProfileId } =
    useDrugProfile(example);
  const mealHour = profile.id === "first-meal" ? 8 : 18;
  const pumpAvailability = profile.id === "first-meal" ? 1 : 0.72;
  const readyWindowStart = (mealHour - 1 + 24) % 24;
  const readyWindowEnd = (mealHour + 2) % 24;
  const pumpReadiness = exposureWindowScore(
    doseHour,
    profile,
    readyWindowStart,
    readyWindowEnd,
    { exposureMultiplier: pumpAvailability },
  );
  const missedActivation = Math.max(
    0,
    Math.round((100 - pumpReadiness.score) * pumpAvailability),
  );
  const estimatedReady = (doseHour + profile.peakHours) % 24;
  const effectSegments = timelineSegments(doseHour, profile.tailHours);
  const pumpGlow = Math.max(0.22, Math.min(0.88, pumpReadiness.score / 100));
  const missedClass =
    missedActivation >= 48 ? "high" : missedActivation >= 24 ? "medium" : "low";
  const pumpAlpha = 0.36 + pumpGlow * 0.42;
  const pumpStrongAlpha = 0.38 + pumpGlow * 0.42;
  const pumpGlowSize = `${8 + pumpGlow * 22}px`;
  const interpretation =
    pumpReadiness.score >= 55
      ? "The modeled drug presence is ready as the meal-triggered pump window opens."
      : missedActivation >= 48
        ? "Many modeled pumps activate before the drug is ready in this setup."
        : "Some modeled drug presence reaches the pump window, but the timing is partial.";

  return (
    <div className="variant-lab-grid acid-pump-lab">
      <section className="visual-panel acid-pump-panel">
        <div className="lab-panel-heading">
          <div>
            <p className="kicker">Stomach pump map</p>
            <h3>Active pumps after fasting</h3>
          </div>
          <span>{pumpReadiness.score}% pump-window readiness</span>
        </div>

        <div
          className="stomach-map"
          style={
            {
              "--pump-glow": pumpGlow,
              "--pump-alpha": pumpAlpha,
              "--pump-strong-alpha": pumpStrongAlpha,
              "--pump-glow-size": pumpGlowSize,
              "--drug-ready": `${Math.max(14, pumpReadiness.score)}%`,
            } as CSSProperties
          }
          aria-label="PPI-style stomach pump timing visual"
        >
          <div className="stomach-shape" aria-hidden="true">
            <div className="drug-coating" />
            <div className="pump-wall-band" />
            {pumpNodes.map((node, index) => (
              <span
                key={`${node.x}-${node.y}`}
                className={index % 3 === 0 ? "pump-node strong" : "pump-node"}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              />
            ))}
            <div className="acid-stream">
              <Droplets size={22} />
              <span>pumps secrete acid</span>
            </div>
          </div>
          <div className="stomach-callouts" aria-hidden="true">
            <span>stomach wall</span>
            <span>active proton pumps</span>
            <span>drug ready layer</span>
          </div>
        </div>
      </section>

      <section className="visual-panel acid-meal-panel">
        <div className="lab-panel-heading">
          <div>
            <p className="kicker">Meal timing strip</p>
            <h3>Dose before pump activation</h3>
          </div>
          <Utensils size={24} aria-hidden="true" />
        </div>
        <div className="meal-strip" aria-label="Meal timing strip for reflux medication">
          <div className="fasting-band" />
          <div
            className="pump-window-band"
            style={{
              left: timelinePercent(readyWindowStart),
              width: `${(3 / 24) * 100}%`,
            }}
          />
          {effectSegments.map((segment, index) => (
            <div
              key={`${segment.left}-${index}`}
              className="meal-drug-effect"
              style={{
                left: `${segment.left}%`,
                width: `${segment.width}%`,
              }}
            />
          ))}
          <span
            className="meal-marker dose"
            style={{ left: timelinePercent(doseHour) }}
            aria-label={`Dose at ${formatClockHour(doseHour)}`}
          >
            1
          </span>
          <span
            className="meal-marker ready"
            style={{ left: timelinePercent(estimatedReady) }}
            aria-label={`Drug ready at ${formatClockHour(estimatedReady)}`}
          >
            2
          </span>
          <span
            className="meal-marker meal"
            style={{ left: timelinePercent(mealHour) }}
            aria-label={`Meal and pump activation at ${formatClockHour(mealHour)}`}
          >
            3
          </span>
          <div className="meal-labels" aria-hidden="true">
            <span>1 dose</span>
            <span>2 drug ready</span>
            <span>3 meal + pumps</span>
          </div>
        </div>
        <div className="timeline-ticks" aria-hidden="true">
          {[0, 6, 12, 18, 24].map((hour) => (
            <span key={hour}>{hour === 24 ? "24h" : `${hour}h`}</span>
          ))}
        </div>
        <div className="score-pair">
          <div>
            <span>Pump-window readiness</span>
            <strong>{pumpReadiness.score}%</strong>
          </div>
          <div className={missedClass}>
            <span>Missed activation</span>
            <strong>{missedActivation}%</strong>
          </div>
        </div>
      </section>

      <section className="visual-panel lab-controls">
        <DoseControls
          example={example}
          doseHour={doseHour}
          setDoseHour={setDoseHour}
          profile={profile}
          profileId={profileId}
          setProfileId={setProfileId}
          profileLabel="Pump timing model"
        />
      </section>

      <aside className="visual-panel lab-readout">
        <Clock3 size={20} aria-hidden="true" />
        <strong>In this simplified model</strong>
        <p>{interpretation}</p>
        <p>{example.targetRhythm.copy}</p>
      </aside>
    </div>
  );
}

function InteractiveMedicineLab({
  example,
}: {
  example: (typeof medicineExamples)[number];
}) {
  if (example.labVariant === "acid-pump") {
    return <AcidPumpLab key={example.name} example={example} />;
  }
  if (example.labVariant === "day-runway") {
    return <DayRunwayLab key={example.name} example={example} />;
  }
  if (example.labVariant === "night-window") {
    return <NightWindowLab key={example.name} example={example} />;
  }
  return <DrugVisualLab key={example.name} example={example} />;
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
  const ordinal = exampleOrdinal(example);

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
                {ordinal
                  ? `Example ${ordinal}: full visual model`
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
        <InteractiveMedicineLab key={example.name} example={example} />
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
