import {
  ArrowDown,
  Dna,
  FlaskConical,
  Microscope,
  Pill,
} from "lucide-react";
import { BodyClockTimeline } from "./components/BodyClockTimeline";
import { ClinicalTrialSimulator } from "./components/ClinicalTrialSimulator";
import { CircadianSandbox } from "./components/CircadianSandbox";
import { InteractiveBrainMap } from "./components/InteractiveBrainMap";
import { ClockMechanicsSection } from "./components/ClockMechanicsSection";
import { DrugTimingPanel } from "./components/DrugTimingPanel";
import { EntrainmentDemo } from "./components/EntrainmentDemo";
import { GeneNetwork } from "./components/GeneNetwork";
import { OxaliplatinTimeline } from "./components/OxaliplatinTimeline";
import { RhythmLab } from "./components/RhythmLab";
import { SectionVideoExplainer } from "./components/SectionVideoExplainer";
import {
  chapters,
  citations,
  claimMatrix,
  timingSignals,
} from "./content/site-data";
import type { SectionVideoExplainer as SectionVideoExplainerData } from "./content/site-data";
import { CircadianTimeProvider } from "./components/CircadianTimeProvider";
import { MasterCircadianClock } from "./components/MasterCircadianClock";
import { DayNightCanvas } from "./components/DayNightCanvas";
import { CitationList, CitationReturn } from "./components/CitationLink";
import { ReportNav } from "./components/ReportNav";
import { sourceAnchor } from "./lib/citations";

function ChapterIntro({
  id,
  number,
  eyebrow,
  title,
  dek,
  videoExplainer,
}: {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  dek: string;
  videoExplainer?: SectionVideoExplainerData;
}) {
  return (
    <div className="chapter-intro" id={id}>
      <span>{number}</span>
      <div>
        <p className="kicker">{eyebrow}</p>
        <div className="chapter-title-row">
          <h2>{title}</h2>
          {videoExplainer ? (
            <SectionVideoExplainer
              explainer={videoExplainer}
              sectionTitle={title}
            />
          ) : null}
        </div>
        <p>{dek}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [
    opening,
    rhythm,
    sync,
    brain,
    body,
    clockMechanics,
    genes,
    medicine,
    oxaliplatin,
    trialSimulator,
    sources,
  ] = chapters;

  return (
    <CircadianTimeProvider>
      <main>
        <ReportNav />

        <section className="hero-section" id="top" style={{ position: "relative" }}>
          <DayNightCanvas />
          <div className="hero-copy" style={{ zIndex: 10 }}>
            <p className="kicker">Your body keeps time</p>
            <h1>Biology changes by the hour. Medicine should notice.</h1>
            <p>
              Explore how body time shapes sleep, genes, organs, and the way
              medicines meet a changing biological system.
            </p>
            <div className="hero-actions">
              <a href="#rhythm-lab">
                Start exploring <ArrowDown size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
          <MasterCircadianClock />
        </section>

        <section className="content-band opening-band">
          <ChapterIntro {...opening} />
          <div className="opening-thesis" aria-label="Opening principles">
            <span>Biology shifts.</span>
            <span>Evidence stays visible.</span>
            <span>Medication decisions stay clinical.</span>
          </div>
          <CircadianSandbox />
        </section>

        <section className="content-band rhythm-band">
          <ChapterIntro {...rhythm} />
          <RhythmLab />
        </section>

        <section className="content-band sync-band">
          <ChapterIntro {...sync} />
          <div className="signal-strip" aria-label="Timing signals">
            {timingSignals.map((signal) => {
              const Icon = signal.icon;
              return (
                <span key={signal.label}>
                  <Icon size={18} aria-hidden="true" />
                  {signal.label}
                </span>
              );
            })}
          </div>
          <EntrainmentDemo />
        </section>

        <section className="content-band brain-band">
          <ChapterIntro {...brain} />
          <InteractiveBrainMap />
        </section>

        <section className="content-band body-band">
          <ChapterIntro {...body} />
          <BodyClockTimeline />
        </section>

        <ClockMechanicsSection ariaLabel={clockMechanics.title} />

        <section className="content-band genes-band">
          <ChapterIntro {...genes} />
          <GeneNetwork />
        </section>

        <section className="content-band medicine-band">
          <ChapterIntro {...medicine} />
          <DrugTimingPanel />
        </section>

        <section className="content-band oxaliplatin-band">
          <ChapterIntro {...oxaliplatin} />
          <div className="case-study-intro">
            <p className="kicker">Why this case matters</p>
            <p>
              Early studies looked promising. Later trials raised a harder
              question: did the same schedule affect different groups
              differently, or was the signal noise?
            </p>
          </div>
          <OxaliplatinTimeline />
        </section>

        <section className="content-band trial-band">
          <ChapterIntro {...trialSimulator} />
          <ClinicalTrialSimulator />
        </section>

        <section className="content-band evidence-band">
          <ChapterIntro {...sources} />
          <div className="claim-table" role="table" aria-label="Claim matrix">
            <div className="claim-row header" role="row">
              <span>Claim</span>
              <span>Confidence</span>
              <span>Evidence</span>
            </div>
            {claimMatrix.map((claim) => (
              <div className="claim-row" role="row" key={claim.claim}>
                <span>{claim.beginnerPhrasing}</span>
                <span>{claim.confidence}</span>
                <details>
                  <summary>Why we say this</summary>
                  <p>{claim.evidenceType}</p>
                  <p>{claim.caveat}</p>
                  <p>
                    Used in: {claim.visualUse}. Sources:{" "}
                    <CitationList
                      ids={claim.source.split(";").map((id) => id.trim())}
                      contextPrefix={`claim-${claim.visualUse
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")}`}
                    />
                  </p>
                </details>
              </div>
            ))}
          </div>
          <div className="source-grid">
            {citations.map((citation) => (
              <article
                key={citation.id}
                id={sourceAnchor(citation.id)}
                className="source-card"
              >
                <p className="kicker">{citation.source}</p>
                <h3>{citation.title}</h3>
                <details className="source-note">
                  <summary>Why it’s here</summary>
                  <p>{citation.note}</p>
                </details>
                <div className="source-card-meta">
                  {citation.url ? (
                    <a
                      className="source-card-link"
                      href={citation.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open source
                    </a>
                  ) : (
                    <span className="source-card-file">{citation.source}</span>
                  )}
                </div>
                <CitationReturn citationId={citation.id} />
              </article>
            ))}
          </div>
        </section>

        <footer className="site-footer">
          <div>
            <Microscope size={20} aria-hidden="true" />
            <span>Educational circadian biology primer</span>
          </div>
          <p>
            Educational only. Don’t change medication timing without a
            clinician or pharmacist.
          </p>
          <div>
            <FlaskConical size={18} aria-hidden="true" />
            <Dna size={18} aria-hidden="true" />
            <Pill size={18} aria-hidden="true" />
          </div>
        </footer>
      </main>
    </CircadianTimeProvider>
  );
}
