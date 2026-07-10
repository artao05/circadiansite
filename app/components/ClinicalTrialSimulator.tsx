"use client";

import { BadgeCheck, ChevronsRight, RotateCcw, XCircle } from "lucide-react";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { trialSimulationModes } from "../content/site-data";

type TrialModeId = (typeof trialSimulationModes)[number]["id"];
type ChronotypeId = "early" | "typical" | "late";

type ChronotypeProfile = {
  id: ChronotypeId;
  label: string;
  shortLabel: string;
  phaseShift: number;
  share: number;
  color: string;
};

type TrialParticipant = {
  id: number;
  chronotype: ChronotypeId;
  phaseShift: number;
  clinicHour: number;
};

type ParticipantDose = TrialParticipant & {
  wallHour: number;
  biologicalHour: number;
  targetDistance: number;
};

type TrialArmResult = {
  mode: TrialModeId;
  meanBenefit: number;
  meanToxicity: number;
  approvalScore: number;
  approved: boolean;
  bestWindowHits: number;
  meanTargetDistance: number;
  doses: ParticipantDose[];
};

type TrialRun = {
  runNumber: number;
  results: TrialArmResult[];
};

const PARTICIPANTS_PER_ARM = 96;
const APPROVAL_BENEFIT_THRESHOLD = 16;
const APPROVAL_TOXICITY_LIMIT = 13.6;
const TARGET_BIOLOGICAL_HOUR = 15;

const chronotypes: ChronotypeProfile[] = [
  {
    id: "early",
    label: "Early clock",
    shortLabel: "Early",
    phaseShift: -3.2,
    share: 0.24,
    color: "var(--amber)",
  },
  {
    id: "typical",
    label: "Typical clock",
    shortLabel: "Typical",
    phaseShift: 0,
    share: 0.52,
    color: "var(--green)",
  },
  {
    id: "late",
    label: "Late clock",
    shortLabel: "Late",
    phaseShift: 3.2,
    share: 0.24,
    color: "var(--violet)",
  },
];

