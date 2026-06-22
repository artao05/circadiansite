"use client";

import { Clock3 } from "lucide-react";
import type { ChangeEvent, CSSProperties, PointerEvent } from "react";
import { formatMasterHour, useCircadianTime } from "./CircadianTimeProvider";

const lanes = [
  { label: "blood pressure", peak: 8, floor: 28, amplitude: 62 },
  { label: "metabolism", peak: 14, floor: 34, amplitude: 58 },
  { label: "immune tone", peak: 21, floor: 30, amplitude: 56 },
  { label: "sleepiness", peak: 2, floor: 22, amplitude: 70 },
];

function circularDistance(a: number, b: number) {
  const distance = Math.abs(a - b);
  return Math.min(distance, 24 - distance);
}

function rhythmicValue(
  hour: number,
  peak: number,
  floor: number,
  amplitude: number,
) {
  const distance = circularDistance(hour, peak);
  const wave = (Math.cos((distance / 12) * Math.PI) + 1) / 2;
  return Math.round(floor + amplitude * wave);
}

export function MasterCircadianClock() {
  const { hour, setHour, phaseLabel, phaseCaption } = useCircadianTime();
  const angle = (hour / 24) * 360;
  const clockTime = formatMasterHour(hour);
  const handleTimeInput = (event: ChangeEvent<HTMLInputElement>) => {
    setHour(Number(event.currentTarget.value));
  };
  const handleClockPointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const radians = Math.atan2(
      event.clientY - centerY,
      event.clientX - centerX,
    );
    const degrees = (radians * 180) / Math.PI + 90;
    const normalized = (degrees + 360) % 360;
    setHour(Math.round((normalized / 360) * 24) % 24);
  };

  return (
    <div
      className="hero-visual master-clock"
      aria-label="Master biological clock"
    >
      <div className="master-clock-header">
        <span>
          <Clock3 size={17} aria-hidden="true" />
          Master biological time
        </span>
        <strong>{phaseLabel}</strong>
      </div>

      <div
        className="master-clock-face"
        role="presentation"
        onPointerDown={handleClockPointer}
        onPointerMove={(event) => {
          if (event.buttons === 1) handleClockPointer(event);
        }}
      >
        <span
          className="master-clock-ring"
          style={{ "--master-angle": `${angle}deg` } as CSSProperties}
          aria-hidden="true"
        >
          <span className="master-clock-hand" />
          <span className="master-sun-dot" />
          <span className="master-moon-dot" />
          <span className="ring-core">
            <span>{clockTime}</span>
            <strong>living time</strong>
          </span>
        </span>
        <svg
          className="master-clock-ticks"
          viewBox="0 0 100 100"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        >
          {Array.from({ length: 24 }).map((_, i) => {
            const tickAngle = (i / 24) * 360 - 90;
            const isMajor = i % 6 === 0;
            const isMedium = i % 3 === 0 && !isMajor;
            
            const outerRadius = 42.5;
            const innerRadius = isMajor ? 38 : isMedium ? 40 : 41;
            
            const x1 = 50 + innerRadius * Math.cos((tickAngle * Math.PI) / 180);
            const y1 = 50 + innerRadius * Math.sin((tickAngle * Math.PI) / 180);
            const x2 = 50 + outerRadius * Math.cos((tickAngle * Math.PI) / 180);
            const y2 = 50 + outerRadius * Math.sin((tickAngle * Math.PI) / 180);
            
            return (
              <line
                key={`tick-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isMajor ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 255, 255, 0.3)"}
                strokeWidth={isMajor ? 0.8 : 0.4}
              />
            );
          })}
          
          {[0, 6, 12, 18].map((h) => {
            const tickAngle = (h / 24) * 360 - 90;
            const textRadius = 33;
            const x = 50 + textRadius * Math.cos((tickAngle * Math.PI) / 180);
            // Slightly nudge the y position down since text alignment can sometimes ride high
            const y = 50 + textRadius * Math.sin((tickAngle * Math.PI) / 180) + 0.3;
            return (
              <text
                key={`label-${h}`}
                x={x}
                y={y}
                fill="rgba(255, 255, 255, 0.5)"
                fontSize="4"
                fontWeight="700"
                textAnchor="middle"
                alignmentBaseline="middle"
                style={{ userSelect: "none" }}
              >
                {h === 0 ? "24" : h}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="master-clock-caption">
        <strong>{clockTime}</strong>
        <p>{phaseCaption}</p>
      </div>

      <label className="master-scrubber">
        <span>Biological Time</span>
        <input
          type="range"
          min="0"
          max="23"
          step="1"
          value={hour}
          onChange={handleTimeInput}
          onInput={handleTimeInput}
          aria-label="Set master biological time"
        />
      </label>

      <div
        className="physiology-lanes"
        aria-label="Physiology rhythms at selected time"
      >
        {lanes.map((lane) => {
          const value = rhythmicValue(
            hour,
            lane.peak,
            lane.floor,
            lane.amplitude,
          );
          return (
            <div className="lane" key={lane.label}>
              <span>{lane.label}</span>
              <i style={{ width: `${value}%` }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
