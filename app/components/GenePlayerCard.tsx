"use client";

import { useState } from "react";
import { ArrowRight, Database, ExternalLink } from "lucide-react";
import type {
  ClockGeneNode,
  ClockGeneEdge,
  ClockGeneCategory,
  ClockEdgeType,
} from "../content/site-data";
import { StructureViewer } from "./StructureViewer";

const categoryLabels: Record<ClockGeneCategory, string> = {
  corePositive: "Core positive",
  coreNegative: "Core negative",
  secondaryLoop: "Secondary loop",
  accessoryRegulator: "Accessory regulator",
  organSystem: "Organ system",
  downstreamTarget: "Downstream target",
};

const categoryClass = (category: ClockGeneCategory) => {
  switch (category) {
    case "corePositive":
      return "bg-core-positive text-white";
    case "coreNegative":
      return "bg-core-negative text-white";
    case "secondaryLoop":
      return "bg-[#8d55d8] text-white";
    case "accessoryRegulator":
      return "bg-[#e8902f] text-white";
    case "organSystem":
      return "bg-[#eab308] text-white"; // yellow-500
    case "downstreamTarget":
      return "bg-[#10b981] text-white"; // emerald-500
    default:
      return "bg-gray-500 text-white";
  }
};

interface GenePlayerCardProps {
  selected: ClockGeneNode;
  relatedEdges: ClockGeneEdge[];
  nodeById: (id: string) => ClockGeneNode | undefined;
  setSelectedId: (id: string) => void;
  edgeClass: (type: ClockEdgeType) => string;
  setQuery: (query: string) => void;
}

interface LiveData {
  proteinName: string;
  functionDescription: string;
  aliases: string[];
  accession: string;
  openTargets?: {
    ensemblId: string;
    diseases: { name: string; score: number }[];
  };
}

