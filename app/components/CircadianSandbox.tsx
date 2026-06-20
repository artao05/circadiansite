"use client";

import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Moon,
  RotateCcw,
  SunMedium,
} from "lucide-react";
import { useMemo, useState } from "react";
import { SleepModelChart } from "./SleepModelChart";
import {
  formatClockTime,
  generateSleepData,
  getNarrative,
  type SleepDatum,
  type SleepScenario,
} from "../lib/sleep-model";
import {
  sandboxThemes,
  type SandboxThemeName,
} from "../lib/sandbox-themes";

const scenarios: Array<{ value: SleepScenario; label: string; icon: typeof SunMedium }> = [
  { value: "normal", label: "Normal Routine", icon: SunMedium },
  { value: "all-nighter", label: "All-Nighter", icon: Moon },
];

const themeOrder: SandboxThemeName[] = ["elegant", "clinical", "brutal"];

function nearestDatum(data: SleepDatum[], currentTime: number) {
  return data.reduce((nearest, point) =>
    Math.abs(point.hour - currentTime) < Math.abs(nearest.hour - currentTime)
      ? point
      : nearest,
  );
}

function getTrapLabel(point: SleepDatum, scenario: SleepScenario) {
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

export function CircadianSandbox() {
  const [scenario, setScenario] = useState<SleepScenario>("normal");
  const [themeName, setThemeName] = useState<SandboxThemeName>("elegant");
  const [currentTime, setCurrentTime] = useState(8);
  const [caffeineEvents, setCaffeineEvents] = useState<number[]>([]);
  const theme = sandboxThemes[themeName];
  const data = useMemo(
    () => generateSleepData({ scenario, caffeineEvents }),
    [scenario, caffeineEvents],
  );
  const currentPoint = useMemo(
    () => nearestDatum(data, currentTime),
    [data, currentTime],
  );
  const narrative = getNarrative(scenario, currentTime);
  const caffeineIsActive = currentPoint.caffeineEffect > 4;
  const handleTimeInput = (value: string) => {
    setCurrentTime(Number(value));
  };
  const stepTime = (direction: -1 | 1) => {
    setCurrentTime((time) => Math.min(48, Math.max(0, time + direction * 2)));
  };

  return (
    <section
      className={`circadian-sandbox interactive-block ${theme.shell}`}
      id="circadian-sandbox"
    >
      <div className="sandbox-header">
        <div>
          <p className="kicker">Circadian rhythm sandbox</p>
          <h3>Scrub the two-process model, then perturb it.</h3>
          <p>
            Watch homeostatic sleep pressure, circadian wake drive, and caffeine
            masking move across a 48-hour window.
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
                  className={selected ? theme.buttonActive : theme.button}
                  type="button"
                  onClick={() => {
                    setScenario(option.value);
                    setCurrentTime(option.value === "normal" ? 8 : 18);
                    setCaffeineEvents([]);
                  }}
                >
                  <Icon size={16} aria-hidden="true" />
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="sandbox-toggle compact" aria-label="Visual theme">
            {themeOrder.map((name) => (
              <button
                key={name}
                className={themeName === name ? theme.buttonActive : theme.button}
                type="button"
                onClick={() => setThemeName(name)}
              >
                {sandboxThemes[name].name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`sandbox-stage ${theme.panel}`}>
        <aside className={`sandbox-story ${theme.mutedPanel}`}>
          <span>{narrative.eyebrow}</span>
          <h4>{narrative.title}</h4>
          <p>{narrative.body}</p>
          {caffeineIsActive ? (
            <p className="coffee-note">
              Coffee is active here: felt pressure falls, but true adenosine
              keeps accumulating.
            </p>
          ) : null}
        </aside>

        <SleepModelChart
          data={data}
          scenario={scenario}
          currentTime={currentTime}
          theme={theme}
        />

        <div className="sandbox-legend" aria-label="Chart legend">
          <span style={{ color: theme.chart.feltS }}>Felt Sleep Pressure</span>
          <span style={{ color: theme.chart.processS }}>True Adenosine</span>
          <span style={{ color: theme.chart.processC }}>Wake Drive (C)</span>
        </div>
      </div>

      <div className={`sandbox-scrubber ${theme.mutedPanel}`}>
        <label>
          <span>
            Time
            <strong>
              {currentTime.toFixed(1)}h · {formatClockTime(currentTime)}
            </strong>
          </span>
          <input
            aria-label="Scrub through 48 hours"
            max="48"
            min="0"
            onChange={(event) => handleTimeInput(event.currentTarget.value)}
            onInput={(event) => handleTimeInput(event.currentTarget.value)}
            step="0.25"
            type="range"
            value={currentTime}
          />
        </label>

        <div className="sandbox-time-buttons" aria-label="Step through time">
          <button
            className={theme.button}
            type="button"
            onClick={() => stepTime(-1)}
            aria-label="Step backward two hours"
          >
            <ChevronLeft size={17} aria-hidden="true" />
          </button>
          <button
            className={theme.button}
            type="button"
            onClick={() => stepTime(1)}
            aria-label="Step forward two hours"
          >
            <ChevronRight size={17} aria-hidden="true" />
          </button>
        </div>

        <div className="sandbox-actions">
          <button
            className={theme.buttonActive}
            type="button"
            onClick={() =>
              setCaffeineEvents((events) => [...events, Number(currentTime.toFixed(2))])
            }
          >
            <Coffee size={17} aria-hidden="true" />
            Drink Coffee
          </button>
          <button
            className={theme.button}
            type="button"
            onClick={() => setCaffeineEvents([])}
            disabled={caffeineEvents.length === 0}
          >
            <RotateCcw size={16} aria-hidden="true" />
            Reset coffee
          </button>
        </div>
      </div>

      <div className="sandbox-metrics">
        <article className={theme.metric}>
          <span>Process S</span>
          <strong>{formatMetric(currentPoint.feltS)}</strong>
          <p>felt sleep pressure</p>
          <div className="sandbox-meter" aria-hidden="true">
            <i
              style={{
                background: theme.chart.feltS,
                width: `${currentPoint.feltS}%`,
              }}
            />
          </div>
        </article>
        <article className={theme.metric}>
          <span>Process C</span>
          <strong>{formatMetric(currentPoint.processC)}</strong>
          <p>circadian wake drive</p>
          <div className="sandbox-meter" aria-hidden="true">
            <i
              style={{
                background: theme.chart.processC,
                width: `${currentPoint.processC}%`,
              }}
            />
          </div>
        </article>
        <article className={theme.metric}>
          <span>Net alertness</span>
          <strong>{formatMetric(currentPoint.netAlertness)}</strong>
          <p>wake drive minus sleep load</p>
          <div className="sandbox-meter" aria-hidden="true">
            <i
              style={{
                background: theme.chart.caffeine,
                width: `${currentPoint.netAlertness}%`,
              }}
            />
          </div>
        </article>
        <article className={theme.metric}>
          <span>State</span>
          <strong>{currentPoint.state}</strong>
          <p>{currentPoint.dayLabel}</p>
        </article>
        <article className={theme.metric}>
          <span>
            <Activity size={15} aria-hidden="true" />
            The Adenosine Trap
          </span>
          <strong>{currentPoint.processS > currentPoint.feltS ? "Masked" : "Visible"}</strong>
          <p>{getTrapLabel(currentPoint, scenario)}</p>
        </article>
      </div>
    </section>
  );
}
