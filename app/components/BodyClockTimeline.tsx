"use client";

import { useMemo, useState } from "react";
import { organClocks } from "../content/site-data";
import { Activity, Brain, HeartPulse, Shield } from "lucide-react";

function circularDistance(a: number, b: number) {
  const distance = Math.abs(a - b);
  return Math.min(distance, 24 - distance);
}

export function BodyClockTimeline() {
  const [activeOrganId, setActiveOrganId] = useState(organClocks[0].id);
  const [hour, setHour] = useState(8);

  const activeOrgan = useMemo(() => {
    return organClocks.find(o => o.id === activeOrganId) || organClocks[0];
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
  const proximity = Math.max(0, 1 - (activeEvent.distance / 4));

  return (
    <div className="interactive-block body-clock">
      <div className="clock-face visual-panel" aria-label="Organ Explorer">
        <div className="organ-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {organClocks.map(organ => {
            const isSelected = organ.id === activeOrganId;
            const Icon = organ.iconName === 'Brain' ? Brain : 
                         organ.iconName === 'Activity' ? Activity : 
                         organ.iconName === 'HeartPulse' ? HeartPulse : Shield;
            return (
              <button
                key={organ.id}
                onClick={() => setActiveOrganId(organ.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 1rem', borderRadius: '999px',
                  background: isSelected ? '#101820' : '#fff9ef',
                  color: isSelected ? '#fff9ef' : '#101820',
                  border: '1px solid rgba(16,24,32,0.1)',
                  cursor: 'pointer',
                  fontWeight: isSelected ? 600 : 400,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} />
                {organ.name.split(' ')[0]}
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', width: '300px', height: '300px', margin: '2rem auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* 24-Hour Circular Track */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '50%', border: '2px dashed rgba(16,24,32,0.1)' }} />
          
          {/* Time Marker Ring */}
          <div style={{ 
            position: 'absolute', top: '50%', left: '50%', width: '16px', height: '16px', 
            background: '#101820', borderRadius: '50%', 
            transform: `translate(-50%, -50%) rotate(${(hour / 24) * 360 - 90}deg) translate(150px)`,
            transition: 'transform 0.1s linear',
            zIndex: 10,
            boxShadow: '0 0 10px rgba(16,24,32,0.2)'
          }} />

          {/* Time Labels */}
          <span style={{ position: 'absolute', bottom: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>0:00</span>
          <span style={{ position: 'absolute', top: '50%', left: '-35px', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>6:00</span>
          <span style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>12:00</span>
          <span style={{ position: 'absolute', top: '50%', right: '-40px', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>18:00</span>

          {/* Center Humanoid SVG */}
          <div style={{ width: '200px', height: '240px', position: 'relative', zIndex: 5 }}>
            <svg viewBox="0 0 200 240" width="100%" height="100%" style={{ overflow: 'visible' }}>
              
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
                  opacity: activeOrganId === 'brain' ? 1 : 0.1, 
                  transition: 'all 0.5s ease',
                  filter: activeOrganId === 'brain' ? `drop-shadow(0 0 ${proximity * 8}px #f59e0b)` : 'none'
                }}
              >
                <path d="M100 25 C 85 25 78 38 82 48 C 86 58 95 60 100 60 C 105 60 114 58 118 48 C 122 38 115 25 100 25 Z" fill="#f59e0b" />
                <path d="M100 28 C 88 28 82 38 85 45 C 88 52 95 54 100 54 C 105 54 112 52 115 45 C 118 38 112 28 100 28 Z" fill="#fff" opacity="0.3" />
              </g>

              {/* Cardiovascular */}
              <g
                style={{ 
                  opacity: activeOrganId === 'cardio' ? 1 : 0.1, 
                  transition: 'all 0.5s ease',
                  filter: activeOrganId === 'cardio' ? `drop-shadow(0 0 ${proximity * 10}px #ef4444)` : 'none'
                }}
              >
                {/* Heart */}
                <path d="M 105 95 C 105 95 95 85 85 90 C 75 95 75 110 90 120 L 105 135 L 120 120 C 135 110 135 95 125 90 C 115 85 105 95 105 95 Z" fill="#ef4444" />
                {/* Major Vessels */}
                <path d="M105 95 L 105 75 M 112 90 L 125 80 M 98 90 L 85 80" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" opacity="0.7" fill="none" />
                <path d="M105 135 L 105 180 M 105 180 L 80 240 M 105 180 L 130 240" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" opacity="0.5" fill="none" />
                <path d="M90 120 L 60 150 M 120 120 L 150 150" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" opacity="0.5" fill="none" />
              </g>

              {/* Metabolism (Liver/Gut) */}
              <g
                style={{ 
                  opacity: activeOrganId === 'metabolism' ? 1 : 0.1, 
                  transition: 'all 0.5s ease',
                  filter: activeOrganId === 'metabolism' ? `drop-shadow(0 0 ${proximity * 10}px #f97316)` : 'none'
                }}
              >
                {/* Liver */}
                <path d="M 100 125 C 70 125 65 140 65 150 C 65 160 80 165 105 145 C 125 135 140 145 140 135 C 140 125 120 125 100 125 Z" fill="#f97316" />
                {/* Gut */}
                <path d="M 70 155 C 60 170 60 185 85 185 C 95 185 105 170 120 170 C 135 170 145 185 130 200 C 115 215 90 215 70 200" fill="none" stroke="#f97316" strokeWidth="10" strokeLinecap="round" opacity="0.9" />
              </g>

              {/* Immune */}
              <g
                style={{ 
                  opacity: activeOrganId === 'immune' ? 1 : 0.1, 
                  transition: 'all 0.5s ease',
                  filter: activeOrganId === 'immune' ? `drop-shadow(0 0 ${proximity * 8}px #10b981)` : 'none'
                }}
              >
                {/* Lymph network lines */}
                <path d="M 85 75 L 60 100 L 55 160 M 115 75 L 140 100 L 145 160 M 100 145 L 80 220 M 100 145 L 120 220 M 85 75 L 100 145 L 115 75" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" fill="none" opacity="0.8" />
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
        
        <label className="range-control compact" style={{ marginTop: '2rem' }}>
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

      <div className="rhythm-list" style={{ justifyContent: 'center' }}>
        <article className={`rhythm-event ${activeOrgan.tone}`} key={activeEvent.label}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ 
              background: 'rgba(16,24,32,0.05)', 
              padding: '0.2rem 0.5rem', 
              borderRadius: '4px',
              fontWeight: 700,
              color: '#101820'
            }}>{String(activeEvent.hour).padStart(2, '0')}:00</span>
            <h3 style={{ margin: 0 }}>{activeEvent.label}</h3>
          </div>
          <p>{activeEvent.copy}</p>
        </article>

        <div style={{ marginTop: '2rem', padding: '1rem', borderTop: '1px solid #e5e7eb' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase' }}>Daily Schedule</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {activeOrgan.events.slice().sort((a,b) => a.hour - b.hour).map(ev => (
              <li key={ev.label} style={{ 
                fontSize: '0.875rem', display: 'flex', gap: '0.5rem', 
                color: ev.label === activeEvent.label ? '#101820' : '#9ca3af', 
                fontWeight: ev.label === activeEvent.label ? 600 : 400 
              }}>
                <span style={{ width: '40px' }}>{String(ev.hour).padStart(2, '0')}:00</span>
                <span>{ev.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

