"use client";

import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Coffee,
  FlaskConical,
  Moon,
  RotateCcw,
  SunMedium,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { CitationLink, CitationList } from "./CitationLink";
import { ModelNotation } from "./ModelNotation";
import { SleepModelChart } from "./SleepModelChart";
import {
  compareCaffeineSleep,
  forcedDesynchronyDefaults,
  forcedDesynchronyProtocolOptions,
  formatElapsedHours,
  formatClockTime,
  generateSleepData,
  getForcedDesynchronyProtocol,
  getForcedDesynchronySchedule,
  getNarrative,
  getSleepChartTicks,
  getSleepModelHorizon,
  getPredictedSleepWindows,
  sleepBudgetOptions,
  type CaffeineDose,
  type ForcedDesynchronyOptions,
  type ForcedDesynchronyProtocol,
  type SleepDatum,
  type SleepBudgetMode,
  type SleepScenario,
} from "../lib/sleep-model";
import { sandboxChartColors } from "../lib/sandbox-themes";

const scenarios: Array<{ value: SleepScenario; label: string; icon: typeof SunMedium }> = [
  { value: "normal", label: "Normal day", icon: SunMedium },
  { value: "all-nighter", label: "All-nighter", icon: Moon },
  { value: "forced-desynchrony", label: "Lab schedule", icon: FlaskConical },
];

const fdSourceIds = [
  "borbely-1982",
  "mchill-2019",
  "cohen-2010",
  "czeisler-1999",
];

function nearestDatum(data: SleepDatum[], currentTime: number) {
  return data.reduce((nearest, point) =>
    Math.abs(point.hour - currentTime) < Math.abs(nearest.hour - currentTime)
      ? point
      : nearest,
  );
}

function getTrapLabel(point: SleepDatum, scenario: SleepScenario) {
  if (scenario === "forced-desynchrony") {
    if (point.misaligned) {
      return "The scheduled sleep window has drifted into high biological wake drive.";
    }

    return "The protocol separates sleep debt from biological time so each can be inspected.";
  }

  if (point.caffeineEffect > 6) {
    return "Caffeine lowers felt pressure while true adenosine remains underneath.";
  }

  if (scenario === "all-nighter" && point.hour >= 24 && point.hour < 34) {
    return "Morning wake drive can create a second wind without erasing sleep debt.";
  }

  if (point.processS - point.feltS > 8) {
    return "The gap between true and felt pressure is the hidden adenosine load.";
  }

  return "The trap is mistaking a temporary alerting signal for real recovery.";
}

function formatMetric(value: number) {
  return `${Math.round(value)}%`;
}

function formatSignedMinutes(value: number) {
  if (value === 0) return "baseline";
  return `${value > 0 ? "+" : "−"}${Math.abs(value)} min`;
}

function formatConcentration(value: number) {
  return `${value.toFixed(value >= 1 ? 1 : 2)} mg/kg`;
}

