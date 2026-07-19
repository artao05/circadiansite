"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";
import {
  Clock3,
  Dna,
  ExternalLink,
  Network,
  RotateCcw,
  Search,
  ShieldQuestion,
  Waves,
} from "lucide-react";
import {
  circadianDataSources,
  clockGeneEdges,
  clockGeneNodes,
  molecularClockTimeline,
} from "../content/site-data";
import type {
  ClockEdgeType,
  ClockGeneEdge,
  ClockGeneCategory,
  ClockGeneNode,
  MolecularClockTimelinePoint,
  MolecularClockVariableId,
} from "../content/site-data";
import {
  formatMasterHour,
  useCircadianTime,
} from "./CircadianTimeProvider";
import { CitationList } from "./CitationLink";
import { GenePlayerCard } from "./GenePlayerCard";
import { ModelNotation, SvgModelLabel } from "./ModelNotation";

const categoryLabels: Record<ClockGeneCategory, string> = {
  corePositive: "Core positive",
  coreNegative: "Core negative",
  secondaryLoop: "Secondary loop",
  accessoryRegulator: "Accessory regulator",
  organSystem: "Organ system",
  downstreamTarget: "Downstream target",
};

const edgeLabels: Record<ClockEdgeType, string> = {
  activation: "Activation",
  repression: "Repression",
  sequestration: "Sequestration",
  phosphorylation: "Phosphorylation",
  regulation: "Regulation",
};

const categoryOrder = Object.keys(categoryLabels) as ClockGeneCategory[];

const coreLoopIds = new Set([
  "ARNTL",
  "CLOCK",
  "NPAS2",
  "PER1",
  "PER2",
  "PER3",
  "CRY1",
  "CRY2",
  "NR1D1",
  "NR1D2",
  "RORA",
  "RORB",
  "RORC",
]);

const loopGeneButtons = [
  "ARNTL",
  "CLOCK",
  "PER1",
  "PER2",
  "CRY1",
  "CRY2",
  "NR1D1",
  "CSNK1D",
];

type GeneNetworkTab = "loop" | "atlas" | "sources";
type AtlasScope = "core" | "all";
type ClockLoopStage =
  | "activation"
  | "translation"
  | "nuclearEntry"
  | "repression"
  | "reset";

const stageCopy: Record<
  ClockLoopStage,
  {
    eyebrow: string;
    title: string;
    copy: string;
    selectId: string;
  }
> = {
  activation: {
    eyebrow: "Turn on",
    title: "BMAL1:CLOCK starts the signal.",
    copy: "The activator pair binds DNA and starts the Per and Cry message wave.",
    selectId: "ARNTL",
  },
  translation: {
    eyebrow: "Build up",
    title: "Messages and proteins rise.",
    copy: "Per messages and PER protein build before the brake reaches the nucleus.",
    selectId: "PER2",
  },
  nuclearEntry: {
    eyebrow: "Build up",
    title: "PER/CRY moves into the nucleus.",
    copy: "The delay comes from making proteins and moving them between cell compartments.",
    selectId: "CRY1",
  },
  repression: {
    eyebrow: "Turn down",
    title: "PER/CRY applies the brake.",
    copy: "The repressor pair binds the activator and quiets the signal that produced it.",
    selectId: "CRY1",
  },
  reset: {
    eyebrow: "Reset",
    title: "The brake clears.",
    copy: "Protein turnover exposes the activator so the next cycle can begin.",
    selectId: "CSNK1D",
  },
};

const stageLayouts: Record<
  ClockLoopStage,
  {
    mRNA: { x: number; y: number };
    cytoplasmicPER: { x: number; y: number };
    nuclearPER: { x: number; y: number };
    activator: { x: number; y: number };
    repressor: { x: number; y: number };
  }
