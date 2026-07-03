"use client";

import { BadgeCheck, ChevronsRight, RotateCcw, XCircle } from "lucide-react";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { trialSimulationModes } from "../content/site-data";

type TrialModeId = (typeof trialSimulationModes)[number]["id"];

type TrialArmResult = {
  mode: TrialModeId;
  meanBenefit: number;
  meanToxicity: number;
  approvalScore: number;
  approved: boolean;
  bestWindowHits: number;
};

type TrialRun = {
  runNumber: number;
  results: TrialArmResult[];
};

const PARTICIPANTS_PER_ARM = 96;
const APPROVAL_BENEFIT_THRESHOLD = 16;
const APPROVAL_TOXICITY_LIMIT = 13.6;

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

function biologicalDoseHour(mode: TrialModeId, phaseShift: number, rand: () => number) {
  if (mode === "untimed") {
    const clinicHour = 8 + rand() * 10;
    return wrapHour(clinicHour - phaseShift);
  }

  if (mode === "population") {
    return wrapHour(15 - phaseShift);
  }

  return 15;
}

function runTrial(runNumber: number): TrialRun {
  const rand = seededRandom(7349 + runNumber * 7919);

  const results = trialSimulationModes.map((mode) => {
    let totalBenefit = 0;
    let totalToxicity = 0;
    let windowHits = 0;

    for (let index = 0; index < PARTICIPANTS_PER_ARM; index += 1) {
      const phaseShift = normal(rand) * 3.2;
      const doseHour = biologicalDoseHour(mode.id, phaseShift, rand);
      const efficacyWindow = rhythmWindow(doseHour, 15, 3.5);
      const toxicityWindow = rhythmWindow(doseHour, 5, 2.8);

      const benefit = 5.5 + efficacyWindow * 17.5 + normal(rand) * 2.6;
      const toxicity = 6.2 + toxicityWindow * 15 + normal(rand) * 2.2;

      totalBenefit += benefit;
      totalToxicity += Math.max(0, toxicity);

      if (hourDistance(doseHour, 15) <= 3) {
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
    };
  });

  return { runNumber, results };
}

function formatScore(value: number) {
  return value.toFixed(1);
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

  return (
    <div className="trial-simulator interactive-block">
      <div className="trial-copy">
        <p className="kicker">Hypothetical drug: Chronava</p>
        <h3>Same biology, different trial design.</h3>
        <p>
          Chronava is fictional. In this model, therapeutic effect is strongest
          near one internal-time window, while toxicity rises near another.
          The simplified approval rule rewards benefit and penalizes toxicity.
        </p>
        <div className="trial-actions" aria-label="Simulation controls">
          <button type="button" onClick={() => setRunCount((count) => count + 1)}>
            <RotateCcw size={18} aria-hidden="true" />
            Rerun trial
          </button>
          <button type="button" onClick={() => setRunCount((count) => count + 10)}>
            <ChevronsRight size={18} aria-hidden="true" />
            Spam 10 trials
          </button>
          <button type="button" onClick={() => setRunCount(1)}>
            Reset
          </button>
        </div>
        <p className="trial-caveat">
          Educational simulation only. It is not calibrated to a real drug,
          cancer therapy, or regulatory pathway.
        </p>
      </div>

      <div className="trial-scorekeeper" aria-live="polite">
        <div className="trial-scorekeeper-header">
          <span>Runs</span>
          <strong>{runs.length}</strong>
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
                    <BadgeCheck size={18} aria-label="Approved in latest run" />
                  ) : (
                    <XCircle size={18} aria-label="Not approved in latest run" />
                  )}
                </div>
                <h4>{mode.label}</h4>
                <p>{mode.copy}</p>
                <div className="approval-meter">
                  <span style={{ width: `${mode.rate}%` }} />
                </div>
                <div className="trial-stat-row">
                  <span>Approved</span>
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
                  <span>Window hit</span>
                  <strong>{latest.bestWindowHits}%</strong>
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
              <stop offset="0%" stopColor="#54d6c2" stopOpacity="0.08" />
              <stop offset="52%" stopColor="#54d6c2" stopOpacity="0.72" />
              <stop offset="100%" stopColor="#54d6c2" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="toxicityGradient" x1="0" x2="1">
              <stop offset="0%" stopColor="#ff6b6b" stopOpacity="0.08" />
              <stop offset="22%" stopColor="#ff6b6b" stopOpacity="0.74" />
              <stop offset="100%" stopColor="#ff6b6b" stopOpacity="0.08" />
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
