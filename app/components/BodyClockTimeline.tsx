"use client";

import { useMemo, useState } from "react";
import { organClocks } from "../content/site-data";
import { Activity, Brain, HeartPulse, Shield } from "lucide-react";
import { useCircadianTime } from "./CircadianTimeProvider";

function circularDistance(a: number, b: number) {
  const distance = Math.abs(a - b);
  return Math.min(distance, 24 - distance);
}

export function BodyClockTimeline() {
  const { hour: masterHour } = useCircadianTime();
  const [activeOrganId, setActiveOrganId] = useState(organClocks[0].id);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const hour = selectedHour ?? masterHour;
  const handleHourInput = (nextHour: number) => setSelectedHour(nextHour);

  const activeOrgan = useMemo(() => {
    return organClocks.find((o) => o.id === activeOrganId) || organClocks[0];
  }, [activeOrganId]);

  const activeEvent = useMemo(() => {
    return activeOrgan.events
      .map((item) => ({
        ...item,
        distance: circularDistance(hour, item.hour),
      }))
      .sort((a, b) => a.distance - b.distance)[0];
  }, [hour, activeOrgan]);

  // Proximity is a 0-1 scale. 1 = exactly on the hour. 0 = 4 or more hours away.
  const proximity = Math.max(0, 1 - activeEvent.distance / 4);
  const ActiveIcon =
    activeOrgan.iconName === "Brain"
      ? Brain
      : activeOrgan.iconName === "Activity"
        ? Activity
        : activeOrgan.iconName === "HeartPulse"
          ? HeartPulse
          : Shield;

  return (
    <div className="interactive-block body-clock">
      <div className="clock-face visual-panel" aria-label="Organ Explorer">
        <div className="organ-tabs" aria-label="Body clock axes">
          {organClocks.map((organ) => {
            const isSelected = organ.id === activeOrganId;
            const Icon =
              organ.iconName === "Brain"
                ? Brain
                : organ.iconName === "Activity"
                  ? Activity
                  : organ.iconName === "HeartPulse"
                    ? HeartPulse
                    : Shield;
            return (
              <button
                key={organ.id}
                onClick={() => setActiveOrganId(organ.id)}
                className={isSelected ? "selected" : ""}
                type="button"
                aria-pressed={isSelected}
              >
                <Icon size={16} />
                {organ.name.split(" ")[0]}
              </button>
            );
          })}
        </div>

        <div className="body-clock-stage">
          {/* 24-Hour Circular Track */}
          <div className="body-clock-track" />

          {/* Time Marker Ring */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "16px",
              height: "16px",
              background: "#101820",
              borderRadius: "50%",
              transform: `translate(-50%, -50%) rotate(${(hour / 24) * 360 - 90}deg) translate(150px)`,
              transition: "transform 0.1s linear",
              zIndex: 10,
              boxShadow: "0 0 10px rgba(16,24,32,0.2)",
            }}
          />

          {/* Time Labels */}
          <span
            className="body-clock-hour-label bottom"
          >
            0:00
          </span>
          <span
            className="body-clock-hour-label left"
          >
            6:00
          </span>
          <span
            className="body-clock-hour-label top"
          >
            12:00
          </span>
          <span
            className="body-clock-hour-label right"
          >
            18:00
          </span>

          {/* Center Humanoid SVG */}
          <div className="body-clock-figure">
            <svg
              viewBox="0 0 200 240"
              width="100%"
              height="100%"
              style={{ overflow: "visible" }}
            >
              {/* Refined Humanoid Silhouette */}
              <path
                d="M100 10 C 85 10 75 25 75 45 C 75 55 85 65 90 70 C 80 75 60 80 45 95 C 30 110 25 130 25 170 L 25 240 L 175 240 L 175 170 C 175 130 170 110 155 95 C 140 80 120 75 110 70 C 115 65 125 55 125 45 C 125 25 115 10 100 10 Z"
                fill="rgba(16,24,32,0.02)"
                stroke="#d1d5db"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Brain (SCN) */}
              <g
                style={{
                  opacity: activeOrganId === "brain" ? 1 : 0.1,
                  transition: "all 0.5s ease",
                  filter:
                    activeOrganId === "brain"
                      ? `drop-shadow(0 0 ${proximity * 8}px #f59e0b)`
                      : "none",
                }}
              >
                <path
                  d="M100 25 C 85 25 78 38 82 48 C 86 58 95 60 100 60 C 105 60 114 58 118 48 C 122 38 115 25 100 25 Z"
                  fill="#f59e0b"
                />
                <path
                  d="M100 28 C 88 28 82 38 85 45 C 88 52 95 54 100 54 C 105 54 112 52 115 45 C 118 38 112 28 100 28 Z"
                  fill="#fff"
                  opacity="0.3"
                />
              </g>

              {/* Cardiovascular */}
              <g
                style={{
                  opacity: activeOrganId === "cardio" ? 1 : 0.1,
                  transition: "all 0.5s ease",
                  filter:
                    activeOrganId === "cardio"
                      ? `drop-shadow(0 0 ${proximity * 10}px #ef4444)`
                      : "none",
                }}
              >
                {/* Heart */}
                <path
                  d="M 105 95 C 105 95 95 85 85 90 C 75 95 75 110 90 120 L 105 135 L 120 120 C 135 110 135 95 125 90 C 115 85 105 95 105 95 Z"
                  fill="#ef4444"
                />
                {/* Major Vessels */}
                <path
                  d="M105 95 L 105 75 M 112 90 L 125 80 M 98 90 L 85 80"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.7"
                  fill="none"
                />
                <path
                  d="M105 135 L 105 180 M 105 180 L 80 240 M 105 180 L 130 240"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.5"
                  fill="none"
                />
                <path
                  d="M90 120 L 60 150 M 120 120 L 150 150"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.5"
                  fill="none"
                />
              </g>

              {/* Metabolism (Liver/Gut) */}
              <g
                style={{
                  opacity: activeOrganId === "metabolism" ? 1 : 0.1,
                  transition: "all 0.5s ease",
                  filter:
                    activeOrganId === "metabolism"
                      ? `drop-shadow(0 0 ${proximity * 10}px #f97316)`
                      : "none",
                }}
              >
                {/* Liver */}
                <path
                  d="M 100 125 C 70 125 65 140 65 150 C 65 160 80 165 105 145 C 125 135 140 145 140 135 C 140 125 120 125 100 125 Z"
                  fill="#f97316"
                />
                {/* Gut */}
                <path
                  d="M 70 155 C 60 170 60 185 85 185 C 95 185 105 170 120 170 C 135 170 145 185 130 200 C 115 215 90 215 70 200"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="10"
                  strokeLinecap="round"
                  opacity="0.9"
                />
              </g>

              {/* Immune */}
              <g
                style={{
                  opacity: activeOrganId === "immune" ? 1 : 0.1,
                  transition: "all 0.5s ease",
                  filter:
                    activeOrganId === "immune"
                      ? `drop-shadow(0 0 ${proximity * 8}px #10b981)`
                      : "none",
                }}
              >
                {/* Lymph network lines */}
                <path
                  d="M 85 75 L 60 100 L 55 160 M 115 75 L 140 100 L 145 160 M 100 145 L 80 220 M 100 145 L 120 220 M 85 75 L 100 145 L 115 75"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  fill="none"
                  opacity="0.8"
                />
                {/* Lymph nodes */}
                <circle cx="85" cy="75" r="3.5" fill="#10b981" />
                <circle cx="115" cy="75" r="3.5" fill="#10b981" />
                <circle cx="60" cy="100" r="3.5" fill="#10b981" />
                <circle cx="140" cy="100" r="3.5" fill="#10b981" />
                <circle cx="55" cy="160" r="3.5" fill="#10b981" />
                <circle cx="145" cy="160" r="3.5" fill="#10b981" />
                <circle cx="100" cy="145" r="4.5" fill="#10b981" />
                <circle cx="80" cy="220" r="3.5" fill="#10b981" />
                <circle cx="120" cy="220" r="3.5" fill="#10b981" />
              </g>
            </svg>
          </div>
        </div>

        <label className="range-control compact" style={{ marginTop: "2rem" }}>
          <span>
            Scan the day <strong>{String(hour).padStart(2, "0")}:00</strong>
          </span>
          <input
            type="range"
            min="0"
            max="23"
            value={hour}
            onChange={(event) =>
              handleHourInput(Number(event.currentTarget.value))
            }
            onInput={(event) =>
              handleHourInput(Number(event.currentTarget.value))
            }
          />
        </label>
      </div>

      <div className="body-axis-panel">
        <div className={`axis-summary ${activeOrgan.tone}`}>
          <div className="axis-summary-heading">
            <span className="axis-icon">
              <ActiveIcon size={18} aria-hidden="true" />
            </span>
            <div>
              <span>{activeOrgan.evidenceNote}</span>
              <h3>{activeOrgan.name}</h3>
            </div>
          </div>
          <p>{activeOrgan.summary}</p>
        </div>

        <article className={`rhythm-event ${activeOrgan.tone}`} key={activeEvent.label}>
          <div className="axis-event-heading">
            <span>{String(activeEvent.hour).padStart(2, "0")}:00</span>
            <h3>{activeEvent.label}</h3>
          </div>
          <p>{activeEvent.copy}</p>
        </article>

        <div className="axis-function-list" aria-label={`${activeOrgan.name} timed functions`}>
          {activeOrgan.functions.map((item) => (
            <article key={item.label} className="axis-function">
              <div>
                <h4>{item.label}</h4>
                <span>{item.evidence}</span>
              </div>
              <p>{item.pattern}</p>
              <small>{item.caveat}</small>
            </article>
          ))}
        </div>

        <div className="body-clock-nuance">
          <h4>Nuance worth keeping</h4>
          <p>
            A daily pattern is not always a pure circadian rhythm. Meals, sleep,
            posture, activity, light, stress, and species differences can all
            shape the observed timing.
          </p>
        </div>

        <div className="daily-schedule">
          <h4>Daily markers</h4>
          <ul>
            {activeOrgan.events
              .slice()
              .sort((a, b) => a.hour - b.hour)
              .map((ev) => (
                <li
                  key={ev.label}
                  className={ev.label === activeEvent.label ? "active" : ""}
                >
                  <span>{String(ev.hour).padStart(2, "0")}:00</span>
                  <span>{ev.label}</span>
                </li>
              ))}
          </ul>
        </div>

        <div className="axis-sources" aria-label="Evidence sources">
          <span>Evidence spine</span>
          <div>
            {activeOrgan.sources.map((source) => (
              <code key={source}>{source}</code>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