export function CircadianSandbox() {
  const [scenario, setScenario] = useState<SleepScenario>("normal");
  const [currentTime, setCurrentTime] = useState(8);
  const [selectedCaffeineMg, setSelectedCaffeineMg] = useState(200);
  const [caffeineDoses, setCaffeineDoses] = useState<CaffeineDose[]>([]);
  const [fdProtocol, setFdProtocol] = useState<ForcedDesynchronyProtocol>(
    forcedDesynchronyDefaults.protocol,
  );
  const [fdBudget, setFdBudget] = useState<SleepBudgetMode>(
    forcedDesynchronyDefaults.budget,
  );
  const forcedDesynchrony = useMemo<ForcedDesynchronyOptions>(
    () => ({ protocol: fdProtocol, budget: fdBudget }),
    [fdBudget, fdProtocol],
  );
  const horizon = getSleepModelHorizon(scenario, forcedDesynchrony);
  const boundedTime = Math.min(currentTime, horizon);
  const chartTicks = useMemo(
    () => getSleepChartTicks(scenario, forcedDesynchrony),
    [forcedDesynchrony, scenario],
  );
  const data = useMemo(
    () => generateSleepData({ scenario, caffeineDoses, forcedDesynchrony }),
    [caffeineDoses, forcedDesynchrony, scenario],
  );
  const baselineData = useMemo(
    () => generateSleepData({ scenario, forcedDesynchrony }),
    [forcedDesynchrony, scenario],
  );
  const sleepWindows = useMemo(() => getPredictedSleepWindows(data), [data]);
  const caffeineComparison = useMemo(
    () => compareCaffeineSleep(baselineData, data),
    [baselineData, data],
  );
  const currentPoint = useMemo(
    () => nearestDatum(data, boundedTime),
    [boundedTime, data],
  );
  const narrative = getNarrative(scenario, boundedTime, forcedDesynchrony);
  const isForcedDesynchrony = scenario === "forced-desynchrony";
  const caffeineIsActive =
    !isForcedDesynchrony && currentPoint.caffeineConcentration > 0.05;
  const activeNarrative = caffeineIsActive
    ? {
        eyebrow: "Caffeine active",
        title: "Caffeine can hide sleep pressure for a while.",
        body: "Felt pressure falls, but the underlying sleep drive keeps changing.",
      }
    : narrative;
  const cursorLabel = isForcedDesynchrony
    ? `t=${formatElapsedHours(boundedTime)}`
    : formatClockTime(boundedTime);
  const selectedProtocol = getForcedDesynchronyProtocol(fdProtocol);
  const selectedSchedule = getForcedDesynchronySchedule(forcedDesynchrony);
  const handleTimeInput = (value: string) => {
    setCurrentTime(Math.min(horizon, Math.max(0, Number(value))));
  };
  const stepTime = (direction: -1 | 1) => {
    setCurrentTime((time) => Math.min(horizon, Math.max(0, time + direction * 2)));
  };
  const setScenarioAndReset = (nextScenario: SleepScenario) => {
    setScenario(nextScenario);
    setCaffeineDoses([]);

    if (nextScenario === "forced-desynchrony") {
      setCurrentTime(getSleepModelHorizon(nextScenario, forcedDesynchrony) / 2);
      return;
    }

    setCurrentTime(nextScenario === "normal" ? 8 : 18);
  };

  return (
    <section className="circadian-sandbox interactive-block" id="circadian-sandbox">
      <div className="sandbox-header">
        <div>
          <p className="kicker">Sleep and alertness</p>
          <h3>See what drives sleepiness and alertness.</h3>
          <p>
            Move through the day, add caffeine, or try a lab schedule to see
            sleep pressure and wake drive pull in different directions.
          </p>
        </div>

        <div className="sandbox-controls" aria-label="Sandbox controls">
          <div className="sandbox-toggle" aria-label="Scenario">
            {scenarios.map((option) => {
              const Icon = option.icon;
              const selected = scenario === option.value;
              return (
                <button
                  key={option.value}
                  className={selected ? "selected" : undefined}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setScenarioAndReset(option.value);
                  }}
                >
                  <Icon size={16} aria-hidden="true" />
                  {option.label}
                </button>
              );
            })}
          </div>

          {isForcedDesynchrony ? (
            <div className="sandbox-fd-controls" aria-label="Forced desynchrony controls">
              <div className="sandbox-control-group">
                <span className="sandbox-control-label">
                  <ModelNotation id="protocol-length-T" /> protocol length
                </span>
                <div className="sandbox-toggle sandbox-toggle-compact" aria-label="Protocol length">
                  {forcedDesynchronyProtocolOptions.map((option) => {
                    const selected = fdProtocol === option.value;
                    return (
                      <button
                        key={option.value}
                        className={selected ? "selected" : undefined}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          setFdProtocol(option.value);
                          setCurrentTime(
                            getSleepModelHorizon("forced-desynchrony", {
                              protocol: option.value,
                              budget: fdBudget,
                            }) / 2,
                          );
                        }}
                      >
                        {option.shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="sandbox-control-group">
                <span className="sandbox-control-label">Time allowed for sleep</span>
                <div className="sandbox-toggle sandbox-toggle-compact" aria-label="Sleep budget">
                  {sleepBudgetOptions.map((option) => {
                    const selected = fdBudget === option.value;
                    return (
                      <button
                        key={option.value}
                        className={selected ? "selected" : undefined}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          setFdBudget(option.value);
                          setCurrentTime((time) =>
                            Math.min(
                              time,
                              getSleepModelHorizon("forced-desynchrony", {
                                protocol: fdProtocol,
                                budget: option.value,
                              }),
                            ),
                          );
                        }}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="sandbox-fd-summary">
                <strong>{selectedProtocol.description}</strong> ·{" "}
                {selectedSchedule.wakeHours} h wake / {selectedSchedule.sleepHours} h
                sleep · <ModelNotation id="circadian-tau" />
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="sandbox-stage">
        <aside className="sandbox-story">
          <span>{activeNarrative.eyebrow}</span>
          <h4>{activeNarrative.title}</h4>
          <p>{activeNarrative.body}</p>
          {caffeineIsActive ? (
            <p className="coffee-note">
              Caffeine is active: felt pressure falls, but sleep pressure keeps
              building underneath.
            </p>
          ) : null}
        </aside>

        <SleepModelChart
          data={data}
          currentTime={boundedTime}
          cursorLabel={cursorLabel}
          horizon={horizon}
          showBiologicalTime={isForcedDesynchrony}
          sleepWindows={sleepWindows}
          ticks={chartTicks}
          colors={sandboxChartColors}
          caffeineDoses={caffeineDoses}
        />

        <div className="sandbox-legend" aria-label="Chart legend">
          <span style={{ color: sandboxChartColors.feltS }}>Felt sleep pressure</span>
          <span style={{ color: sandboxChartColors.processS }}>Underlying sleep pressure</span>
          <span style={{ color: sandboxChartColors.processC }}>Circadian wake drive</span>
          {!isForcedDesynchrony ? (
            <span style={{ color: sandboxChartColors.caffeine }}>
              Caffeine in body (<ModelNotation id="caffeine-concentration-zc" />)
            </span>
          ) : null}
        </div>
      </div>

      <div className={isForcedDesynchrony ? "sandbox-scrubber is-fd" : "sandbox-scrubber"}>
        <label>
          <span>
            {isForcedDesynchrony ? "Protocol time" : "Time"}
            <strong>
              {isForcedDesynchrony
                ? `${formatElapsedHours(boundedTime)} · biological ${currentPoint.biologicalLabel}`
                : `${boundedTime.toFixed(1)}h · ${formatClockTime(boundedTime)}`}
            </strong>
          </span>
          <input
            aria-label={`Scrub through ${formatElapsedHours(horizon)}`}
            max={horizon}
            min="0"
            onChange={(event) => handleTimeInput(event.currentTarget.value)}
            onInput={(event) => handleTimeInput(event.currentTarget.value)}
            step="0.25"
            type="range"
            value={boundedTime}
          />
        </label>

        <div className="sandbox-time-buttons" aria-label="Step through time">
          <button
            type="button"
            onClick={() => stepTime(-1)}
            aria-label="Step backward two hours"
          >
            <ChevronLeft size={17} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => stepTime(1)}
            aria-label="Step forward two hours"
          >
            <ChevronRight size={17} aria-hidden="true" />
          </button>
        </div>

        {isForcedDesynchrony ? (
          <div className="sandbox-protocol-note">
            <strong>Controlled lab protocol</strong>
            <p>
              FD and CSR are research tools, not sleep advice. Sources:{" "}
              <CitationList
                ids={fdSourceIds}
                contextPrefix="forced-desynchrony-sandbox"
              />
            </p>
          </div>
        ) : (
          <div className="sandbox-actions">
            <div className="caffeine-dose-picker" aria-label="Caffeine dose">
              {[100, 200, 400].map((dose) => (
                <button
                  key={dose}
                  className={selectedCaffeineMg === dose ? "selected" : undefined}
                  type="button"
                  aria-pressed={selectedCaffeineMg === dose}
                  onClick={() => setSelectedCaffeineMg(dose)}
                >
                  {dose} mg
                </button>
              ))}
            </div>
            <button
              className="emphasis"
              type="button"
              onClick={() =>
                setCaffeineDoses((doses) => [
                  ...doses,
                  {
                    hour: Number(boundedTime.toFixed(2)),
                    milligrams: selectedCaffeineMg,
                  },
                ])
              }
            >
              <Coffee size={17} aria-hidden="true" />
              Add caffeine
            </button>
            <button
              type="button"
              onClick={() => setCaffeineDoses([])}
              disabled={caffeineDoses.length === 0}
            >
              <RotateCcw size={16} aria-hidden="true" />
              Reset doses
            </button>
            {caffeineDoses.length ? (
              <div className="caffeine-event-list" aria-label="Added caffeine doses">
                {caffeineDoses.map((dose, index) => (
                  <span key={`${dose.hour}-${dose.milligrams}-${index}`} className="caffeine-event">
                    {formatClockTime(dose.hour)} · {dose.milligrams} mg
                    <button
                      type="button"
                      onClick={() =>
                        setCaffeineDoses((doses) =>
                          doses.filter((_, doseIndex) => doseIndex !== index),
                        )
                      }
                      aria-label={`Remove ${dose.milligrams} milligram caffeine dose at ${formatClockTime(dose.hour)}`}
                      title="Remove dose"
                    >
                      <X size={13} aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
            <p className="sandbox-caffeine-note">
              Paper-based teaching profile for a 75 kg example. It isn’t a
              personal prediction. Source:{" "}
              <CitationLink id="puckeridge-2011" context="caffeine-sandbox-profile" />.
            </p>
          </div>
        )}
      </div>

      <details className="sandbox-details">
        <summary>Model readout</summary>
        <div className="sandbox-metrics">
        {isForcedDesynchrony ? (
          <>
            <article>
              <span>Process S</span>
              <strong>{formatMetric(currentPoint.feltS)}</strong>
              <p>tracks scheduled wake and sleep</p>
            </article>
            <article>
              <span>Process C</span>
              <strong>{formatMetric(currentPoint.processC)}</strong>
              <p>biological {currentPoint.biologicalLabel}</p>
            </article>
            <article>
              <span>Net alertness</span>
              <strong>{formatMetric(currentPoint.netAlertness)}</strong>
              <p>wake drive minus sleep load</p>
            </article>
            <article>
              <span>State</span>
              <strong>{currentPoint.state}</strong>
              <p>{currentPoint.dayLabel} · {selectedProtocol.label}</p>
            </article>
            <article>
              <span>
                <Activity size={15} aria-hidden="true" />
                Alignment
              </span>
              <strong>{currentPoint.alignmentLabel}</strong>
              <p>{getTrapLabel(currentPoint, scenario)}</p>
            </article>
          </>
        ) : (
          <>
            <article>
              <span>True pressure</span>
              <strong>{formatMetric(currentPoint.processS)}</strong>
              <p>homeostatic signal before caffeine masking</p>
              <div className="sandbox-meter" aria-hidden="true">
                <i
                  style={{
                    background: sandboxChartColors.processS,
                    width: `${currentPoint.processS}%`,
                  }}
                />
              </div>
            </article>
            <article>
              <span><ModelNotation id="caffeine-concentration-zc" /> in body</span>
              <strong>{formatConcentration(currentPoint.caffeineConcentration)}</strong>
              <p>
                {formatConcentration(caffeineComparison.residualCaffeineAtBaselineBedtime)}
                {" "}at baseline bedtime
              </p>
            </article>
            <article>
              <span>Sleep onset</span>
              <strong>
                {caffeineDoses.length
                  ? `+${caffeineComparison.sleepOnsetDelayMinutes} min`
                  : "baseline"}
              </strong>
              <p>predicted shift from the no-caffeine sleep transition</p>
            </article>
            <article>
              <span>Duration change</span>
              <strong>{formatSignedMinutes(caffeineComparison.sleepDurationChangeMinutes)}</strong>
              <p>predicted first sleep episode versus baseline</p>
            </article>
            <article>
              <span>
                <Activity size={15} aria-hidden="true" />
                Wake-effort proxy
              </span>
              <strong>{formatMetric(currentPoint.fatigueProxy)}</strong>
              <p>educational fatigue indicator · {currentPoint.state}</p>
              <div className="sandbox-meter" aria-hidden="true">
                <i
                  style={{
                    background: sandboxChartColors.caffeine,
                    width: `${currentPoint.fatigueProxy}%`,
                  }}
                />
              </div>
            </article>
          </>
        )}
        </div>
      </details>
    </section>
  );
}
