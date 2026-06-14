"use client";

import { useMemo, useState } from "react";
import { Activity, Moon, SunMedium, Utensils } from "lucide-react";

type Mode = "aligned" | "late-light" | "irregular";

const modeCopy: Record<Mode, { title: string; copy: string }> = {
  aligned: {
    title: "Aligned cues",
    copy: "Bright mornings, regular meals, and stable sleep help the internal day stay close to the outside day.",
  },
  "late-light": {
    title: "Late light",
    copy: "Evening light can push internal time later, especially when mornings are dim.",
  },
  irregular: {
    title: "Irregular schedule",
    copy: "Mixed signals make the clock harder to read: some tissues may shift while others lag.",
  },
};

export function EntrainmentDemo() {
  const [mode, setMode] = useState<Mode>("aligned");

  const offsets = useMemo(() => {
    const drift = mode === "aligned" ? -0.2 : mode === "late-light" ? 0.75 : 0.35;
    const volatility = mode === "irregular" ? 0.85 : mode === "late-light" ? 0.25 : 0.12;
    return Array.from({ length: 8 }, (_, day) => {
      const wave = Math.sin(day * 1.4) * volatility;
      const raw = day === 0 ? 0 : drift * day + wave;
      return Math.max(-3, Math.min(5, raw));
    });
  }, [mode]);

  return (
    <div className="interactive-block entrainment">
      <div className="mode-toolbar" role="group" aria-label="Entrainment scenarios">
        {(["aligned", "late-light", "irregular"] as Mode[]).map((item) => (
          <button
            key={item}
            type="button"
            className={item === mode ? "selected" : ""}
            onClick={() => setMode(item)}
          >
            {modeCopy[item].title}
          </button>
        ))}
      </div>
      <div className="entrainment-grid">
        <div className="entrainment-visual visual-panel">
          <div className="signal-row">
            <span>
              <SunMedium size={18} aria-hidden="true" /> Light
            </span>
            <span>
              <Utensils size={18} aria-hidden="true" /> Meals
            </span>
            <span>
              <Activity size={18} aria-hidden="true" /> Activity
            </span>
            <span>
              <Moon size={18} aria-hidden="true" /> Sleep
            </span>
          </div>
          <div className="offset-chart" aria-label="Internal clock offset over eight days">
            {offsets.map((offset, index) => (
              <div className="offset-day" key={index}>
                <span className="day-label">D{index + 1}</span>
                <div className="offset-track">
                  <div className="zero-line" />
                  <div
                    className="offset-marker"
                    style={{ left: `${44 + offset * 8}%` }}
                    title={`${offset.toFixed(1)} hours from wall time`}
                  />
                </div>
                <span className="offset-value">
                  {offset > 0 ? "+" : ""}
                  {offset.toFixed(1)}h
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="explain-panel">
          <p className="kicker">Scenario</p>
          <h3>{modeCopy[mode].title}</h3>
          <p>{modeCopy[mode].copy}</p>
          <p>
            Entrainment means the clock is being pulled into a stable
            relationship with the environment. Misalignment means the signals do
            not agree.
          </p>
        </div>
      </div>
    </div>
  );
}

