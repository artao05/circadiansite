"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ClockMechanics,
  type ClockMechanicsState,
} from "./ClockMechanics";

const stateCopy: Record<
  ClockMechanicsState,
  { eyebrow: string; title: string; caption: string }
> = {
  morning: {
    eyebrow: "Morning",
    title: "CLOCK/BMAL1 activates transcription",
    caption:
      "The positive arm docks on DNA and starts the next wave of clock-controlled messages.",
  },
  afternoon: {
    eyebrow: "Afternoon",
    title: "PER/CRY accumulates",
    caption:
      "The delayed products of that signal build in the cellular space around the nucleus.",
  },
  night: {
    eyebrow: "Night",
    title: "PER/CRY represses the complex",
    caption:
      "The negative arm returns to the DNA site and quiets the signal that created it.",
  },
  dawn: {
    eyebrow: "Dawn",
    title: "Degradation resets the loop",
    caption:
      "Repressors dissolve away, exposing CLOCK/BMAL1 so the molecular day can begin again.",
  },
};

function stateFromProgress(progress: number): ClockMechanicsState {
  if (progress < 0.28) return "morning";
  if (progress < 0.55) return "afternoon";
  if (progress < 0.82) return "night";
  return "dawn";
}

export function ClockMechanicsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const [timeState, setTimeState] =
    useState<ClockMechanicsState>("morning");
  const activeCopy = stateCopy[timeState];
  const states = useMemo(
    () => Object.keys(stateCopy) as ClockMechanicsState[],
    [],
  );

  useEffect(() => {
    const updateProgress = () => {
      frameRef.current = null;
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
      progressRef.current = progress;
      const nextState = stateFromProgress(progress);
      setTimeState((current) => (current === nextState ? current : nextState));
    };

    const requestUpdate = () => {
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="clock-mechanics-section"
      id="clock-mechanics"
      aria-label="Molecular clock mechanics scroll animation"
    >
      <div className="clock-mechanics-sticky" data-state={timeState}>
        <ClockMechanics timeState={timeState} progressRef={progressRef} />

        <div className="clock-mechanics-copy">
          <p className="kicker">{activeCopy.eyebrow}</p>
          <h2>{activeCopy.title}</h2>
          <p>{activeCopy.caption}</p>
        </div>

        <div className="clock-mechanics-progress" aria-hidden="true">
          {states.map((state) => (
            <span
              key={state}
              className={state === timeState ? "active" : ""}
            />
          ))}
        </div>

        <div className="clock-network-reveal">
          <span>This loop is the core.</span>
          <strong>The full clock is the network.</strong>
        </div>
      </div>
    </section>
  );
}
