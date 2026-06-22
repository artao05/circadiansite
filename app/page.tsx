import {
  ArrowDown,
  BookOpen,
  Database,
  Dna,
  FlaskConical,
  Microscope,
  Pill,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { BodyClockTimeline } from "./components/BodyClockTimeline";
import { CircadianSandbox } from "./components/CircadianSandbox";
import { InteractiveBrainMap } from "./components/InteractiveBrainMap";
import { ClockMechanicsSection } from "./components/ClockMechanicsSection";
import { DrugTimingPanel } from "./components/DrugTimingPanel";
import { EntrainmentDemo } from "./components/EntrainmentDemo";
import { GeneNetwork } from "./components/GeneNetwork";
import { OxaliplatinTimeline } from "./components/OxaliplatinTimeline";
import { RhythmLab } from "./components/RhythmLab";
import { ChapterIntro } from "./components/ChapterIntro";
import {
  chapters,
  citations,
  claimMatrix,
  roadmapItems,
  timingSignals,
  workflowSteps,
} from "./content/site-data";
import { CircadianTimeProvider } from "./components/CircadianTimeProvider";
import { MasterCircadianClock } from "./components/MasterCircadianClock";
import { DayNightCanvas } from "./components/DayNightCanvas";

function CitationPill({ id }: { id: string }) {
  return <span className="citation-pill">{id}</span>;
}

function ChapterIntro({
  id,
  number,
  eyebrow,
  title,
  dek,
}: {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  dek: string;
}) {
  return (
    <div className="chapter-intro" id={id}>
      <span>{number}</span>
      <div>
        <p className="kicker">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{dek}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [opening, rhythm, sync, body, medicine, oxaliplatin, genes, workflow] =
    chapters;

  return (
    <CircadianTimeProvider>
      <main>
        <nav className="report-nav" aria-label="Report chapters">
          <a className="brand-mark" href="#top" aria-label="Go to top">
            <span />
            Circadian Primer
          </a>
          <div>
            {chapters.map((chapter) => (
              <a href={`#${chapter.id}`} key={chapter.id}>
                {chapter.number}
              </a>
            ))}
          </div>
        </nav>

        <section className="hero-section" id="top" style={{ position: "relative" }}>
          <DayNightCanvas />
          <div className="hero-copy" style={{ zIndex: 10 }}>
            <p className="kicker">Medicine in the 4th dimension</p>
            <h1>Biology changes with time. Medicine should notice.</h1>
            <p>
              Circadian biology is the study of the body as a moving system.
              This primer turns the basics into interactive figures, then
              connects them to drug timing, gene rhythms, and the future of
              chronomedicine.
            </p>
            <div className="hero-actions">
              <a href="#rhythm-lab">
                Start with rhythms <ArrowDown size={18} aria-hidden="true" />
              </a>
              <a href="#medicine">Medication examples</a>
            </div>
          </div>
          <MasterCircadianClock />
        </section>

        <section className="content-band opening-band">
          <ChapterIntro {...opening} />
          <div className="opening-grid">
            <article>
              <BookOpen size={24} aria-hidden="true" />
              <h3>The beginner idea</h3>
              <p>
                A body is not a static machine. It is more like a city with
                daily traffic patterns: energy, repair, inflammation, alertness,
                and drug handling all shift over the day.
              </p>
            </article>
            <article>
              <ShieldCheck size={24} aria-hidden="true" />
              <h3>The safety frame</h3>
              <p>
                This site explains concepts and evidence. Medication timing
                belongs with labels, pharmacists, and clinicians.
                <CitationPill id="smith-2019" />
              </p>
            </article>
            <article>
              <Sparkles size={24} aria-hidden="true" />
              <h3>The design premise</h3>
              <p>
                The best way to understand biological time is to move it: drag a
                phase, shrink an amplitude, shift a cue, and watch the system
                answer.
              </p>
            </article>
          </div>
          <CircadianSandbox />
        </section>

        <section className="content-band brain-band bg-[#1C2026] text-[#FCF8EE] py-24">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="font-serif text-4xl mb-4 text-[#FCF8EE]">The Core Circadian Circuitry</h2>
            <p className="text-lg text-[#FCF8EE]/80 max-w-2xl mb-12">
              The master clock sits deep inside the brain. The Suprachiasmatic Nucleus (SCN) receives light signals directly from the eyes and coordinates with sleep-promoting centers like the VLPO and arousal centers like the TMN to drive the sleep-wake cycle.
            </p>
            <InteractiveBrainMap />
          </div>
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

        <section className="content-band body-band">
          <ChapterIntro {...body} />
          <BodyClockTimeline />
        </section>

        <section className="content-band medicine-band">
          <ChapterIntro {...medicine} />
          <DrugTimingPanel />
        </section>

        <section className="content-band oxaliplatin-band">
          <ChapterIntro {...oxaliplatin} />
          <div className="narrative-block" style={{ maxWidth: "800px", margin: "0 auto 3rem", textAlign: "center" }}>
            <p className="kicker" style={{ color: "#06b6d4", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Case study</p>
            <h3 style={{ fontSize: "1.75rem", color: "#f3f4f6", marginBottom: "1rem", fontWeight: 700, letterSpacing: "-0.5px" }}>Oxaliplatin shows why timing can change interpretation.</h3>
            <p style={{ color: "#9ca3af", fontSize: "1.125rem", lineHeight: 1.6, marginBottom: "1rem" }}>
              In the chronomedicine review, oxaliplatin is presented as a
              historical example where excessive toxicity nearly derailed a
              useful colorectal cancer drug. Chronomodulated delivery changed
              the safety and efficacy conversation.
            </p>
            <p style={{ color: "#9ca3af", fontSize: "1.125rem", lineHeight: 1.6 }}>
              The important lesson is not that every person needs the same
              hour. It is that internal circadian phase can become part of the
              treatment design problem.
            </p>
          </div>
          <OxaliplatinTimeline />
        </section>

        <ClockMechanicsSection />

        <section className="content-band genes-band">
          <ChapterIntro {...genes} />
          <GeneNetwork />
        </section>

        <section className="content-band workflow-band">
          <ChapterIntro {...workflow} />
          <div className="workflow-grid">
            {workflowSteps.map((step) => {
              const Icon = step.icon;
              return (
                <article key={step.title}>
                  <Icon size={22} aria-hidden="true" />
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </article>
              );
            })}
          </div>
          <div className="roadmap-panel">
            <div>
              <Database size={24} aria-hidden="true" />
              <h3>V2: from primer to evidence atlas</h3>
              <p>
                The first release is curated. The next layer can connect
                CircaKB, NCBI, PubMed, OpenAlex, and validated science-review
                workflows.
                <CitationPill id="circakb" />
                <CitationPill id="reactome-clock" />
                <CitationPill id="pnas-atlas" />
              </p>
            </div>
            <ul>
              {roadmapItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="content-band evidence-band">
          <div className="chapter-intro compact-intro">
            <span>08</span>
            <div>
              <p className="kicker">Knowledge foundation</p>
              <h2>Claim matrix and sources</h2>
              <p>
                The site keeps a public-friendly claim matrix so the visuals
                stay attached to evidence and caveats.
              </p>
            </div>
          </div>
          <div className="claim-table" role="table" aria-label="Claim matrix">
            <div className="claim-row header" role="row">
              <span>Claim</span>
              <span>Confidence</span>
              <span>Visual use</span>
            </div>
            {claimMatrix.map((claim) => (
              <div className="claim-row" role="row" key={claim.claim}>
                <span>{claim.beginnerPhrasing}</span>
                <span>{claim.confidence}</span>
                <span>{claim.visualUse}</span>
              </div>
            ))}
          </div>
          <div className="source-grid">
            {citations.map((citation) => (
              <article key={citation.id}>
                <p className="kicker">{citation.id}</p>
                <h3>{citation.title}</h3>
                <p>{citation.note}</p>
                {citation.url ? (
                  <a href={citation.url} target="_blank" rel="noreferrer">
                    Open source
                  </a>
                ) : (
                  <span>{citation.source}</span>
                )}
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
            Not medical advice. Do not change medication timing without guidance
            from a clinician or pharmacist.
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
