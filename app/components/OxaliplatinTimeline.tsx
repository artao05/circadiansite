"use client";

import { useState } from "react";
import { oxaliplatinEvents } from "../content/site-data";

export function OxaliplatinTimeline() {
  const [activeStep, setActiveStep] = useState(0);

  // SVG Paths for smooth animation
  // Base line: Flat (Step 0) vs Wave (Step 1-3)
  const deliveryLine1 =
    activeStep === 0
      ? "M 50 150 C 150 150 250 150 316 150 C 400 150 450 150 450 150"
      : "M 50 230 C 150 230 200 60 316 60 C 400 60 420 230 450 230";

  // Personalization waves (Step 3 only)
  const deliveryLineEarly =
    "M 50 230 C 100 230 150 60 216 60 C 300 60 350 230 450 230";
  const deliveryLineLate =
    "M 50 230 C 200 230 250 60 416 60 C 440 60 445 230 450 230";

  // Toxicity (Red area). High in Step 0, Low in Steps 1-3.
  const toxHigh =
    "M 50 250 L 50 60 L 150 40 L 250 80 L 350 50 L 450 70 L 450 250 Z";
  const toxLow =
    "M 50 250 L 50 200 L 150 190 L 250 160 L 350 180 L 450 190 L 450 250 Z";
  const toxPath = activeStep === 0 ? toxHigh : toxLow;

  // Efficacy (Green area). Rises in Steps 2-3.
  const effLow =
    "M 50 250 L 50 230 L 150 220 L 250 240 L 350 230 L 450 240 L 450 250 Z";
  const effHigh =
    "M 50 250 L 50 200 L 150 160 L 250 130 L 316 90 L 400 140 L 450 190 L 450 250 Z";
  const effPath = activeStep >= 2 ? effHigh : effLow;

  return (
    <div
      className="oxaliplatin-explorer interactive-block"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "2rem",
        alignItems: "center",
      }}
    >
      {/* Left: Graphic Visualization */}
      <div
        className="visual-panel"
        style={{
          padding: "2rem 1rem",
          background: "#0a0f14",
          borderRadius: "12px",
        }}
      >
        <svg
          viewBox="0 0 500 300"
          width="100%"
          height="100%"
          style={{ overflow: "visible" }}
        >
          {/* Grid lines and axes */}
          <line
            x1="50"
            y1="250"
            x2="450"
            y2="250"
            stroke="#374151"
            strokeWidth="2"
          />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="250"
            stroke="#374151"
            strokeWidth="2"
          />

          {/* Labels */}
          <text
            x="30"
            y="150"
            fill="#9ca3af"
            fontSize="12"
            transform="rotate(-90 30,150)"
            textAnchor="middle"
            style={{ fontWeight: 600, letterSpacing: "1px" }}
          >
            AMOUNT
          </text>
          <text
            x="250"
            y="275"
            fill="#9ca3af"
            fontSize="12"
            textAnchor="middle"
            style={{ fontWeight: 600, letterSpacing: "1px" }}
          >
            TIME OF DAY (0:00 - 24:00)
          </text>

          {/* Safety Threshold */}
          <line
            x1="50"
            y1="120"
            x2="450"
            y2="120"
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="6 6"
            opacity="0.5"
          />
          <text x="455" y="124" fill="#ef4444" fontSize="12" opacity="0.8">
            Safety Limit
          </text>

          {/* Efficacy Area (Green) */}
          <path
            d={effPath}
            fill="rgba(16, 185, 129, 0.15)"
            stroke="#10b981"
            strokeWidth="2"
            style={{ transition: "d 1s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />

          {/* Toxicity Area (Red) */}
          <path
            d={toxPath}
            fill="rgba(239, 68, 68, 0.15)"
            stroke="#ef4444"
            strokeWidth="2"
            style={{ transition: "d 1s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />

          {/* Delivery Infusion Lines (Cyan) */}
          <path
            d={deliveryLine1}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="4"
            strokeLinecap="round"
            style={{ transition: "d 1s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />

          <path
            d={deliveryLineEarly}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="4 6"
            opacity={activeStep === 3 ? 0.6 : 0}
            style={{ transition: "opacity 1s ease" }}
          />

          <path
            d={deliveryLineLate}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="4 6"
            opacity={activeStep === 3 ? 0.6 : 0}
            style={{ transition: "opacity 1s ease" }}
          />

          {/* Step 3: Labels for patients */}
          <text
            x="216"
            y="45"
            fill="#06b6d4"
            fontSize="10"
            textAnchor="middle"
            opacity={activeStep === 3 ? 1 : 0}
            style={{ transition: "opacity 1s ease" }}
          >
            Early
          </text>
          <text
            x="316"
            y="45"
            fill="#06b6d4"
            fontSize="10"
            textAnchor="middle"
            opacity={activeStep === 3 ? 1 : 0}
            style={{ transition: "opacity 1s ease" }}
          >
            Standard
          </text>
          <text
            x="416"
            y="45"
            fill="#06b6d4"
            fontSize="10"
            textAnchor="middle"
            opacity={activeStep === 3 ? 1 : 0}
            style={{ transition: "opacity 1s ease" }}
          >
            Late
          </text>
        </svg>
      </div>

      {/* Right: Narrative Steps */}
      <div
        className="narrative-steps"
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        {oxaliplatinEvents.map((event, index) => {
          const isActive = index === activeStep;
          return (
            <button
              key={event.title}
              onClick={() => setActiveStep(index)}
              style={{
                display: "flex",
                gap: "1rem",
                textAlign: "left",
                padding: "1.5rem",
                borderRadius: "8px",
                background: isActive ? "#fff9ef" : "transparent",
                border: isActive
                  ? "1px solid rgba(16,24,32,0.1)"
                  : "1px solid transparent",
                cursor: "pointer",
                transition: "all 0.3s ease",
                opacity: isActive ? 1 : 0.5,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  color: isActive ? "#f59e0b" : "#9ca3af",
                  fontSize: "1.25rem",
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {event.year}
                </span>
                <h3 style={{ margin: "0.25rem 0", color: "#101820" }}>
                  {event.title}
                </h3>
                {isActive && (
                  <p
                    style={{
                      margin: 0,
                      color: "#374151",
                      lineHeight: 1.5,
                      marginTop: "0.5rem",
                    }}
                  >
                    {event.copy}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