const chronotypeById = new Map(chronotypes.map((chronotype) => [chronotype.id, chronotype]));

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normal(rand: () => number) {
  const u = Math.max(rand(), 0.000001);
  const v = Math.max(rand(), 0.000001);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function wrapHour(hour: number) {
  return ((hour % 24) + 24) % 24;
}

function hourDistance(a: number, b: number) {
  const raw = Math.abs(a - b);
  return Math.min(raw, 24 - raw);
}

function rhythmWindow(hour: number, peakHour: number, width: number) {
  const distance = hourDistance(hour, peakHour);
  return Math.exp(-(distance * distance) / (2 * width * width));
}

function selectChronotype(rand: () => number) {
  const draw = rand();
  let cumulativeShare = 0;

  for (const chronotype of chronotypes) {
    cumulativeShare += chronotype.share;
    if (draw <= cumulativeShare) {
      return chronotype;
    }
  }

  return chronotypes[chronotypes.length - 1];
}

function createParticipant(id: number, rand: () => number): TrialParticipant {
  const chronotype = selectChronotype(rand);

  return {
    id,
    chronotype: chronotype.id,
    phaseShift: chronotype.phaseShift + normal(rand) * 0.72,
    clinicHour: 8 + rand() * 10,
  };
}

function doseParticipant(
  participant: TrialParticipant,
  mode: TrialModeId,
  rand: () => number,
): ParticipantDose {
  if (mode === "untimed") {
    const wallHour = participant.clinicHour;
    const biologicalHour = wrapHour(wallHour - participant.phaseShift);

    return {
      ...participant,
      wallHour,
      biologicalHour,
      targetDistance: hourDistance(biologicalHour, TARGET_BIOLOGICAL_HOUR),
    };
  }

  if (mode === "population") {
    const wallHour = TARGET_BIOLOGICAL_HOUR;
    const biologicalHour = wrapHour(wallHour - participant.phaseShift);

    return {
      ...participant,
      wallHour,
      biologicalHour,
      targetDistance: hourDistance(biologicalHour, TARGET_BIOLOGICAL_HOUR),
    };
  }

  const biologicalHour = wrapHour(TARGET_BIOLOGICAL_HOUR + normal(rand) * 0.48);
  const wallHour = wrapHour(biologicalHour + participant.phaseShift);

  return {
    ...participant,
    wallHour,
    biologicalHour,
    targetDistance: hourDistance(biologicalHour, TARGET_BIOLOGICAL_HOUR),
  };
}

function runTrial(runNumber: number): TrialRun {
  const rand = seededRandom(7349 + runNumber * 7919);
  const participants = Array.from({ length: PARTICIPANTS_PER_ARM }, (_, index) =>
    createParticipant(index, rand),
  );

  const results = trialSimulationModes.map((mode) => {
    let totalBenefit = 0;
    let totalToxicity = 0;
    let totalTargetDistance = 0;
    let windowHits = 0;
    const doses: ParticipantDose[] = [];

    for (const participant of participants) {
      const dose = doseParticipant(participant, mode.id, rand);
      const efficacyWindow = rhythmWindow(dose.biologicalHour, TARGET_BIOLOGICAL_HOUR, 3.5);
      const toxicityWindow = rhythmWindow(dose.biologicalHour, 5, 2.8);

      const benefit = 5.5 + efficacyWindow * 17.5 + normal(rand) * 2.6;
      const toxicity = 6.2 + toxicityWindow * 15 + normal(rand) * 2.2;

      totalBenefit += benefit;
      totalToxicity += Math.max(0, toxicity);
      totalTargetDistance += dose.targetDistance;
      doses.push(dose);

      if (dose.targetDistance <= 3) {
        windowHits += 1;
      }
    }

    const meanBenefit = totalBenefit / PARTICIPANTS_PER_ARM;
    const meanToxicity = totalToxicity / PARTICIPANTS_PER_ARM;
    const approvalScore = meanBenefit - meanToxicity * 0.18 + normal(rand) * 0.7;
    const approved =
      approvalScore >= APPROVAL_BENEFIT_THRESHOLD &&
      meanToxicity <= APPROVAL_TOXICITY_LIMIT;

    return {
      mode: mode.id,
      meanBenefit,
      meanToxicity,
      approvalScore,
      approved,
      bestWindowHits: Math.round((windowHits / PARTICIPANTS_PER_ARM) * 100),
      meanTargetDistance: totalTargetDistance / PARTICIPANTS_PER_ARM,
      doses,
    };
  });

  return { runNumber, results };
}

function formatScore(value: number) {
  return value.toFixed(1);
}

function formatHourDistance(value: number) {
  return `${value.toFixed(1)}h`;
}

export function ClinicalTrialSimulator() {
  const [runCount, setRunCount] = useState(1);

  const runs = useMemo(
    () => Array.from({ length: runCount }, (_, index) => runTrial(index + 1)),
    [runCount],
  );
  const latestRun = runs[runs.length - 1];

  const approvalTotals = trialSimulationModes.map((mode) => {
    const approvals = runs.filter((run) =>
      run.results.find((result) => result.mode === mode.id)?.approved,
    ).length;

    return {
      ...mode,
      approvals,
      rate: Math.round((approvals / runs.length) * 100),
      latest: latestRun.results.find((result) => result.mode === mode.id),
    };
  });

  const cohortCounts = chronotypes.map((chronotype) => {
    const count =
      latestRun.results[0]?.doses.filter((dose) => dose.chronotype === chronotype.id).length ?? 0;

    return { ...chronotype, count };
  });

  return (
    <div className="trial-simulator interactive-block">
      <div className="trial-copy">
        <p className="kicker">Hypothetical drug: Chronava</p>
        <h3>Same drug, different trial design.</h3>
        <p>
          Chronava works best near one body-time window and causes more toxicity
          near another. Different body clocks make the same appointment land at
          different biological times.
        </p>
        <div className="trial-actions" aria-label="Simulation controls">
          <button type="button" onClick={() => setRunCount((count) => count + 1)}>
            <RotateCcw size={18} aria-hidden="true" />
            Run again
          </button>
          <button type="button" onClick={() => setRunCount((count) => count + 10)}>
            <ChevronsRight size={18} aria-hidden="true" />
            Run 10 times
          </button>
          <button type="button" onClick={() => setRunCount(1)}>
            Reset
          </button>
        </div>
        <p className="trial-caveat">
          Fictional teaching model. It doesn’t represent a real drug, disease,
          or approval process.
        </p>
      </div>

      <div className="trial-scorekeeper" aria-live="polite">
        <div className="trial-scorekeeper-header">
          <span>Runs</span>
          <strong>{runs.length}</strong>
        </div>
        <div className="trial-chronotype-panel">
          <div className="trial-chronotype-header">
            <span>Simulated cohort</span>
            <strong>{PARTICIPANTS_PER_ARM} people with different internal clocks</strong>
          </div>
          <div className="trial-chronotype-legend" aria-label="Chronotype legend">
            {cohortCounts.map((chronotype) => (
              <span key={chronotype.id} style={{ "--chronotype": chronotype.color } as CSSProperties}>
                <i aria-hidden="true" />
                {chronotype.shortLabel} <strong>{chronotype.count}</strong>
              </span>
            ))}
          </div>
          <svg
            className="trial-chronotype-map"
            viewBox="0 0 720 238"
            role="img"
            aria-label="Biological dose times by trial design and chronotype"
          >
            <title>Different chronotypes spread or align across the trial designs</title>
            <rect x="183" y="24" width="70" height="176" className="trial-map-toxicity-window" />
            <rect x="360" y="24" width="150" height="176" className="trial-map-benefit-window" />
            {Array.from({ length: 7 }, (_, index) => (
              <line
                key={index}
                x1={60 + index * 100}
                x2={60 + index * 100}
                y1="24"
                y2="200"
                className="trial-map-grid-line"
              />
            ))}
            {approvalTotals.map((mode, modeIndex) => {
              const latest = mode.latest;
              if (!latest) {
                return null;
              }

              const rowY = 56 + modeIndex * 58;

              return (
                <g key={mode.id}>
                  <text x="18" y={rowY + 4} className="trial-map-row-label">
                    {mode.shortLabel}
                  </text>
                  <line x1="60" x2="660" y1={rowY} y2={rowY} className="trial-map-row-line" />
                  {latest.doses.map((dose) => {
                    const chronotype = chronotypeById.get(dose.chronotype);
                    const x = 60 + (dose.biologicalHour / 24) * 600;
                    const y = rowY + ((dose.id % 9) - 4) * 1.55;

                    return (
                      <circle
                        key={`${mode.id}-${dose.id}`}
                        cx={x}
                        cy={y}
                        r="3.2"
                        fill={chronotype?.color ?? "var(--cyan)"}
                        className="trial-map-participant"
                      />
                    );
                  })}
                </g>
              );
            })}
            <line x1="60" x2="660" y1="212" y2="212" className="trial-map-axis" />
            <text x="60" y="230">0</text>
            <text x="330" y="230">Biological time at dose</text>
            <text x="636" y="230">24h</text>
            <text x="372" y="18" className="trial-map-benefit-label">
              target window
            </text>
            <text x="172" y="18" className="trial-map-toxicity-label">
              toxicity window
            </text>
          </svg>
        </div>
        <div className="trial-mode-grid">
          {approvalTotals.map((mode) => {
            const latest = mode.latest;
            if (!latest) {
              return null;
            }

            return (
              <article key={mode.id} style={{ "--accent": mode.accent } as CSSProperties}>
                <div className="trial-mode-topline">
                  <span>{mode.shortLabel}</span>
                  {latest.approved ? (
                    <BadgeCheck size={18} aria-label="Passed the model threshold in the latest run" />
                  ) : (
                    <XCircle size={18} aria-label="Did not pass the model threshold in the latest run" />
                  )}
                </div>
                <h4>{mode.label}</h4>
                <p>{mode.copy}</p>
                <div className="approval-meter">
                  <span style={{ width: `${mode.rate}%` }} />
                </div>
                <div className="trial-stat-row">
                  <span>Passes threshold</span>
                  <strong>
                    {mode.approvals}/{runs.length}
                  </strong>
                </div>
                <div className="trial-stat-row">
                  <span>Benefit</span>
                  <strong>{formatScore(latest.meanBenefit)}</strong>
                </div>
                <div className="trial-stat-row">
                  <span>Toxicity</span>
                  <strong>{formatScore(latest.meanToxicity)}</strong>
                </div>
                <div className="trial-stat-row">
                  <span>Target hit</span>
                  <strong>{latest.bestWindowHits}%</strong>
                </div>
                <div className="trial-stat-row">
                  <span>Average mismatch</span>
                  <strong>{formatHourDistance(latest.meanTargetDistance)}</strong>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="trial-curve-panel" aria-label="Fictional time-sensitive therapeutic window">
        <svg viewBox="0 0 720 220" role="img">
          <title>Fictional efficacy and toxicity curves across biological time</title>
          <defs>
            <linearGradient id="benefitGradient" x1="0" x2="1">
              <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.08" />
              <stop offset="52%" stopColor="var(--cyan)" stopOpacity="0.72" />
              <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="toxicityGradient" x1="0" x2="1">
              <stop offset="0%" stopColor="var(--coral)" stopOpacity="0.08" />
              <stop offset="22%" stopColor="var(--coral)" stopOpacity="0.74" />
              <stop offset="100%" stopColor="var(--coral)" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          {Array.from({ length: 7 }, (_, index) => (
            <line
              key={index}
              x1={80 + index * 92}
              x2={80 + index * 92}
              y1="28"
              y2="174"
              className="trial-grid-line"
            />
          ))}
          <path
            d="M60 154 C120 152 154 66 205 58 C268 48 310 142 365 148 C430 156 468 142 520 108 C574 72 612 76 660 118"
            className="trial-toxicity-line"
          />
          <path
            d="M60 150 C130 146 174 130 230 108 C306 76 346 48 410 54 C484 62 522 126 580 142 C612 151 638 151 660 148"
            className="trial-benefit-line"
          />
          <path
            d="M60 174 L60 150 C130 146 174 130 230 108 C306 76 346 48 410 54 C484 62 522 126 580 142 C612 151 638 151 660 148 L660 174 Z"
            fill="url(#benefitGradient)"
          />
          <path
            d="M60 174 L60 154 C120 152 154 66 205 58 C268 48 310 142 365 148 C430 156 468 142 520 108 C574 72 612 76 660 118 L660 174 Z"
            fill="url(#toxicityGradient)"
          />
          <line x1="60" x2="660" y1="174" y2="174" className="trial-axis" />
          <text x="60" y="202">0</text>
          <text x="350" y="202">Biological time</text>
          <text x="628" y="202">24h</text>
          <text x="426" y="48" className="trial-benefit-label">benefit window</text>
          <text x="116" y="48" className="trial-toxicity-label">toxicity window</text>
        </svg>
      </div>
    </div>
  );
}
