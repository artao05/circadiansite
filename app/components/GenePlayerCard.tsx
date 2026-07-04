"use client";

import { useState } from "react";
import { ArrowRight, Database, ExternalLink } from "lucide-react";
import type {
  ClockEdgeType,
  ClockGeneCategory,
  ClockGeneEdge,
  ClockGeneNode,
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

const categoryClass = (category: ClockGeneCategory) =>
  `gene-category-pill gene-${category}`;

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

function availableLinks(selected: ClockGeneNode) {
  return [
    ["NCBI Gene", selected.externalLinks.ncbiGene],
    ["UniProt", selected.externalLinks.uniProt],
    ["CircaKB", selected.externalLinks.circaKb],
    ["CIRCA", selected.externalLinks.circaDb],
  ].filter(([, url]) => Boolean(url));
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
      const response = await fetch(`/api/gene/${selected.symbol}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch data for ${selected.symbol}`);
      }
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setLiveData(data);
    } catch (error: unknown) {
      setLiveError(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
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

      <div className="gene-card-title">
        <h3>{selected.symbol}</h3>
        <p className="aliases">{selected.aliases.join(" / ")}</p>
      </div>

      <div className="gene-card-summary">
        <h4>{selected.title}</h4>
        <p>{selected.description}</p>
      </div>

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

      <details className="gene-detail-section interaction-section">
        <summary>
          <span>Key interactions</span>
          <small>{relatedEdges.length}</small>
        </summary>
        <div className="gene-detail-stack">
          {relatedEdges.map((edge) => {
            const neighborId =
              edge.source === selected.id ? edge.target : edge.source;
            const neighbor = nodeById(neighborId);
            if (!neighbor) return null;
            return (
              <article
                key={edge.id}
                onClick={() => setSelectedId(neighbor.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedId(neighbor.id);
                  }
                }}
                role="button"
                tabIndex={0}
                className={`interaction-card ${edgeClass(edge.type)}`}
              >
                <div>
                  <span>
                    {edge.source === selected.id ? "Regulates" : "Regulated by"}{" "}
                    <strong>{neighbor.symbol}</strong>
                  </span>
                  <ArrowRight size={15} aria-hidden="true" />
                </div>
                <p>
                  {edge.label}: {edge.description}
                </p>
                <small>Sources: {edge.sources.join(" / ")}</small>
                {edge.pdbId && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedPdbId(edge.pdbId ?? null);
                    }}
                  >
                    View complex PDB {edge.pdbId}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </details>

      {selectedPdbId || liveData?.accession ? (
        <StructureViewer
          uniprotId={!selectedPdbId ? liveData?.accession : undefined}
          pdbId={selectedPdbId || undefined}
        />
      ) : null}

      <details className="gene-detail-section disease-section">
        <summary>
          <span>Disease associations</span>
          <small>{selected.diseaseAssociations.length}</small>
        </summary>
        <div className="gene-detail-stack">
          {selected.diseaseAssociations.map((association) => (
            <article key={association.disease}>
              <strong>{association.disease}</strong>
              <p>{association.mechanism}</p>
              <small>{association.sources.join(" / ")}</small>
            </article>
          ))}
        </div>
      </details>

      <details className="gene-detail-section live-data-section">
        <summary>
          <span>
            <Database size={13} aria-hidden="true" />
            Live database
          </span>
          <small>Optional</small>
        </summary>
        <div className="live-data-content">
          {!liveData ? (
            <button
              type="button"
              onClick={fetchLiveData}
              disabled={isLoadingLive}
              className="live-data-button"
            >
              {isLoadingLive ? "Fetching..." : "Fetch UniProt data"}
            </button>
          ) : null}

          {liveError ? <p className="live-data-error">{liveError}</p> : null}

          {liveData ? (
            <div className="live-data-result">
              <div>
                <strong>Protein name</strong>
                <p>{liveData.proteinName}</p>
              </div>
              {liveData.functionDescription ? (
                <div>
                  <strong>Function (UniProt)</strong>
                  <p className={isFunctionExpanded ? "expanded" : ""}>
                    {liveData.functionDescription}
                  </p>
                  {liveData.functionDescription.length > 150 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setIsFunctionExpanded((isExpanded) => !isExpanded)
                      }
                    >
                      {isFunctionExpanded ? "Show less" : "Read more"}
                    </button>
                  ) : null}
                </div>
              ) : null}
              {liveData.aliases.length > 0 ? (
                <div>
                  <strong>Aliases</strong>
                  <p>{liveData.aliases.join(", ")}</p>
                </div>
              ) : null}
              {liveData.openTargets?.diseases?.length ? (
                <div>
                  <strong>Top disease associations (OpenTargets)</strong>
                  <ul>
                    {liveData.openTargets.diseases.map((disease) => (
                      <li key={disease.name}>
                        {disease.name}{" "}
                        <span>{disease.score.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`https://platform.opentargets.org/target/${liveData.openTargets.ensemblId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View on OpenTargets
                    <ExternalLink size={11} aria-hidden="true" />
                  </a>
                </div>
              ) : null}
              <a
                href={`https://www.uniprot.org/uniprotkb/${liveData.accession}/entry`}
                target="_blank"
                rel="noreferrer"
              >
                View on UniProt <ExternalLink size={11} aria-hidden="true" />
              </a>
            </div>
          ) : null}
        </div>
      </details>

      <details className="gene-detail-section external-link-section">
        <summary>
          <span>External links</span>
          <small>{availableLinks(selected).length}</small>
        </summary>
        <div className="external-links">
          {availableLinks(selected).map(([label, url]) => (
            <a key={label} href={url} target="_blank" rel="noreferrer">
              {label} <ExternalLink size={14} aria-hidden="true" />
            </a>
          ))}
        </div>
      </details>
    </aside>
  );
}
