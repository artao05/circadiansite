"use client";

import { useState } from "react";

export function TwoProcessModel() {
  const [hoursAwake, setHoursAwake] = useState(0);

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

    // Process C (Circadian Alerting Signal)
    // Sinusoidal. t=0 is 8AM. Peak at t=8 (4PM). Trough at t=20 (4AM).
    const cValue = 0.5 + 0.5 * Math.sin((t - 2) * Math.PI / 12);
    const yC = baselineY - cValue * (graphHeight * 0.6);

    points.push({ 
      t, 
      x: Number(x.toFixed(2)), 
      yH: Number(yH.toFixed(2)), 
      yC: Number(yC.toFixed(2)) 
    });
  }

  const activePoints = points.filter(p => p.t <= hoursAwake);

  const pathHFull = "M " + points.map(p => `${p.x},${p.yH}`).join(" L ");
  const pathCFull = "M " + points.map(p => `${p.x},${p.yC}`).join(" L ");

  const pathHActive = activePoints.length > 0 ? "M " + activePoints.map(p => `${p.x},${p.yH}`).join(" L ") : "";
  const pathCActive = activePoints.length > 0 ? "M " + activePoints.map(p => `${p.x},${p.yC}`).join(" L ") : "";

  let pathArea = "";
  if (activePoints.length > 0) {
    const forwardH = activePoints.map(p => `${p.x},${p.yH}`).join(" L ");
    const backwardC = [...activePoints].reverse().map(p => `${p.x},${p.yC}`).join(" L ");
    pathArea = `M ${activePoints[0].x},${activePoints[0].yH} L ${forwardH} L ${backwardC} Z`;
  }

  return (
    <div className="two-process-model interactive-block" style={{ margin: '4rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '650px', margin: '0 auto 3rem' }}>
        <h3 style={{ fontSize: '1.75rem', color: '#101820', marginBottom: '1rem', fontWeight: 700, letterSpacing: '-0.5px' }}>The Two-Process Model of Sleep</h3>
        <p style={{ color: '#4b5563', fontSize: '1.125rem', lineHeight: 1.6 }}>
          Your need for sleep is driven by two competing forces: the <strong>Homeostat</strong> (which tracks how long you&apos;ve been awake) and the <strong>Circadian Clock</strong> (which generates alerting signals regardless of your sleep debt).
        </p>
      </div>

      <div className="visual-panel" style={{ padding: '3rem 2rem 2rem', background: '#0a0f14', borderRadius: '16px', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
        
        {/* Narrative Box Overlay (Glassmorphism) */}
        <div style={{ 
          position: 'absolute', top: '2rem', left: '2rem', 
          background: 'rgba(16, 24, 32, 0.65)', 
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '1.25rem', borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)', 
          maxWidth: '260px',
          color: '#f3f4f6', fontSize: '0.875rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          zIndex: 10,
          transition: 'all 0.3s ease'
        }}>
          {hoursAwake < 12 && (
            <span style={{ lineHeight: 1.5, display: 'block' }}>
              <strong style={{ color: '#f59e0b', display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Morning to Day</strong>
              The internal clock&apos;s alerting signal rises alongside sleep pressure, keeping you awake and focused.
            </span>
          )}
          {hoursAwake >= 12 && hoursAwake < 20 && (
            <span style={{ lineHeight: 1.5, display: 'block' }}>
              <strong style={{ color: '#a855f7', display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Nighttime</strong>
              The clock&apos;s alerting signal drops off completely while sleep pressure is intensely high. Sleep is inevitable.
            </span>
          )}
          {hoursAwake >= 20 && (
            <span style={{ lineHeight: 1.5, display: 'block' }}>
              <strong style={{ color: '#10b981', display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>The Second Wind</strong>
              You pulled an all-nighter. Sleep pressure is massive, but the endogenous clock forces a new alerting signal anyway, giving you a bizarre burst of morning energy.
            </span>
          )}
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
          {/* Axes */}
          <line x1={paddingX} y1={baselineY} x2={width - paddingX} y2={baselineY} stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
          <line x1={paddingX} y1={paddingY} x2={paddingX} y2={baselineY} stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />

          {/* Time Labels */}
          <text x={paddingX} y={baselineY + 25} fill="#6b7280" fontSize="11" fontWeight="600" textAnchor="middle" letterSpacing="0.5px">0h AWAKE</text>
          <text x={paddingX + graphWidth / 2} y={baselineY + 25} fill="#6b7280" fontSize="11" fontWeight="600" textAnchor="middle" letterSpacing="0.5px">24h AWAKE</text>
          <text x={width - paddingX} y={baselineY + 25} fill="#6b7280" fontSize="11" fontWeight="600" textAnchor="middle" letterSpacing="0.5px">48h AWAKE</text>
          
          <text x={paddingX - 15} y={baselineY} fill="#6b7280" fontSize="11" fontWeight="600" textAnchor="end" letterSpacing="0.5px">LOW</text>
          <text x={paddingX - 15} y={paddingY + 5} fill="#6b7280" fontSize="11" fontWeight="600" textAnchor="end" letterSpacing="0.5px">HIGH</text>

          {/* Full future paths (Dashed) */}
          <path d={pathHFull} fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 6" opacity="0.2" strokeLinecap="round" />
          <path d={pathCFull} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 6" opacity="0.2" strokeLinecap="round" />

          {/* Sleep Pressure Area */}
          {activePoints.length > 0 && (
            <path d={pathArea} fill="rgba(168, 85, 247, 0.12)" />
          )}

          {/* Active solid paths */}
          {activePoints.length > 0 && (
            <>
              <path d={pathHActive} fill="none" stroke="#a855f7" strokeWidth="4" strokeLinecap="round" style={{ filter: 'drop-shadow(0 4px 6px rgba(168, 85, 247, 0.3))' }} />
              <path d={pathCActive} fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" style={{ filter: 'drop-shadow(0 4px 6px rgba(245, 158, 11, 0.3))' }} />
            </>
          )}

          {/* Legend */}
          <g transform={`translate(${width - 220}, 20)`}>
            <rect x="-10" y="-15" width="220" height="55" fill="rgba(16,24,32,0.4)" rx="8" />
            <line x1="0" y1="0" x2="20" y2="0" stroke="#a855f7" strokeWidth="4" strokeLinecap="round" />
            <text x="30" y="4" fill="#f3f4f6" fontSize="11" fontWeight="600" letterSpacing="0.5px">Process H (Sleep Pressure)</text>
            
            <line x1="0" y1="20" x2="20" y2="20" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
            <text x="30" y="24" fill="#f3f4f6" fontSize="11" fontWeight="600" letterSpacing="0.5px">Process C (Alerting Signal)</text>
          </g>
        </svg>
      </div>

      <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
        <label className="range-control" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%', maxWidth: '400px' }}>
          <span style={{ fontWeight: 700, color: '#101820', fontSize: '1.125rem', letterSpacing: '-0.25px' }}>
            Time Awake: <span style={{ color: '#06b6d4' }}>{hoursAwake.toFixed(1)} hours</span>
          </span>
          <input
            type="range"
            min="0"
            max="48"
            step="0.5"
            value={hoursAwake}
            onChange={(e) => setHoursAwake(Number(e.currentTarget.value))}
            onInput={(e) => setHoursAwake(Number(e.currentTarget.value))}
            style={{ width: '100%', cursor: 'grab' }}
          />
        </label>
      </div>
    </div>
  );
}