> = {
  activation: {
    mRNA: { x: 224, y: 290 },
    cytoplasmicPER: { x: 150, y: 338 },
    nuclearPER: { x: 612, y: 286 },
    activator: { x: 410, y: 168 },
    repressor: { x: 620, y: 286 },
  },
  translation: {
    mRNA: { x: 210, y: 300 },
    cytoplasmicPER: { x: 300, y: 318 },
    nuclearPER: { x: 612, y: 286 },
    activator: { x: 410, y: 168 },
    repressor: { x: 620, y: 286 },
  },
  nuclearEntry: {
    mRNA: { x: 190, y: 310 },
    cytoplasmicPER: { x: 334, y: 322 },
    nuclearPER: { x: 540, y: 248 },
    activator: { x: 410, y: 168 },
    repressor: { x: 540, y: 248 },
  },
  repression: {
    mRNA: { x: 188, y: 318 },
    cytoplasmicPER: { x: 310, y: 330 },
    nuclearPER: { x: 606, y: 254 },
    activator: { x: 410, y: 168 },
    repressor: { x: 532, y: 194 },
  },
  reset: {
    mRNA: { x: 180, y: 322 },
    cytoplasmicPER: { x: 260, y: 338 },
    nuclearPER: { x: 612, y: 286 },
    activator: { x: 410, y: 168 },
    repressor: { x: 620, y: 286 },
  },
};

const timelineValueKeys: Record<
  MolecularClockVariableId,
  keyof Pick<
    MolecularClockTimelinePoint,
    "mRNA" | "cytoplasmicPER" | "nuclearPER"
  >
> = {
  mRNA: "mRNA",
  cytoplasmicPER: "cytoplasmicPER",
  nuclearPER: "nuclearPER",
};

function normalizeHour(hour: number) {
  return ((Math.round(hour) % 24) + 24) % 24;
}

function categoryClass(category: ClockGeneCategory) {
  return `gene-${category}`;
}

function edgeClass(type: ClockEdgeType) {
  return `edge-${type}`;
}

function nodeById(id: string) {
  return clockGeneNodes.find((node) => node.id === id);
}

function containsQuery(node: ClockGeneNode, query: string) {
  const value = query.trim().toLowerCase();
  if (!value) return true;
  return [
    node.symbol,
    node.title,
    node.chromosome,
    ...node.aliases,
    ...node.tissues,
    ...node.diseaseAssociations.map((item) => item.disease),
  ]
    .join(" ")
    .toLowerCase()
    .includes(value);
}

function stageFromHour(hour: number): ClockLoopStage {
  const normalized = normalizeHour(hour);
  if (normalized >= 5 && normalized < 10) return "activation";
  if (normalized >= 10 && normalized < 15) return "translation";
  if (normalized >= 15 && normalized < 19) return "nuclearEntry";
  if (normalized >= 19 || normalized < 2) return "repression";
  return "reset";
}

function interpolate(a: number, b: number, progress: number) {
  return a + (b - a) * progress;
}

function interpolateTimeline(hour: number) {
  const normalized = normalizeHour(hour);
  const points = molecularClockTimeline.points;
  let left = points[0];
  let right = points[points.length - 1];

  for (let index = 0; index < points.length - 1; index += 1) {
    if (
      normalized >= points[index].hour &&
      normalized <= points[index + 1].hour
    ) {
      left = points[index];
      right = points[index + 1];
      break;
    }
  }

  const span = Math.max(1, right.hour - left.hour);
  const progress = (normalized - left.hour) / span;

  return {
    mRNA: interpolate(left.mRNA, right.mRNA, progress),
    cytoplasmicPER: interpolate(
      left.cytoplasmicPER,
      right.cytoplasmicPER,
      progress,
    ),
    nuclearPER: interpolate(left.nuclearPER, right.nuclearPER, progress),
  };
}

function activeAnnotation(hour: number) {
  const normalized = normalizeHour(hour);
  const annotations = molecularClockTimeline.annotations;
  let current = annotations[annotations.length - 1];
  for (const annotation of annotations) {
    if (normalized >= annotation.hour) current = annotation;
  }
  return current;
}

function valueForVariable(
  values: ReturnType<typeof interpolateTimeline>,
  id: MolecularClockVariableId,
) {
  return values[timelineValueKeys[id]];
}

