"use client";

import { useMemo, useState, useRef } from "react";
import {
  ExternalLink,
  Network,
  Search,
  ShieldQuestion,
  RotateCcw,
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
import { GenePlayerCard } from "./GenePlayerCard";

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

  // Dragging state
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

  const handlePointerDown = (
    e: React.PointerEvent<SVGGElement>,
    id: string,
  ) => {
    e.target.setPointerCapture(e.pointerId);
    setDraggedNodeId(id);
    setSelectedId(id);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggedNodeId || !svgRef.current) return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursorPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    setNodePositions((prev) => ({
      ...prev,
      [draggedNodeId]: { x: cursorPt.x, y: cursorPt.y },
    }));
  };

  const handlePointerUp = (
    e: React.PointerEvent<SVGGElement | SVGSVGElement>,
  ) => {
    if (draggedNodeId) {
      e.target.releasePointerCapture(e.pointerId);
      setDraggedNodeId(null);
    }
  };

  const handleResetLayout = () => {
    const initial: Record<string, { x: number; y: number }> = {};
    clockGeneNodes.forEach((node) => {
      initial[node.id] = { x: node.x, y: node.y };
    });
    setNodePositions(initial);
  };

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
        <div
          className="segmented-control"
          role="tablist"
          aria-label="Gene network views"
        >
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
            <button
              type="button"
              onClick={handleResetLayout}
              className="reset-button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "transparent",
                border: "1px solid #374151",
                color: "#9ca3af",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
              title="Reset layout to original curated positions"
            >
              <RotateCcw size={14} /> Reset
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
      ) : (
        <div className="network-layout">
          <section
            className="network-canvas visual-panel"
            aria-label="Interactive core clock gene network"
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
                const pos = nodePositions[node.id] || { x: node.x, y: node.y };
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
                    onPointerDown={(e) => handlePointerDown(e, node.id)}
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
                      cx={pos.x}
                      cy={pos.y}
                      r={node.id === selected.id ? 4.2 : 3.4}
                    />
                    <text
                      x={pos.x}
                      y={pos.y - 5.2}
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
