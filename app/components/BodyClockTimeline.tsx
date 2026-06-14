"use client";

import { useMemo, useState } from "react";
import { bodyRhythms } from "../content/site-data";

function circularDistance(a: number, b: number) {
  const distance = Math.abs(a - b);
  return Math.min(distance, 24 - distance);
}

export function BodyClockTimeline() {
  const [hour, setHour] = useState(8);

  const active = useMemo(() => {
    return bodyRhythms
      .map((item) => ({
        ...item,
        strength: Math.max(0.16, 1 - circularDistance(hour, item.hour) / 8),
      }))
      .sort((a, b) => b.strength - a.strength);
  }, [hour]);

  return (
    <div className="interactive-block body-clock">
      <div className="clock-face visual-panel" aria-label="Twenty four hour body clock">
        <div className="clock-orbit">
          {bodyRhythms.map((item) => {
            const angle = (item.hour / 24) * 360 - 90;
            const current = active[0].label === item.label;
            return (
              <div
                key={item.label}
                className={`clock-node ${item.tone} ${current ? "current" : ""}`}
                style={{ transform: `rotate(${angle}deg) translate(145px) rotate(${-angle}deg)` }}
              >
                <span>{item.hour}:00</span>
              </div>
            );
          })}
          <div className="clock-core">
            <span>{String(hour).padStart(2, "0")}:00</span>
            <strong>body time</strong>
          </div>
        </div>
        <label className="range-control compact">
          <span>
            Scan the day <strong>{String(hour).padStart(2, "0")}:00</strong>
          </span>
          <input
            type="range"
            min="0"
            max="23"
            value={hour}
            onChange={(event) => setHour(Number(event.target.value))}
          />
        </label>
      </div>

      <div className="rhythm-list">
        {active.map((item) => (
          <article className={`rhythm-event ${item.tone}`} key={item.label}>
            <div>
              <span>{item.system}</span>
              <h3>{item.label}</h3>
            </div>
            <p>{item.copy}</p>
            <meter min="0" max="1" value={item.strength} aria-label={`${item.label} relative activity`} />
          </article>
        ))}
      </div>
    </div>
  );
}