const timelineMaxValue = 2;
const timelinePlotTop = 28;
const timelinePlotBottom = 166;
const timelinePlotHeight = timelinePlotBottom - timelinePlotTop;
const timelinePlotLeft = 44;
const timelinePlotWidth = 400;
const timelineLabelX = timelinePlotLeft + timelinePlotWidth + 10;
const timelineEndLabelGap = 15;

function hourToX(hour: number) {
  return timelinePlotLeft + (hour / 24) * timelinePlotWidth;
}

function yForValue(value: number) {
  return timelinePlotBottom - (value / timelineMaxValue) * timelinePlotHeight;
}

function staggerEndLabelYs(
  entries: Array<{ id: MolecularClockVariableId; y: number }>,
) {
  const sorted = [...entries].sort((a, b) => a.y - b.y);
  for (let index = 1; index < sorted.length; index += 1) {
    sorted[index].y = Math.max(
      sorted[index].y,
      sorted[index - 1].y + timelineEndLabelGap,
    );
  }

  const maxY = timelinePlotBottom - 2;
  for (let index = sorted.length - 1; index >= 0; index -= 1) {
    sorted[index].y = Math.min(sorted[index].y, maxY);
    if (index < sorted.length - 1) {
      sorted[index].y = Math.min(
        sorted[index].y,
        sorted[index + 1].y - timelineEndLabelGap,
      );
    }
  }

  const minY = timelinePlotTop + 2;
  for (let index = 0; index < sorted.length; index += 1) {
    sorted[index].y = Math.max(sorted[index].y, minY);
    if (index > 0) {
      sorted[index].y = Math.max(
        sorted[index].y,
        sorted[index - 1].y + timelineEndLabelGap,
      );
    }
  }

  return Object.fromEntries(sorted.map((entry) => [entry.id, entry.y])) as Record<
    MolecularClockVariableId,
    number
  >;
}

function peakHourForVariable(id: MolecularClockVariableId) {
  const key = timelineValueKeys[id];
  let peakHour = 0;
  let peakValue = -Infinity;
  for (const point of molecularClockTimeline.points) {
    const value = point[key];
    if (value > peakValue) {
      peakValue = value;
      peakHour = point.hour;
    }
  }
  return peakHour;
}