export function GenePlayerCard({
  selected,
  relatedEdges,
  nodeById,
  setSelectedId,
  edgeClass,
  setQuery,
}: GenePlayerCardProps) {
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [selectedPdbId, setSelectedPdbId] = useState<string | null>(null);
  const [isFunctionExpanded, setIsFunctionExpanded] = useState(false);

  const fetchLiveData = async () => {
    setIsLoadingLive(true);
    setLiveError(null);
    try {
      const res = await fetch(`/api/gene/${selected.symbol}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch data for ${selected.symbol}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLiveData(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setLiveError(err.message || "Unknown error occurred");
      } else {
        setLiveError("Unknown error occurred");
      }
    } finally {
      setIsLoadingLive(false);
    }
  };

  return (
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

      {/* Live Data Section */}
      <div
        className="live-data-section"
        style={{
          marginTop: "1rem",
          padding: "1rem",
          background: "rgba(0,0,0,0.2)",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#9ca3af",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            <Database size={12} /> Live Database
          </span>
          {!liveData && (
            <button
              type="button"
              onClick={fetchLiveData}
              disabled={isLoadingLive}
              style={{
                fontSize: "0.75rem",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                background: "#3b82f6",
                color: "white",
                border: "none",
                cursor: isLoadingLive ? "wait" : "pointer",
              }}
            >
              {isLoadingLive ? "Fetching..." : "Fetch Data"}
            </button>
          )}
        </div>

        {liveError && (
          <div
            style={{
              color: "#ef4444",
              fontSize: "0.875rem",
              padding: "0.5rem",
              background: "rgba(239, 68, 68, 0.1)",
              borderRadius: "4px",
            }}
          >
            {liveError}
          </div>
        )}

        {liveData && (
          <div
            className="live-data-content"
            style={{ fontSize: "0.875rem", color: "#e5e7eb" }}
          >
            <div style={{ marginBottom: "0.5rem" }}>
              <strong style={{ color: "#9ca3af" }}>Protein Name:</strong>{" "}
              {liveData.proteinName}
            </div>
            {liveData.functionDescription && (
              <div style={{ marginBottom: "0.5rem" }}>
                <strong style={{ color: "var(--muted)" }}>
                  Function (UniProt):
                </strong>
                <p 
                  style={{ 
                    marginTop: "0.25rem", 
                    lineHeight: "1.4",
                    display: "-webkit-box",
                    WebkitLineClamp: isFunctionExpanded ? "unset" : 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {liveData.functionDescription}
                </p>
                {liveData.functionDescription.length > 150 && (
                  <button
                    type="button"
                    onClick={() => setIsFunctionExpanded(!isFunctionExpanded)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--cyan)",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      padding: 0,
                      marginTop: "0.25rem",
                      textDecoration: "underline"
                    }}
                  >
                    {isFunctionExpanded ? "Show less" : "Read more..."}
                  </button>
                )}
              </div>
            )}
            {liveData.aliases && liveData.aliases.length > 0 && (
              <div>
                <strong style={{ color: "#9ca3af" }}>Aliases:</strong>{" "}
                {liveData.aliases.join(", ")}
              </div>
            )}
            {liveData.openTargets &&
              liveData.openTargets.diseases?.length > 0 && (
                <div
                  style={{
                    marginTop: "0.75rem",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <strong style={{ color: "#9ca3af" }}>
                    Top Disease Associations (OpenTargets):
                  </strong>
                  <ul
                    style={{
                      margin: "0.25rem 0 0 1rem",
                      padding: 0,
                      fontSize: "0.8rem",
                    }}
                  >
                    {liveData.openTargets.diseases.map((d) => (
                      <li
                        key={d.name}
                        style={{ color: "#d1d5db", marginBottom: "0.125rem" }}
                      >
                        {d.name}{" "}
                        <span style={{ color: "#6b7280", fontSize: "0.7rem" }}>
                          (Score: {d.score.toFixed(2)})
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>
                    <a
                      href={`https://platform.opentargets.org/target/${liveData.openTargets.ensemblId}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: "#3b82f6",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      View on OpenTargets <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              )}
            <div style={{ marginTop: "0.75rem", fontSize: "0.75rem" }}>
              <a
                href={`https://www.uniprot.org/uniprotkb/${liveData.accession}/entry`}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#3b82f6",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                View on UniProt <ExternalLink size={10} />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 3D Structure Viewer */}
      {(selectedPdbId || liveData?.accession) && (
        <StructureViewer
          uniprotId={!selectedPdbId ? liveData?.accession : undefined}
          pdbId={selectedPdbId || undefined}
        />
      )}

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
            <div
              key={edge.id}
              onClick={() => setSelectedId(neighbor.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedId(neighbor.id);
                }
              }}
              role="button"
              tabIndex={0}
              className={edgeClass(edge.type)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "0.25rem",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <span>
                  {edge.source === selected.id ? "Regulates" : "Regulated by"}{" "}
                  <strong>{neighbor.symbol}</strong>
                </span>
                <ArrowRight size={15} aria-hidden="true" />
              </div>
              {edge.pdbId && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPdbId(edge.pdbId!);
                  }}
                  style={{
                    fontSize: "0.7rem",
                    padding: "0.125rem 0.375rem",
                    borderRadius: "4px",
                    background: "rgba(255,255,255,0.1)",
                    color: "#d1d5db",
                    border: "1px solid rgba(255,255,255,0.2)",
                    cursor: "pointer",
                  }}
                >
                  View Complex (PDB: {edge.pdbId})
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="external-links">
        <a
          href={selected.externalLinks.ncbiGene}
          target="_blank"
          rel="noreferrer"
        >
          NCBI Gene <ExternalLink size={14} aria-hidden="true" />
        </a>
        <a
          href={selected.externalLinks.uniProt}
          target="_blank"
          rel="noreferrer"
        >
          UniProt <ExternalLink size={14} aria-hidden="true" />
        </a>
        <a
          href={selected.externalLinks.circaKb}
          target="_blank"
          rel="noreferrer"
        >
          CircaKB <ExternalLink size={14} aria-hidden="true" />
        </a>
        <a
          href={selected.externalLinks.circaDb}
          target="_blank"
          rel="noreferrer"
        >
          CIRCA <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
    </aside>
  );
}
