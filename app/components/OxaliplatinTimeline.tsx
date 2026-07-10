"use client";

import Image from "next/image";
import { useState } from "react";
import { oxaliplatinEvents } from "../content/site-data";
import { CitationList } from "./CitationLink";

const oxaliplatinCitationIds = [
  "giacchetti-2006",
  "giacchetti-2012",
  "cederroth-2019",
];

const plates = [
  "/oxaliplatin_neuropathy_1781491364986.jpg",
  "/oxaliplatin_mouse_1781491376492.jpg",
  "/oxaliplatin_chronomodulation_1781491386150.jpg",
  "/oxaliplatin_personalization_1781491394151.jpg",
  "/oxaliplatin_chronomodulation_1781491386150.jpg",
];

export function OxaliplatinTimeline() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="oxaliplatin-explorer interactive-block">
      <div className="visual-panel oxaliplatin-visual">
        {plates.map((src, index) => (
          <Image
            key={`${src}-${index}`}
            src={src}
            alt={`Oxaliplatin case study visual ${index + 1}`}
            fill
            priority={index === 0}
            unoptimized
            sizes="(max-width: 720px) 100vw, 480px"
            style={{
              objectFit: "cover",
              opacity: activeStep === index ? 1 : 0,
              transform: activeStep === index ? "scale(1)" : "scale(1.05)",
              transition: "opacity 0.6s ease, transform 0.8s ease-out",
              pointerEvents: "none",
            }}
          />
        ))}
        <div className="oxaliplatin-image-shade" />
      </div>

      <div className="narrative-steps">
        {oxaliplatinEvents.map((event, index) => {
          const isActive = index === activeStep;
          return (
            <button
              key={event.title}
              onClick={() => setActiveStep(index)}
              className={isActive ? "is-active" : undefined}
              aria-pressed={isActive}
            >
              <div className="oxaliplatin-step-number">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <span>{event.year}</span>
                <h3>{event.title}</h3>
                {isActive && (
                  <p>{event.copy}</p>
                )}
              </div>
            </button>
          );
        })}
        <p className="oxaliplatin-sources">
          Sources:{" "}
          <CitationList
            ids={oxaliplatinCitationIds}
            contextPrefix="oxaliplatin"
          />
          . This case explains the evidence; it doesn’t recommend chemotherapy
          timing.
        </p>
      </div>
    </div>
  );
}
