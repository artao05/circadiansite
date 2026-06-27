"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ClockMechanics,
  type ClockMechanicsState,
} from "./ClockMechanics";

const stateCopy: Record<
  ClockMechanicsState,
  { eyebrow: string; title: string; caption: ReactNode }
> = {
  morning: {
    eyebrow: "Morning",
    title: "CLOCK/BMAL1 activates transcription",
    caption:
      <>
        <span className="clock-term activator">CLOCK/BMAL1</span> is the
        activator pair: two transcription factors that dock on DNA and start
        the next wave of clock-controlled messages.
      </>,
  },
  afternoon: {
    eyebrow: "Afternoon",
    title: "PER/CRY accumulates",
    caption:
      <>
        <span className="clock-term repressor">PER/CRY</span> proteins are the
        delayed products of that signal. They collect in the cell before
        returning to shut the loop down.
      </>,
  },
  night: {
    eyebrow: "Night",
    title: "PER/CRY represses the complex",
    caption:
      <>
        The <span className="clock-term repressor">PER/CRY</span> repressor
        complex moves back to the DNA site and quiets the{" "}
        <span className="clock-term activator">CLOCK/BMAL1</span> signal that
        created it.
      </>,
  },
  dawn: {
    eyebrow: "Dawn",
    title: "Degradation resets the loop",
    caption:
      <>
        The <span className="clock-term repressor">PER/CRY</span> repressors
        are degraded, exposing <span className="clock-term activator">CLOCK/BMAL1</span>{" "}
        so the molecular day can begin again.
      </>,
  },
};

const moleculeCast = [
  {
    id: "activator",
    label: "CLOCK/BMAL1",
    role: "Activator pair",
    look: "teal + amber protein pair",
    copy: "binds DNA and turns clock genes on",
  },
  {
    id: "repressor",
    label: "PER/CRY",
    role: "Repressor pair",
    look: "violet + cyan bead clusters",
    copy: "builds up, returns, and turns the signal down",
  },
] as const;

function activeCast(timeState: ClockMechanicsState) {
  if (timeState === "morning") return "activator";
  if (timeState === "afternoon" || timeState === "night") return "repressor";
  return "reset";
}

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
  const activeMolecule = activeCast(timeState);
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

        <div className="clock-molecule-key" aria-label="Molecular loop cast">
          {moleculeCast.map((molecule) => (
            <article
              key={molecule.id}
              className={activeMolecule === molecule.id ? "active" : ""}
            >
              <span className={`molecule-swatch ${molecule.id}`} />
              <div>
                <strong>{molecule.label}</strong>
                <span>{molecule.role}</span>
                <p>
                  {molecule.look}; {molecule.copy}.
                </p>
              </div>
            </article>
          ))}
          <article className={activeMolecule === "reset" ? "active reset" : "reset"}>
            <span className="molecule-swatch reset" />
            <div>
              <strong>Degradation</strong>
              <span>Reset step</span>
              <p>PER/CRY dissolves, removing the brake from CLOCK/BMAL1.</p>
            </div>
          </article>
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
