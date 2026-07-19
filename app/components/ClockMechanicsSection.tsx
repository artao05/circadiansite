"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { clockMechanicsStructures } from "../content/site-data";
import { CitationLink } from "./CitationLink";
import {
  ClockMechanics,
  type ClockMechanicsState,
} from "./ClockMechanics";

const stateCopy: Record<
  ClockMechanicsState,
  { eyebrow: string; title: string; caption: ReactNode }
> = {
  morning: {
    eyebrow: "Turn on",
    title: "CLOCK/BMAL1 starts the signal",
    caption:
      <>
        <span className="clock-term activator">CLOCK/BMAL1</span> is the
        activator pair. It binds DNA and starts the next wave of clock messages.
      </>,
  },
  afternoon: {
    eyebrow: "Build up",
    title: "PER/CRY begins to rise",
    caption:
      <>
        <span className="clock-term repressor">PER/CRY</span> proteins are the
        delayed brake. The proteins build before returning to shut the loop down.
      </>,
  },
  night: {
    eyebrow: "Turn down",
    title: "PER/CRY quiets the signal",
    caption:
      <>
        The <span className="clock-term repressor">PER/CRY</span> repressor
        pair returns to the DNA site and quiets the{" "}
        <span className="clock-term activator">CLOCK/BMAL1</span> signal that
        created it.
      </>,
  },
  dawn: {
    eyebrow: "Reset",
    title: "The brake clears",
    caption:
      <>
        The <span className="clock-term repressor">PER/CRY</span> repressors
        break down, exposing <span className="clock-term activator">CLOCK/BMAL1</span>{" "}
        so the cycle can begin again.
      </>,
  },
};

const moleculeCast = [
  {
    id: "activator",
    label: "CLOCK/BMAL1",
    role: "Activator pair",
    structureId: "clock-bmal",
    look: "teal + amber backbone ribbons",
    copy: "binds DNA and turns clock genes on",
  },
  {
    id: "repressor",
    label: "PER/CRY",
    role: "Repressor pair",
    structureId: "per-cry",
    look: "violet + cyan backbone ribbons",
    copy: "builds up, returns, and turns the signal down",
  },
] as const;

function activeCast(timeState: ClockMechanicsState) {
  if (timeState === "morning") return "activator";
  if (timeState === "afternoon" || timeState === "night") return "repressor";
  return "reset";
}

const balanceCopy: Record<
  ClockMechanicsState,
  {
    activatorLevel: number;
    repressorLevel: number;
    label: string;
    copy: string;
  }
> = {
  morning: {
    activatorLevel: 82,
    repressorLevel: 18,
    label: "Activator surplus",
    copy: "BMAL1:CLOCK is exposed, so transcription can climb.",
  },
  afternoon: {
    activatorLevel: 56,
    repressorLevel: 68,
    label: "Balance point",
    copy: "PER/CRY has accumulated enough for tight binding to matter.",
  },
  night: {
    activatorLevel: 30,
    repressorLevel: 88,
    label: "Repressor-bound",
    copy: "PER/CRY sequesters the positive arm and quiets E-box output.",
  },
  dawn: {
    activatorLevel: 62,
    repressorLevel: 12,
    label: "Resetting",
    copy: "Repressor degradation restores activator access for the next cycle.",
  },
};

function stateFromProgress(progress: number): ClockMechanicsState {
  if (progress < 0.28) return "morning";
  if (progress < 0.55) return "afternoon";
  if (progress < 0.82) return "night";
  return "dawn";
}

export function ClockMechanicsSection({
  ariaLabel = "Molecular clock mechanics scroll animation",
}: {
  ariaLabel?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const [timeState, setTimeState] =
    useState<ClockMechanicsState>("morning");
  const [shouldRenderScene, setShouldRenderScene] = useState(false);
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
      if (rect.top < window.innerHeight * 1.2 && rect.bottom > -window.innerHeight) {
        setShouldRenderScene(true);
      }
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

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) {
      setShouldRenderScene(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldRenderScene(true);
        observer.disconnect();
      },
      { rootMargin: "120% 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="clock-mechanics-section"
      id="clock-mechanics"
      aria-label={ariaLabel}
    >
      <div className="clock-mechanics-sticky" data-state={timeState}>
        {shouldRenderScene ? (
          <ClockMechanics timeState={timeState} progressRef={progressRef} />
        ) : null}

        <div className="clock-mechanics-copy">
          <p className="kicker">{activeCopy.eyebrow}</p>
          <h2>{activeCopy.title}</h2>
          <p>{activeCopy.caption}</p>
        </div>

        <details className="clock-model-details">
          <summary>Model notes</summary>
          <div
            className="clock-balance-meter"
            aria-label="Illustrative activator and repressor balance"
          >
            <div>
              <span>Activator</span>
              <i>
                <b
                  style={{ width: `${balanceCopy[timeState].activatorLevel}%` }}
                />
              </i>
            </div>
            <div>
              <span>Repressor</span>
              <i>
                <b
                  style={{ width: `${balanceCopy[timeState].repressorLevel}%` }}
                />
              </i>
            </div>
            <strong>{balanceCopy[timeState].label}</strong>
            <p>{balanceCopy[timeState].copy}</p>
            <small>
              Inspired by Kim & Forger 2012: robust timing through protein
              balance.
            </small>
          </div>
        </details>

        <div className="clock-molecule-key" aria-label="Molecular loop cast">
          {moleculeCast.map((molecule) => {
            const structure = clockMechanicsStructures.find(
              ({ id }) => id === molecule.structureId,
            );

            return (
              <article
                key={molecule.id}
                className={activeMolecule === molecule.id ? "active" : ""}
              >
                <span className={`molecule-swatch ${molecule.id}`} />
                <div>
                  <strong>{molecule.label}</strong>
                  <span>{molecule.role}</span>
                  <p>
                    {molecule.look}; {molecule.copy}. {structure?.pdbId ? (
                      <>
                        Source geometry: PDB {structure.pdbId}{" "}
                        <CitationLink
                          id={structure.citationId}
                          context={`clock-mechanics-${structure.id}`}
                          label="source"
                        />
                        . {structure.note}
                      </>
                    ) : null}
                  </p>
                </div>
              </article>
            );
          })}
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
