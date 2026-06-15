"use client";

import { useState } from "react";

export function TwoProcessModel() {
  const [hoursAwake, setHoursAwake] = useState(0);
  const [caffeineStart, setCaffeineStart] = useState<number | null>(null);

  // SVG dimensions
  const width = 600;
  const height = 300;
  const paddingX = 50;
  const paddingY = 50;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingY * 2;
  const baselineY = height - paddingY;

  // Mathematical generation
  const points = [];
  for (let t = 0; t <= 48; t += 0.5) {
    const x = paddingX + (t / 48) * graphWidth;

    // Process H (Homeostatic) - Exponential rise
    // tau approx 14 hours. Max value = 1.
    const hValue = 1 - Math.exp(-t / 14);
    const yH = baselineY - hValue * graphHeight;

    let perceivedHValue = hValue;
    if (caffeineStart !== null && t >= caffeineStart && t <= caffeineStart + 6) {
      const dropProgress = (t - caffeineStart) / 6;
      const dropFactor = Math.max(0, 1 - dropProgress); // 1 to 0 over 6 hours
      // Block up to 50% of the adenosine present when coffee was taken
      const pressureAtStart = 1 - Math.exp(-caffeineStart / 14);
      perceivedHValue = hValue - (pressureAtStart * 0.5 * dropFactor);
    }
    const perceivedYH = baselineY - perceivedHValue * graphHeight;

    // Process C (Circadian Alerting Signal)
    // Sinusoidal. t=0 is 8AM. Peak at t=8 (4PM). Trough at t=20 (4AM).
    const cValue = 0.5 + 0.5 * Math.sin(((t - 2) * Math.PI) / 12);
    const yC = baselineY - cValue * (graphHeight * 0.6);

    points.push({
      t,
      x: Number(x.toFixed(2)),
      yH: Number(yH.toFixed(2)),
      perceivedYH: Number(perceivedYH.toFixed(2)),
      yC: Number(yC.toFixed(2)),
    });
  }

  const activePoints = points.filter((p) => p.t <= hoursAwake);

  const pathHFull = "M " + points.map((p) => `${p.x},${p.yH}`).join(" L ");
  const pathCFull = "M " + points.map((p) => `${p.x},${p.yC}`).join(" L ");

  const pathHActiveActual =
    activePoints.length > 0
      ? "M " + activePoints.map((p) => `${p.x},${p.yH}`).join(" L ")
      : "";
  const pathHActivePerceived =
    activePoints.length > 0
      ? "M " + activePoints.map((p) => `${p.x},${p.perceivedYH}`).join(" L ")
      : "";
  const pathCActive =
    activePoints.length > 0
      ? "M " + activePoints.map((p) => `${p.x},${p.yC}`).join(" L ")
      : "";

  let pathArea = "";
  if (activePoints.length > 0) {
    const forwardH = activePoints.map((p) => `${p.x},${p.perceivedYH}`).join(" L ");
    const backwardC = [...activePoints]
      .reverse()
      .map((p) => `${p.x},${p.yC}`)
      .join(" L ");
    pathArea = `M ${activePoints[0].x},${activePoints[0].perceivedYH} L ${forwardH} L ${backwardC} Z`;
  }

  // Thermometer logic
  const currentPoint = activePoints[activePoints.length - 1] || points[0];
  const currentActualH = 1 - Math.exp(-hoursAwake / 14);
  const currentPerceivedH = (baselineY - currentPoint.perceivedYH) / graphHeight;

  return (
    <div
      className="two-process-model interactive-block"
      style={{ margin: "4rem 0" }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "3rem",
          maxWidth: "650px",
          margin: "0 auto 3rem",
        }}
      >
        <h3
          style={{
            fontSize: "1.75rem",
            color: "#101820",
            marginBottom: "1rem",
            fontWeight: 700,
            letterSpacing: "-0.5px",
          }}
        >
          The Two-Process Model of Sleep
        </h3>
        <p style={{ color: "#4b5563", fontSize: "1.125rem", lineHeight: 1.6 }}>
          Your need for sleep is driven by two competing forces: the{" "}
          <strong style={{ color: "var(--violet)", backgroundColor: "color-mix(in srgb, var(--violet) 15%, transparent)", padding: "0.2rem 0.5rem", borderRadius: "6px" }}>Homeostat</strong> (which tracks how long you&apos;ve been
          awake) and the <strong style={{ color: "var(--amber)", backgroundColor: "color-mix(in srgb, var(--amber) 15%, transparent)", padding: "0.2rem 0.5rem", borderRadius: "6px" }}>Circadian Clock</strong> (which generates
          alerting signals regardless of your sleep debt).
        </p>
      </div>

      <div
        className="visual-panel"
        style={{
          padding: "3rem 2rem 2rem",
          background: "#0a0f14",
          borderRadius: "16px",
          position: "relative",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        }}
      >
        {/* Narrative Box Overlay (Glassmorphism) */}
        <div
          style={{
            position: "absolute",
            top: "2rem",
            left: "2rem",
            background: "rgba(16, 24, 32, 0.65)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            padding: "1.5rem",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.1)",
            maxWidth: "340px",
            color: "#f3f4f6",
            fontSize: "1rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            zIndex: 10,
            transition: "all 0.3s ease",
          }}
        >
          {hoursAwake < 12 && (
            <span style={{ lineHeight: 1.5, display: "block" }}>
              <strong
                style={{
                  color: "#f59e0b",
                  display: "block",
                  marginBottom: "0.4rem",
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Morning to Day
              </strong>
              The internal clock&apos;s alerting signal rises alongside sleep
              pressure, keeping you awake and focused.
            </span>
          )}
          {hoursAwake >= 12 && hoursAwake < 20 && (
            <span style={{ lineHeight: 1.5, display: "block" }}>
              <strong
                style={{
                  color: "#a855f7",
                  display: "block",
                  marginBottom: "0.4rem",
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Nighttime
              </strong>
              The clock&apos;s alerting signal drops off completely while sleep
              pressure is intensely high. Sleep is inevitable.
            </span>
          )}
          {hoursAwake >= 20 && (
            <span style={{ lineHeight: 1.5, display: "block" }}>
              <strong
                style={{
                  color: "#10b981",
                  display: "block",
                  marginBottom: "0.4rem",
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                The Second Wind
              </strong>
              You pulled an all-nighter. Sleep pressure is massive, but the
              endogenous clock forces a new alerting signal anyway, giving you a
              bizarre burst of morning energy.
            </span>
          )}
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
          {/* Axes */}
          <line x1={paddingX} y1={baselineY} x2={width - paddingX} y2={baselineY} stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
          <line x1={paddingX} y1={paddingY} x2={paddingX} y2={baselineY} stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />

          {/* Time Labels */}
          <text x={paddingX} y={baselineY + 25} fill="var(--muted)" fontSize="11" fontWeight="600" textAnchor="middle" letterSpacing="0.5px">0h AWAKE</text>
          <text x={paddingX + graphWidth / 2} y={baselineY + 25} fill="var(--muted)" fontSize="11" fontWeight="600" textAnchor="middle" letterSpacing="0.5px">24h AWAKE</text>
          <text x={width - paddingX} y={baselineY + 25} fill="var(--muted)" fontSize="11" fontWeight="600" textAnchor="middle" letterSpacing="0.5px">48h AWAKE</text>
          
          <text x={paddingX - 15} y={baselineY} fill="var(--muted)" fontSize="11" fontWeight="600" textAnchor="end" letterSpacing="0.5px">LOW</text>
          <text x={paddingX - 15} y={paddingY + 5} fill="var(--muted)" fontSize="11" fontWeight="600" textAnchor="end" letterSpacing="0.5px">HIGH</text>

          {/* Full future paths (Dashed) */}
          <path d={pathHFull} fill="none" stroke="var(--violet)" strokeWidth="2" strokeDasharray="4 6" opacity="0.4" strokeLinecap="round" />
          <path d={pathCFull} fill="none" stroke="var(--amber)" strokeWidth="2" strokeDasharray="4 6" opacity="0.4" strokeLinecap="round" />

          {/* Sleep Pressure Area */}
          {activePoints.length > 0 && (
            <path d={pathArea} fill="var(--violet)" opacity="0.12" />
          )}

          {/* Active solid paths */}
          {activePoints.length > 0 && (
            <>
              {caffeineStart !== null && hoursAwake > caffeineStart && (
                <path d={pathHActiveActual} fill="none" stroke="var(--violet)" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" strokeLinecap="round" />
              )}
              <path d={pathHActivePerceived} fill="none" stroke="var(--violet)" strokeWidth="4" strokeLinecap="round" />
              <path d={pathCActive} fill="none" stroke="var(--amber)" strokeWidth="4" strokeLinecap="round" />
            </>
          )}

          {/* Legend */}
          <g transform={`translate(${width - 220}, 20)`}>
            <rect x="-10" y="-15" width="220" height="55" fill="var(--card)" rx="8" stroke="var(--line)" />
            <line x1="0" y1="0" x2="20" y2="0" stroke="var(--violet)" strokeWidth="4" strokeLinecap="round" />
            <text x="30" y="4" fill="var(--ink)" fontSize="11" fontWeight="600" letterSpacing="0.5px">Process H (Sleep Pressure)</text>
            
            <line x1="0" y1="20" x2="20" y2="20" stroke="var(--amber)" strokeWidth="4" strokeLinecap="round" />
            <text x="30" y="24" fill="var(--ink)" fontSize="11" fontWeight="600" letterSpacing="0.5px">Process C (Alerting Signal)</text>
          </g>
        </svg>
      </div>

      <div
        style={{ marginTop: "3rem", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4rem", alignItems: "center" }}
      >
        {/* Thermometer & Coffee Block */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "1.5rem" }}>
          {/* Thermometer Graphic */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", letterSpacing: "1px", textTransform: "uppercase" }}>Adenosine</div>
            <div style={{ 
              width: "24px", 
              height: "120px", 
              background: "rgba(0,0,0,0.05)", 
              border: "2px solid var(--line)", 
              borderRadius: "12px",
              position: "relative",
              overflow: "hidden"
            }}>
              {/* Actual Pressure Level (faded background) */}
              <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: `${currentActualH * 100}%`,
                background: "var(--violet)",
                opacity: 0.2,
                transition: "height 0.1s linear"
              }} />
              {/* Perceived Pressure Level */}
              <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: `${currentPerceivedH * 100}%`,
                background: "var(--violet)",
                borderRadius: "10px",
                transition: "height 0.1s linear"
              }} />
              
              {/* Coffee Blockers (Amber) */}
              {caffeineStart !== null && hoursAwake > caffeineStart && hoursAwake <= caffeineStart + 6 && (
                <div style={{
                  position: "absolute",
                  bottom: `${currentPerceivedH * 100}%`,
                  left: 0,
                  right: 0,
                  height: `${(currentActualH - currentPerceivedH) * 100}%`,
                  background: "repeating-linear-gradient(45deg, var(--amber), var(--amber) 4px, transparent 4px, transparent 8px)",
                  opacity: 0.8,
                  transition: "all 0.1s linear"
                }} />
              )}
            </div>
          </div>

          {/* Coffee Action */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingBottom: "1rem" }}>
            <button 
              onClick={() => setCaffeineStart(hoursAwake)}
              disabled={caffeineStart !== null && hoursAwake >= caffeineStart && hoursAwake <= caffeineStart + 6}
              style={{
                padding: "0.5rem 1rem",
                background: (caffeineStart !== null && hoursAwake >= caffeineStart && hoursAwake <= caffeineStart + 6) ? "var(--surface)" : "var(--amber)",
                color: (caffeineStart !== null && hoursAwake >= caffeineStart && hoursAwake <= caffeineStart + 6) ? "var(--muted)" : "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: (caffeineStart !== null && hoursAwake >= caffeineStart && hoursAwake <= caffeineStart + 6) ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.2s ease"
              }}
            >
              ☕ Drink Coffee
            </button>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", maxWidth: "160px", lineHeight: 1.4 }}>
              Caffeine blocks adenosine receptors, temporarily dropping perceived sleep pressure.
            </div>
          </div>
        </div>

        <label
          className="range-control"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            width: "100%",
            maxWidth: "350px",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              color: "#101820",
              fontSize: "1.125rem",
              letterSpacing: "-0.25px",
            }}
          >
            Time Awake:{" "}
            <span style={{ color: "#06b6d4" }}>
              {hoursAwake.toFixed(1)} hours
            </span>
          </span>
          <input
            type="range"
            min="0"
            max="48"
            step="0.5"
            value={hoursAwake}
            onChange={(e) => {
              const val = Number(e.currentTarget.value);
              setHoursAwake(val);
              if (caffeineStart !== null && val < caffeineStart) setCaffeineStart(null);
              e.currentTarget.style.setProperty("--value", ((val / 48) * 100).toString());
            }}
            onInput={(e) => {
              const val = Number(e.currentTarget.value);
              setHoursAwake(val);
              if (caffeineStart !== null && val < caffeineStart) setCaffeineStart(null);
              e.currentTarget.style.setProperty("--value", ((val / 48) * 100).toString());
            }}
            style={{ "--value": (hoursAwake / 48) * 100, width: "100%", cursor: "grab" } as React.CSSProperties}
          />
        </label>
      </div>
    </div>
  );
}