function pathForVariable(id: MolecularClockVariableId) {
  const key = timelineValueKeys[id];
  return molecularClockTimeline.points
    .map((point, index) => {
      const x = hourToX(point.hour);
      const y = yForValue(point[key]);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function TimedLoopView({
  selected,
  relatedEdges,
  setSelectedId,
  setQuery,
  setTab,
}: {
  selected: ClockGeneNode;
  relatedEdges: ClockGeneEdge[];
  setSelectedId: (id: string) => void;
  setQuery: (query: string) => void;
  setTab: (tab: GeneNetworkTab) => void;
}) {
  const { hour, setHour } = useCircadianTime();
  const stage = stageFromHour(hour);
  const layout = stageLayouts[stage];
  const values = interpolateTimeline(hour);
  const annotation = activeAnnotation(hour);
  const stageText = stageCopy[stage];
  const currentX = hourToX(normalizeHour(hour));
  const endPoint =
    molecularClockTimeline.points[molecularClockTimeline.points.length - 1];
  const endLabelYs = staggerEndLabelYs(
    molecularClockTimeline.variables.map((variable) => ({
      id: variable.id,
      y: yForValue(endPoint[timelineValueKeys[variable.id]]),
    })),
  );

  return (
    <div className="network-layout timed-loop-layout">
      <section className="timed-loop-panel visual-panel">
        <div className="timed-loop-header">
          <div>
              <p className="kicker">How the core loop works</p>
            <h3>{stageText.title}</h3>
            <p>{stageText.copy}</p>
          </div>
          <div className="loop-time-readout" aria-label="Current model time">
            <Clock3 size={18} aria-hidden="true" />
            <span>{formatMasterHour(hour)}</span>
          </div>
        </div>

        <div className="loop-scrubber">
          <label htmlFor="gene-loop-hour">
            <span>Model hour</span>
            <input
              id="gene-loop-hour"
              type="range"
              min="0"
              max="23"
              step="1"
              value={hour}
              onChange={(event) => setHour(Number(event.target.value))}
            />
          </label>
          <div aria-hidden="true">
            <span>00</span>
            <span>06</span>
            <span>12</span>
            <span>18</span>
            <span>24</span>
          </div>
        </div>

        <div className="timed-loop-grid">
          <div className="cell-schematic-wrap">
            <svg
              className="molecular-cell-svg"
              viewBox="0 0 760 420"
              role="img"
              aria-label="Kim and Forger inspired molecular clock cell schematic"
              data-stage={stage}
            >
              <title>Timed molecular clock loop</title>
              <defs>
                <marker
                  id="loop-arrow"
                  markerUnits="userSpaceOnUse"
                  markerWidth="14"
                  markerHeight="14"
                  refX="13"
                  refY="7"
                  orient="auto"
                >
                  <path d="M2,2 L13,7 L2,12 Z" />
                </marker>
                <marker
                  id="loop-bar"
                  markerUnits="userSpaceOnUse"
                  markerWidth="12"
                  markerHeight="16"
                  refX="9"
                  refY="8"
                  orient="auto"
                >
                  <path d="M9,2 L9,14" />
                </marker>
              </defs>

              <rect className="cell-boundary" x="34" y="42" width="692" height="326" rx="62" />
              <rect className="nucleus-boundary" x="318" y="74" width="360" height="230" rx="44" />

              <path
                className="compartment-label-line"
                d="M58 86 H282"
              />
              <text className="compartment-label" x="62" y="78">
                Cytoplasm
              </text>
              <path
                className="compartment-label-line"
                d="M342 110 H650"
              />
              <text className="compartment-label" x="346" y="102">
                Nucleus
              </text>

              <g className="gene-promoter bmal-promoter">
                <path d="M356 150 H642" />
                <rect x="500" y="130" width="112" height="34" rx="6" />
                <text x="556" y="152">Bmal1/Npas2</text>
              </g>
              <g className="gene-promoter per-promoter">
                <path d="M356 218 H642" />
                <rect x="388" y="202" width="132" height="34" rx="6" />
                <text x="454" y="224">Per1/2 Cry1/2</text>
              </g>
              <g className="gene-promoter rev-promoter">
                <path d="M356 264 H642" />
                <rect x="440" y="248" width="120" height="32" rx="6" />
                <text x="500" y="270">Rev-Erb</text>
              </g>

              <path
                className={`loop-arrow transcription ${stage === "activation" ? "active" : ""}`}
                d="M438 202 C394 206 332 232 238 286"
                markerEnd="url(#loop-arrow)"
              />
              <path
                className={`loop-arrow translation ${stage === "translation" ? "active" : ""}`}
                d="M216 306 C242 334 282 344 318 326"
                markerEnd="url(#loop-arrow)"
              />
              <path
                className={`loop-arrow transport ${stage === "nuclearEntry" ? "active" : ""}`}
                d="M334 314 C392 302 468 278 530 252"
                markerEnd="url(#loop-arrow)"
              />
              <path
                className={`loop-arrow repression ${stage === "repression" ? "active" : ""}`}
                d="M494 174 C536 186 560 196 578 214"
                markerEnd="url(#loop-bar)"
              />
              <path
                className={`loop-arrow reset ${stage === "reset" ? "active" : ""}`}
                d="M620 294 C642 326 610 350 570 342"
                markerEnd="url(#loop-arrow)"
              />

              <g
                className="activator-complex molecular-complex"
                transform={`translate(${layout.activator.x} ${layout.activator.y})`}
              >
                <circle className="bmal-dot" cx="-18" cy="0" r="24" />
                <circle className="clock-dot" cx="18" cy="0" r="24" />
                <text x="-18" y="5">BMAL</text>
                <text x="18" y="5">CLK</text>
              </g>

              <g
                className="mrna-particle"
                transform={`translate(${layout.mRNA.x} ${layout.mRNA.y})`}
              >
                <circle r={10 + values.mRNA * 5} />
                <path d="M-24 0 C-12 -10 12 10 24 0" />
                <text y="42">Per mRNA</text>
              </g>

              <g
                className="per-particle cytoplasmic"
                transform={`translate(${layout.cytoplasmicPER.x} ${layout.cytoplasmicPER.y})`}
              >
                <circle r={14 + values.cytoplasmicPER * 4.4} />
                <text y="5">PER</text>
                <text y="44">cytoplasmic PER</text>
              </g>

              <g
                className={`repressor-complex molecular-complex ${
                  stage === "reset" ? "fading" : ""
                }`}
                transform={`translate(${layout.repressor.x} ${layout.repressor.y})`}
              >
                <circle className="per-dot" cx="-18" cy="0" r="23" />
                <circle className="cry-dot" cx="18" cy="0" r="23" />
                <text x="-18" y="5">PER</text>
                <text x="18" y="5">CRY</text>
              </g>

              <g
                className="per-particle nuclear"
                transform={`translate(${layout.nuclearPER.x} ${layout.nuclearPER.y})`}
              >
                <circle r={12 + values.nuclearPER * 5} />
                <SvgModelLabel id="per-nuclear-P" x={0} y={5} className="compartment-label" anchor="middle" />
                <text y="44">nuclear PER</text>
              </g>

              <g className="phosphorylation-marks" aria-hidden="true">
                <circle cx="278" cy="286" r="5" />
                <circle cx="304" cy="304" r="5" />
                <circle cx="606" cy="118" r="5" />
                <path d="M274 278 L310 310" />
              </g>
            </svg>

            <div className="loop-stage-card">
              <span>{stageText.eyebrow}</span>
              <strong>{annotation.label}</strong>
              <p>{annotation.copy}</p>
              <button
                type="button"
                onClick={() => setSelectedId(stageText.selectId)}
              >
                <Dna size={15} aria-hidden="true" />
                Focus {nodeById(stageText.selectId)?.symbol ?? "gene"}
              </button>
            </div>
          </div>

          <div className="model-timeline-panel">
            <div className="model-panel-heading">
              <div>
                <p className="kicker">Optional model detail</p>
                <h4>Why the brake arrives late</h4>
                <p className="model-panel-explainer">
                  Each state peaks later than the last because synthesis and transport delay the brake.
                </p>
              </div>
              <div className="model-heading-state">
                <Waves size={20} aria-hidden="true" />
                <span>
                  {formatMasterHour(hour)} · {annotation.label}
                </span>
              </div>
            </div>

            <div className="model-curve-legend" aria-label="Curve key">
              {molecularClockTimeline.variables.map((variable) => (
                <span key={variable.id}>
                  <i style={{ background: variable.color }} aria-hidden="true" />
                  <ModelNotation id={variable.notationId} />
                  <em>{variable.label}</em>
                </span>
              ))}
            </div>

            <svg
              className="model-curve"
              viewBox="0 0 500 220"
              role="img"
              aria-label="Per mRNA, cytoplasmic PER, and nuclear PER model concentration curves with delay peak markers"
            >
              <title>Model-state curves for delayed PER feedback</title>
              {[0, 0.5, 1, 1.5, 2].map((tick) => (
                <g key={tick}>
                  <line
                    className="model-grid-line"
                    x1={timelinePlotLeft}
                    x2={timelinePlotLeft + timelinePlotWidth}
                    y1={yForValue(tick)}
                    y2={yForValue(tick)}
                  />
                  <text className="model-y-tick" x={timelinePlotLeft - 8} y={yForValue(tick) + 4}>
                    {tick.toFixed(1)}
                  </text>
                </g>
              ))}
              {[0, 6, 12, 18, 24].map((tick) => (
                <g key={tick}>
                  <line
                    className="model-axis-tick"
                    x1={hourToX(tick)}
                    x2={hourToX(tick)}
                    y1={timelinePlotTop - 4}
                    y2={timelinePlotBottom}
                  />
                  <text x={hourToX(tick)} y="198">
                    {tick === 24 ? "24" : String(tick).padStart(2, "0")}
                  </text>
                </g>
              ))}
              <line className="model-axis" x1={timelinePlotLeft} x2={timelinePlotLeft + timelinePlotWidth} y1={timelinePlotBottom} y2={timelinePlotBottom} />
              <line className="model-axis" x1={timelinePlotLeft} x2={timelinePlotLeft} y1={timelinePlotTop - 4} y2={timelinePlotBottom} />
              <line
                className="model-current-hour"
                x1={currentX}
                x2={currentX}
                y1={timelinePlotTop - 4}
                y2={timelinePlotBottom}
              />
              {molecularClockTimeline.variables.map((variable) => {
                const currentValue = valueForVariable(values, variable.id);
                const peakHour = peakHourForVariable(variable.id);
                const peakValue = valueForVariable(
                  interpolateTimeline(peakHour),
                  variable.id,
                );
                return (
                  <g key={variable.id}>
                    <path
                      className="model-variable-line"
                      d={pathForVariable(variable.id)}
                      style={{ stroke: variable.color }}
                    />
                    <circle
                      className="model-variable-dot"
                      cx={currentX}
                      cy={yForValue(currentValue)}
                      r="5.6"
                      style={{ fill: variable.color }}
                    />
                    <SvgModelLabel
                      id={variable.notationId}
                      x={timelineLabelX}
                      y={endLabelYs[variable.id]}
                      className="model-end-label"
                      anchor="start"
                    />
                    <g className="model-peak-marker">
                      <line
                        x1={hourToX(peakHour)}
                        x2={hourToX(peakHour)}
                        y1={yForValue(peakValue)}
                        y2={timelinePlotBottom}
                        stroke={variable.color}
                      />
                      <circle
                        cx={hourToX(peakHour)}
                        cy={yForValue(peakValue)}
                        r="4"
                        fill={variable.color}
                      />
                    </g>
                  </g>
                );
              })}
              <text className="model-peak-marker-label" x={hourToX(12)} y={timelinePlotBottom + 14}>
                Delay shifts each peak
              </text>
              <text className="model-axis-label" x="54" y="18">
                {molecularClockTimeline.units}
              </text>
            </svg>

            <div className="model-variable-list">
              {molecularClockTimeline.variables.map((variable) => (
                <article key={variable.id}>
                  <span style={{ background: variable.color }} />
                  <div>
                    <strong>
                      <ModelNotation id={variable.notationId} />{" "}
                      {valueForVariable(values, variable.id).toFixed(2)}
                    </strong>
                    <p>{variable.label}</p>
                  </div>
                </article>
              ))}
            </div>

            <p className="model-teaching-note">
              Teaching curves from a delayed-feedback model: message, then
              protein, then nuclear brake. That lag is why repression arrives
              after the rise.{" "}
              <CitationList
                ids={molecularClockTimeline.sourceIds}
                contextPrefix="timed-loop-model"
              />
            </p>
            <p className="model-caveat">{molecularClockTimeline.caveat}</p>
          </div>
        </div>

        <div className="loop-gene-strip" aria-label="Core loop gene shortcuts">
          {loopGeneButtons.map((geneId) => {
            const gene = nodeById(geneId);
            if (!gene) return null;
            return (
              <button
                type="button"
                key={gene.id}
                className={`${categoryClass(gene.category)} ${
                  selected.id === gene.id ? "selected" : ""
                }`}
                onClick={() => setSelectedId(gene.id)}
              >
                {gene.symbol}
              </button>
            );
          })}
          <button
            type="button"
            className="open-atlas-button"
            onClick={() => setTab("atlas")}
          >
            Explore the curated atlas
          </button>
        </div>
      </section>

      <GenePlayerCard
        key={selected.id}
        selected={selected}
        relatedEdges={relatedEdges}
        nodeById={nodeById}
        setSelectedId={setSelectedId}
        edgeClass={edgeClass}
        setQuery={(nextQuery) => {
          setQuery(nextQuery);
          setTab("atlas");
        }}
      />
    </div>
  );
}

export function GeneNetwork() {
  const [selectedId, setSelectedId] = useState("ARNTL");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ClockGeneCategory | "all">("all");
  const [scope, setScope] = useState<AtlasScope>("core");
  const [tab, setTab] = useState<GeneNetworkTab>("loop");

  const svgRef = useRef<SVGSVGElement>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<
    Record<string, { x: number; y: number }>
  >(() => {
    const initial: Record<string, { x: number; y: number }> = {};
    clockGeneNodes.forEach((node) => {
      initial[node.id] = { x: node.x, y: node.y };
    });
    return initial;
  });

  const selected = nodeById(selectedId) ?? clockGeneNodes[0];

  const visibleNodes = useMemo(() => {
    return clockGeneNodes.filter(
      (node) =>
        (scope === "all" || coreLoopIds.has(node.id)) &&
        (category === "all" || node.category === category) &&
        containsQuery(node, query),
    );
  }, [category, query, scope]);

  const visibleIds = useMemo(
    () => new Set(visibleNodes.map((node) => node.id)),
    [visibleNodes],
  );

  const relatedEdges = useMemo(
    () =>
      clockGeneEdges.filter(
        (edge) => edge.source === selected.id || edge.target === selected.id,
      ),
    [selected.id],
  );

  const activeIds = useMemo(
    () =>
      new Set([
        selected.id,
        ...relatedEdges.flatMap((edge) => [edge.source, edge.target]),
      ]),
    [relatedEdges, selected.id],
  );

  const focusId = hoveredId ?? selected.id;

  const handlePointerDown = (
    event: PointerEvent<SVGGElement>,
    id: string,
  ) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggedNodeId(id);
    setSelectedId(id);
  };

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!draggedNodeId || !svgRef.current) return;
    const svg = svgRef.current;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const cursorPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());

    setNodePositions((previous) => ({
      ...previous,
      [draggedNodeId]: { x: cursorPoint.x, y: cursorPoint.y },
    }));
  };

  const handlePointerUp = (event: PointerEvent<SVGGElement | SVGSVGElement>) => {
    if (!draggedNodeId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDraggedNodeId(null);
  };

  const handleResetLayout = () => {
    const initial: Record<string, { x: number; y: number }> = {};
    clockGeneNodes.forEach((node) => {
      initial[node.id] = { x: node.x, y: node.y };
    });
    setNodePositions(initial);
  };

  return (
    <div className="gene-network interactive-block">
      <div className="network-toolbar">
        <div
          className="segmented-control"
          role="tablist"
          aria-label="Gene network views"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "loop"}
            className={tab === "loop" ? "selected" : ""}
            onClick={() => setTab("loop")}
          >
            <Clock3 size={17} aria-hidden="true" />
            Timed loop
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "atlas"}
            className={tab === "atlas" ? "selected" : ""}
            onClick={() => setTab("atlas")}
          >
            <Network size={17} aria-hidden="true" />
            Atlas
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "sources"}
            className={tab === "sources" ? "selected" : ""}
            onClick={() => setTab("sources")}
          >
            <ShieldQuestion size={17} aria-hidden="true" />
            Data sources
          </button>
        </div>

        {tab === "atlas" ? (
          <div className="network-filters">
            <div className="network-scope" aria-label="Atlas scope">
              <button
                type="button"
                className={scope === "core" ? "selected" : ""}
                onClick={() => setScope("core")}
              >
                Core loop
              </button>
              <button
                type="button"
                className={scope === "all" ? "selected" : ""}
                onClick={() => setScope("all")}
              >
                All nodes
              </button>
            </div>
            <label>
              <Search size={16} aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search gene, tissue, disease"
              />
            </label>
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as ClockGeneCategory | "all")
              }
              aria-label="Filter by gene category"
            >
              <option value="all">All categories</option>
              {categoryOrder.map((item) => (
                <option key={item} value={item}>
                  {categoryLabels[item]}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleResetLayout}
              className="reset-button"
              title="Reset layout to original curated positions"
            >
              <RotateCcw size={14} aria-hidden="true" />
              Reset
            </button>
          </div>
        ) : null}
      </div>

      {tab === "sources" ? (
        <div className="source-browser">
          {circadianDataSources.map((source) => (
            <article key={source.id}>
              <p className="kicker">{source.id}</p>
              <h3>{source.name}</h3>
              <p>{source.purpose}</p>
              <span>{source.status}</span>
              <a href={source.url} target="_blank" rel="noreferrer">
                Open source <ExternalLink size={15} aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
      ) : tab === "loop" ? (
        <TimedLoopView
          selected={selected}
          relatedEdges={relatedEdges}
          setSelectedId={setSelectedId}
          setQuery={setQuery}
          setTab={setTab}
        />
      ) : (
        <div className="network-layout atlas-layout">
          <p className="network-curated-note">
            This is a curated teaching map, not a live database import.
          </p>
          <section
            className="network-canvas visual-panel"
            aria-label="Interactive core clock gene network atlas"
          >
            <div className="legend-row">
              {categoryOrder.map((item) => (
                <span key={item} className={categoryClass(item)}>
                  {categoryLabels[item]}
                </span>
              ))}
            </div>
            <svg
              viewBox="0 0 100 100"
              role="img"
              ref={svgRef}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              style={{ touchAction: "none" }}
            >
              <title>Core clock gene regulatory network atlas</title>
              {clockGeneEdges.map((edge) => {
                const sourceNode = nodeById(edge.source);
                const targetNode = nodeById(edge.target);
                if (!sourceNode || !targetNode) return null;

                const source = nodePositions[edge.source] || {
                  x: sourceNode.x,
                  y: sourceNode.y,
                };
                const target = nodePositions[edge.target] || {
                  x: targetNode.x,
                  y: targetNode.y,
                };

                const visible =
                  visibleIds.has(edge.source) && visibleIds.has(edge.target);
                const active =
                  edge.source === focusId ||
                  edge.target === focusId ||
                  edge.source === selected.id ||
                  edge.target === selected.id;
                return (
                  <line
                    key={edge.id}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    className={`network-edge ${edgeClass(edge.type)} ${
                      active ? "active" : ""
                    } ${visible ? "" : "hidden-edge"}`}
                  />
                );
              })}
              {clockGeneNodes.map((node) => {
                const position = nodePositions[node.id] || {
                  x: node.x,
                  y: node.y,
                };
                const isVisible = visibleIds.has(node.id);
                const active = activeIds.has(node.id);
                return (
                  <g
                    key={node.id}
                    className={`network-node ${categoryClass(node.category)} ${
                      node.id === selected.id ? "selected" : ""
                    } ${active ? "related" : ""} ${
                      isVisible ? "" : "muted-node"
                    }`}
                    onMouseEnter={() => setHoveredId(node.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onPointerDown={(event) => handlePointerDown(event, node.id)}
                    onPointerUp={handlePointerUp}
                    role="button"
                    tabIndex={0}
                    style={{
                      cursor: draggedNodeId === node.id ? "grabbing" : "grab",
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedId(node.id);
                      }
                    }}
                  >
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r={node.id === selected.id ? 4.2 : 3.4}
                    />
                    <text
                      x={position.x}
                      y={position.y - 5.2}
                      style={{ pointerEvents: "none" }}
                    >
                      {node.symbol}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="edge-legend" aria-label="Edge relationship legend">
              {Object.entries(edgeLabels).map(([key, label]) => (
                <span key={key} className={edgeClass(key as ClockEdgeType)}>
                  <i />
                  {label}
                </span>
              ))}
            </div>
          </section>

          <GenePlayerCard
            key={selected.id}
            selected={selected}
            relatedEdges={relatedEdges}
            nodeById={nodeById}
            setSelectedId={setSelectedId}
            edgeClass={edgeClass}
            setQuery={setQuery}
          />
        </div>
      )}
    </div>
  );
}
