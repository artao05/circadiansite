"use client";

import { useState } from "react";
import { oxaliplatinEvents } from "../content/site-data";

const plates = [
  "/oxaliplatin_neuropathy_1781491364986.jpg",
  "/oxaliplatin_mouse_1781491376492.jpg",
  "/oxaliplatin_chronomodulation_1781491386150.jpg",
  "/oxaliplatin_personalization_1781491394151.jpg"
];

export function OxaliplatinTimeline() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div
      className="oxaliplatin-explorer interactive-block"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "3rem",
        alignItems: "center",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      {/* Left: Retro Image Plate Container */}
      <div
        className="visual-panel"
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          background: "#0a0f14",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
          overflow: "hidden",
        }}
      >
        {plates.map((src, index) => (
          <img
            key={src}
            src={src}
            alt={`Scientific plate ${index + 1}`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: activeStep === index ? 1 : 0,
              transform: activeStep === index ? "scale(1)" : "scale(1.05)",
              transition: "opacity 0.6s ease, transform 0.8s ease-out",
              pointerEvents: "none",
            }}
          />
        ))}
        {/* Subtle overlay to simulate paper texture or CRT scanline if desired, for now just a glossy inset */}
        <div style={{
          position: "absolute",
          inset: 0,
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.6)",
          pointerEvents: "none"
        }} />
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
                gap: "1.25rem",
                textAlign: "left",
                padding: "1.5rem",
                borderRadius: "12px",
                background: isActive ? "rgba(255, 249, 239, 0.05)" : "transparent",
                border: isActive
                  ? "1px solid rgba(255, 255, 255, 0.1)"
                  : "1px solid transparent",
                cursor: "pointer",
                transition: "all 0.3s ease",
                opacity: isActive ? 1 : 0.4,
                boxShadow: isActive ? "0 10px 30px rgba(0,0,0,0.2)" : "none",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  color: isActive ? "#f59e0b" : "#6b7280",
                  fontSize: "1.5rem",
                  fontFamily: "monospace",
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: isActive ? "#06b6d4" : "#4b5563",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {event.year}
                </span>
                <h3 style={{ margin: "0.3rem 0", color: isActive ? "#f3f4f6" : "#9ca3af", fontSize: "1.125rem", fontWeight: 600 }}>
                  {event.title}
                </h3>
                {isActive && (
                  <p
                    style={{
                      margin: 0,
                      color: "#9ca3af",
                      lineHeight: 1.6,
                      marginTop: "0.5rem",
                      fontSize: "0.95rem"
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
