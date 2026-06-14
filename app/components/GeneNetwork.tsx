"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  Network,
  Search,
  ShieldQuestion,
} from "lucide-react";
import {
  circadianDataSources,
  clockGeneEdges,
  clockGeneNodes,
} from "../content/site-data";
import type {
  ClockEdgeType,
  ClockGeneCategory,
  ClockGeneNode,
} from "../content/site-data";

const categoryLabels: Record<ClockGeneCategory, string> = {
  corePositive: "Core positive",
  coreNegative: "Core negative",
  secondaryLoop: "Secondary loop",
  accessoryRegulator: "Accessory regulator",
};

const edgeLabels: Record<ClockEdgeType, string> = {
  activation: "Activation",
  repression: "Repression",
  phosphorylation: "Phosphorylation",
  regulation: "Regulation",
};

const categoryOrder = Object.keys(categoryLabels) as ClockGeneCategory[];

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

export function GeneNetwork() {
  const [selectedId, setSelectedId] = useState("ARNTL");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ClockGeneCategory | "all">("all");
  const [tab, setTab] = useState<"network" | "sources">("network");

  const selected = nodeById(selectedId) ?? clockGeneNodes[0];

  const visibleNodes = useMemo(() => {
    return clockGeneNodes.filter(
      (node) =>
        (category === "all" || node.category === category) &&
        containsQuery(node, query),
    );
  }, [category, query]);

  const visibleIds = new Set(visibleNodes.map((node) => node.id));

  const relatedEdges = clockGeneEdges.filter(
    (edge) => edge.source === selected.id || edge.target === selected.id,
  );

  const activeIds = new Set([
    selected.id,
    ...relatedEdges.flatMap((edge) => [edge.source, edge.target]),
  ]);

  const focusId = hoveredId ?? selected.id;

  return (
    <div className="gene-network interactive-block">
      <div className="network-toolbar">
        <div className="segmented-control" role="tablist" aria-label="Gene network views">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "network"}
            className={tab === "network" ? "selected" : ""}
            onClick={() => setTab("network")}
          >
            <Network size={17} aria-hidden="true" />
            Clock network
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

        {tab === "network" ? (
          <div className="network-filters">
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
      ) : (
        <div className="network-layout">
          <section className="network-canvas visual-panel" aria-label="Interactive core clock gene network">
            <div className="legend-row">
              {categoryOrder.map((item) => (
                <span key={item} className={categoryClass(item)}>
                  {categoryLabels[item]}
                </span>
              ))}
            </div>
            <svg viewBox="0 0 100 100" role="img">
              <title>Core clock gene regulatory network</title>
              <defs>
                <marker
                  id="arrow-activation"
                  markerWidth="8"
                  markerHeight="8"
                  refX="7"
                  refY="4"
                  orient="auto"
                >
                  <path d="M0,0 L8,4 L0,8 Z" />
                </marker>
              </defs>
              {clockGeneEdges.map((edge) => {
                const source = nodeById(edge.source);
                const target = nodeById(edge.target);
                if (!source || !target) return null;
                const visible = visibleIds.has(source.id) && visibleIds.has(target.id);
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
                const isVisible = visibleIds.has(node.id);
                const active = activeIds.has(node.id);
                return (
                  <g
                    key={node.id}
                    className={`network-node ${categoryClass(node.category)} ${
                      node.id === selected.id ? "selected" : ""
                    } ${active ? "related" : ""} ${isVisible ? "" : "muted-node"}`}
                    onMouseEnter={() => setHoveredId(node.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => setSelectedId(node.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedId(node.id);
                      }
                    }}
                  >
                    <circle cx={node.x} cy={node.y} r={node.id === selected.id ? 4.2 : 3.4} />
                    <text x={node.x} y={node.y - 5.2}>
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

          <aside className="gene-player-card">
            <div className="player-top">
              <span className={categoryClass(selected.category)}>
                {categoryLabels[selected.category]}
              </span>
              <strong>{selected.chromosome}</strong>
            </div>
            <h3>{selected.symbol}</h3>
            <p className="aliases">{selected.aliases.join(" / ")}</p>
            <h4>{selected.title}</h4>
            <p>{selected.description}</p>

            <div className="expression-panel">
              <div>
                <span>Expression pattern</span>
                <p>{selected.expressionPattern}</p>
              </div>
              <div>
                <span>Rhythmic peak</span>
                <p>{selected.peakTime}</p>
              </div>
            </div>

            <div className="chip-section">
              <span>Tissue distribution</span>
              <div>
                {selected.tissues.map((tissue) => (
                  <button
                    type="button"
                    key={tissue}
                    onClick={() => setQuery(tissue)}
                    title={`Search ${tissue}`}
                  >
                    {tissue}
                  </button>
                ))}
              </div>
            </div>

            <div className="disease-section">
              <span>Disease associations</span>
              {selected.diseaseAssociations.map((association) => (
                <article key={association.disease}>
                  <strong>{association.disease}</strong>
                  <p>{association.mechanism}</p>
                  <small>{association.sources.join(" · ")}</small>
                </article>
              ))}
            </div>

            <div className="interaction-section">
              <span>Key interactions</span>
              {relatedEdges.map((edge) => {
                const neighborId =
                  edge.source === selected.id ? edge.target : edge.source;
                const neighbor = nodeById(neighborId);
                if (!neighbor) return null;
                return (
                  <button
                    type="button"
                    key={edge.id}
                    onClick={() => setSelectedId(neighbor.id)}
                    className={edgeClass(edge.type)}
                  >
                    <span>
                      {edge.source === selected.id ? "Regulates" : "Regulated by"}{" "}
                      <strong>{neighbor.symbol}</strong>
                    </span>
                    <ArrowRight size={15} aria-hidden="true" />
                  </button>
                );
              })}
            </div>

            <div className="external-links">
              <a href={selected.externalLinks.ncbiGene} target="_blank" rel="noreferrer">
                NCBI Gene <ExternalLink size={14} aria-hidden="true" />
              </a>
              <a href={selected.externalLinks.uniProt} target="_blank" rel="noreferrer">
                UniProt <ExternalLink size={14} aria-hidden="true" />
              </a>
              <a href={selected.externalLinks.circaKb} target="_blank" rel="noreferrer">
                CircaKB <ExternalLink size={14} aria-hidden="true" />
              </a>
              <a href={selected.externalLinks.circaDb} target="_blank" rel="noreferrer">
                CIRCA <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
