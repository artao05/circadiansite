"use client";

import { useMemo, useState } from "react";
import { SunMedium, Utensils } from "lucide-react";
import { useCircadianTime } from "./CircadianTimeProvider";

function clampHour(hour: number, min: number, max: number) {
  return Math.min(max, Math.max(min, hour));
}

export function EntrainmentDemo() {
  const { hour: masterHour } = useCircadianTime();
  const syncedLightOff = clampHour(masterHour, 19, 26);
  const syncedLastMeal = clampHour(masterHour, 17, 24);
  const [signalState, setSignalState] = useState({
    sourceHour: masterHour,
    lightOff: syncedLightOff,
    lastMeal: syncedLastMeal,
  });
  const lightOff =
    signalState.sourceHour === masterHour
      ? signalState.lightOff
      : syncedLightOff;
  const lastMeal =
    signalState.sourceHour === masterHour
      ? signalState.lastMeal
      : syncedLastMeal;

  if (signalState.sourceHour !== masterHour) {
    setSignalState({
      sourceHour: masterHour,
      lightOff: syncedLightOff,
      lastMeal: syncedLastMeal,
    });
  }

  const formatTime = (val: number) => {
    if (val >= 24) return `${val - 24}:00 AM`;
    if (val === 12) return `12:00 PM`;
    if (val > 12) return `${val - 12}:00 PM`;
    return `${val}:00 AM`;
  };

  const data = useMemo(() => {
    const brainDriftRate = (lightOff - 21) * 0.25;
    const gutDriftRate = (lastMeal - 19) * 0.35;
    
    return Array.from({ length: 8 }, (_, day) => {
      const resistance = Math.sin(day * 1.2) * 0.15; // Biological inertia
      const brainRaw = day === 0 ? 0 : brainDriftRate * day + resistance;
      const gutRaw = day === 0 ? 0 : gutDriftRate * day + resistance;
      
      const brain = Math.max(-1, Math.min(6, brainRaw));
      const gut = Math.max(-1, Math.min(6, gutRaw));
      const strain = Math.abs(brain - gut);
      return { day, brain, gut, strain };
    });
  }, [lightOff, lastMeal]);

  const status = useMemo(() => {
    const bDelay = lightOff > 22;
    const gDelay = lastMeal > 20;
    
    if (bDelay && gDelay) {
      return {
        title: "Total Delay",
        copy: "Both your brain and your gut are shifting to a later time zone. This is like traveling west, but without leaving home."
      };
    } else if (bDelay) {
      return {
        title: "Brain Delayed",
        copy: "Late evening light pushes your central pacemaker later, but your metabolism is still trying to sleep. This creates internal jetlag."
      };
    } else if (gDelay) {
      return {
        title: "Gut Delayed",
        copy: "Late eating shifts your metabolic clock, creating local jetlag in your gut while your brain is ready for bed."
      };
    }
    return {
      title: "Aligned Clocks",
      copy: "Your brain and gut are ticking together in harmony. This strong alignment reinforces a robust circadian rhythm."
    };
  }, [lightOff, lastMeal]);

  return (
    <div className="interactive-block entrainment">
      <div className="entrainment-sandbox" style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', background: '#f8fafc' }}>
        <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Adjust Environmental Signals</h4>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <label className="range-control" style={{ flex: 1, minWidth: '200px' }}>
            <span style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><SunMedium size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }}/> Light Off</span>
              <strong>{formatTime(lightOff)}</strong>
            </span>
            <input
              type="range"
              min="19" max="26" step="1"
              value={lightOff}
              onChange={(e) =>
                setSignalState((current) => ({
                  ...current,
                  sourceHour: masterHour,
                  lightOff: Number(e.currentTarget.value),
                }))
              }
              onInput={(e) =>
                setSignalState((current) => ({
                  ...current,
                  sourceHour: masterHour,
                  lightOff: Number(e.currentTarget.value),
                }))
              }
            />
          </label>
          <label className="range-control" style={{ flex: 1, minWidth: '200px' }}>
            <span style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><Utensils size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }}/> Last Meal</span>
              <strong>{formatTime(lastMeal)}</strong>
            </span>
            <input
              type="range"
              min="17" max="24" step="1"
              value={lastMeal}
              onChange={(e) =>
                setSignalState((current) => ({
                  ...current,
                  sourceHour: masterHour,
                  lastMeal: Number(e.currentTarget.value),
                }))
              }
              onInput={(e) =>
                setSignalState((current) => ({
                  ...current,
                  sourceHour: masterHour,
                  lastMeal: Number(e.currentTarget.value),
                }))
              }
            />
          </label>
        </div>
      </div>
      
      <div className="entrainment-grid">
        <div className="entrainment-visual visual-panel">
          <div className="signal-row" style={{ justifyContent: 'space-between', padding: '0.5rem 1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.875rem' }}>● Brain (SCN)</span>
              <span style={{ color: '#f97316', fontWeight: 600, fontSize: '0.875rem' }}>● Gut (Peripheral)</span>
            </div>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>8-Day Forecast</span>
          </div>
          
          <div className="offset-chart" aria-label="Internal clock offset over eight days">
            {data.map((d) => {
              const brainLeft = 20 + d.brain * 12; // Base 20%, scale 12% per hour
              const gutLeft = 20 + d.gut * 12;
              const minLeft = Math.min(brainLeft, gutLeft);
              const width = Math.abs(brainLeft - gutLeft);
              const isStrained = d.strain > 2;

              return (
                <div className="offset-day" key={d.day}>
                  <span className="day-label">D{d.day + 1}</span>
                  <div className="offset-track" style={{ position: 'relative', flex: 1, height: '24px' }}>
                    <div className="zero-line" style={{ left: '20%' }} />
                    
                    {/* Strain Band */}
                    {width > 0 && (
                      <div 
                        style={{ 
                          position: 'absolute', 
                          left: `${minLeft}%`, 
                          width: `${width}%`, 
                          height: '4px', 
                          top: '10px', 
                          background: isStrained ? '#fca5a5' : '#e5e7eb',
                          transition: 'all 0.3s ease'
                        }} 
                      />
                    )}
                    
                    {/* Brain Marker */}
                    <div
                      className="offset-marker brain"
                      style={{ 
                        left: `${brainLeft}%`, 
                        background: '#f59e0b',
                        borderColor: '#b45309',
                        zIndex: 2
                      }}
                      title={`Brain offset: +${d.brain.toFixed(1)}h`}
                    />
                    
                    {/* Gut Marker */}
                    <div
                      className="offset-marker gut"
                      style={{ 
                        left: `${gutLeft}%`, 
                        background: '#f97316',
                        borderColor: '#c2410c',
                        zIndex: 1
                      }}
                      title={`Gut offset: +${d.gut.toFixed(1)}h`}
                    />
                  </div>
                  <span className="offset-value" style={{ color: isStrained ? '#ef4444' : '#6b7280', width: '40px', textAlign: 'right' }}>
                    {isStrained ? 'Strain' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="explain-panel">
          <p className="kicker">Scenario</p>
          <h3>{status.title}</h3>
          <p>{status.copy}</p>
          <p style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
            <strong>Internal Desynchronization</strong> occurs when different tissue clocks drift apart. 
            When the connecting band turns <span style={{ color: '#ef4444' }}>red</span>, it indicates over 2 hours of misalignment between your brain and gut.
          </p>
        </div>
      </div>
    </div>
  );
}
