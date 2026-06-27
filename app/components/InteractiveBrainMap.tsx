'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type * as THREE from 'three';
import { LocateFixed, Minus, Plus, RotateCcw } from 'lucide-react';
import { BrainScene } from './brain-scene';

/* ------------------------------------------------------------------ */
/*  Nucleus data — educational, citation-forward, never prescriptive  */
/* ------------------------------------------------------------------ */
interface NucleusInfo {
  id: string;
  structureNames: string[];
  abbr: string;
  fullName: string;
  color: string;
  neurotransmitter: string;
  circadianRole: string;
  peakActivity: string;
  keyConnections: string[];
  description: string;
  citation: string;
  speciesCaveat: string;
}

type BrainManifestNode = {
  id: string;
  name: string;
  category?: string;
};

type BrainManifest = {
  nodes: BrainManifestNode[];
};

type BrainSceneLayerState = {
  opacity?: number;
  visible?: boolean;
};

type BrainSceneApi = {
  THREE: typeof THREE;
  addGlowingSphere: (
    id: string,
    position: THREE.Vector3,
    colorHex: string,
    size?: number,
  ) => void;
  dispose: () => void;
  focusCategory?: (category: string) => void;
  focusNode?: (id: string) => void;
  meshById?: Map<string, THREE.Object3D[]>;
  selectNode: (id: string) => void;
  clearSelect: () => void;
  reset: () => void;
  frameNodes?: (ids: string[], padScale?: number) => void;
  zoom: (direction: number) => void;
  setAutoRotate: (value: boolean) => void;
  setHighlight: (activeIds?: string[], seenIds?: string[], activeColor?: string) => void;
  clearHighlight: () => void;
  setLayers: (layers: Record<string, BrainSceneLayerState>) => void;
  setPalette: (palette: Record<string, string>) => void;
};

type HoverLabel = {
  id: string;
  title: string;
  subtitle?: string;
  color?: string;
  x: number;
  y: number;
};

declare global {
  interface Window {
    BRAIN?: {
      nodes: BrainManifestNode[];
    };
  }
}

const NUCLEI: NucleusInfo[] = [
  {
    id: 'scn-node',
    structureNames: ['Anterior hypothalamus.l', 'Anterior hypothalamus.r'],
    abbr: 'SCN',
    fullName: 'Suprachiasmatic Nucleus',
    color: '#5D8A54',
    neurotransmitter: 'VIP · GRP (core) · AVP (shell) · GABA · PROK2 (output)',
    circadianRole: 'Master pacemaker',
    peakActivity: 'Mid-day (CT 6–8)',
    keyConnections: ['Retina (ipRGCs)', 'VLPO (via SPZ/DMH relay — indirect)', 'DMH → LHA', 'Pineal (via PVN → SCG sympathetic relay)'],
    description:
      'The SCN is the brain\'s master clock — a bilateral cluster of ~20,000 neurons (bilateral total) above the optic chiasm that receives direct light input from melanopsin-expressing retinal ganglion cells. It synchronises peripheral clocks throughout the body and drives the daily rhythm of melatonin, cortisol, core body temperature, and the sleep–wake cycle.',
    citation: 'Hastings et al., Nat Rev Neurosci 2018; Morin & Allen, Brain Res Rev 2006',
    speciesCaveat: 'Firing patterns based primarily on rodent models; circuit anatomy is conserved in humans.',
  },
  {
    id: 'tmn-node',
    structureNames: ['Tuberal hypothalamus.l', 'Tuberal hypothalamus.r'],
    abbr: 'TMN',
    fullName: 'Tuberomammillary Nucleus',
    color: '#4A8B7F',
    neurotransmitter: 'Histamine (+ GABA in a subset of neurons)',
    circadianRole: 'Wake-promoting',
    peakActivity: 'Active wakefulness — scales with alertness level',
    keyConnections: ['Cortex (diffuse)', 'VLPO (mutual inhibition — each silences the other)', 'LHA / orexin neurons', 'Basal forebrain'],
    description:
      'The TMN is the brain\'s sole source of neuronal histaminergic neurons. It fires during wakefulness and is virtually silent during both NREM and REM sleep. Antihistamines (e.g. diphenhydramine) cause drowsiness precisely because they block this wake-promoting signal. (First-generation antihistamines also have anticholinergic effects that add to their sedating action.) Many TMN neurons also co-release GABA, which modulates the precision of the wake signal. The TMN receives excitatory orexin input from the LHA and forms a mutual inhibitory loop with the VLPO.',
    citation: 'Saper et al., Nature 2005',
    speciesCaveat: 'Firing patterns based primarily on rodent models; circuit anatomy is conserved in humans.',
  },
  {
    id: 'vlpo-node',
    structureNames: ['Preoptic hypothalamus.l', 'Preoptic hypothalamus.r'],
    abbr: 'VLPO',
    fullName: 'Ventrolateral Preoptic Area',
    color: '#C05746',
    neurotransmitter: 'GABA, Galanin',
    circadianRole: 'Sleep-promoting',
    peakActivity: 'NREM sleep (core VLPO); REM sleep (extended VLPO)',
    keyConnections: ['TMN (inhibits)', 'LC / locus coeruleus (inhibits)', 'DRN / dorsal raphe (inhibits)', 'LHA / orexin neurons (inhibits during sleep)', 'SCN timing (indirect — via SPZ/DMH relay)'],
    description:
      'The VLPO is the brain\'s primary sleep switch. Its GABAergic / galaninergic neurons activate at sleep onset and silence the arousal centres (TMN, LC, raphe, orexin neurons) — producing the rapid, all-or-nothing transition from wake to sleep. A surrounding \'extended VLPO\' (eVLPO) contains neurons more active during REM sleep. Lesions of the VLPO cause profound insomnia in animal models.',
    citation: 'Sherin et al., Science 1996; Saper et al., Nature 2005',
    speciesCaveat: 'Co-expression rates and specific firing patterns are best characterised in rodent models; a homologous galaninergic population is confirmed in human postmortem studies.',
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export function InteractiveBrainMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<BrainSceneApi | null>(null);
  const structureToNucleusRef = useRef(new Map<string, string>());
  const nucleusToStructureIdsRef = useRef(new Map<string, string[]>());
  const nodeNameByIdRef = useRef(new Map<string, BrainManifestNode>());
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoverLabel, setHoverLabel] = useState<HoverLabel | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  const nucleiById = useRef(new Map(NUCLEI.map((nucleus) => [nucleus.id, nucleus])));
  const activeIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const getNucleusStructureIds = useCallback((nucleus: NucleusInfo | string) => {
    const nucleusId = typeof nucleus === 'string' ? nucleus : nucleus.id;
    return nucleusToStructureIdsRef.current.get(nucleusId) ?? [];
  }, []);

  const highlightNucleus = useCallback((nucleus: NucleusInfo | string, options?: { frame?: boolean }) => {
    const nucleusId = typeof nucleus === 'string' ? nucleus : nucleus.id;
    const nucleusInfo = nucleiById.current.get(nucleusId);
    const structureIds = getNucleusStructureIds(nucleusId);
    const activeIds = [...structureIds, nucleusId];
    const api = apiRef.current;

    if (!api) return;

    api.setHighlight(activeIds, undefined, nucleusInfo?.color);
    if (structureIds[0]) api.selectNode(structureIds[0]);
    else api.selectNode(nucleusId);

    if (options?.frame) {
      if (structureIds.length > 0) api.frameNodes?.(structureIds, 4.2);
      else api.focusNode?.(nucleusId);
    }
  }, [getNucleusStructureIds]);

  /* ---- 3D scene bootstrap ---- */
  useEffect(() => {
    if (!canvasRef.current) return;

    let api: BrainSceneApi | null = null;

    fetch('/models/manifest.json')
      .then(res => res.json())
      .then((manifestData: BrainManifest) => {
        window.BRAIN = { nodes: manifestData.nodes };
        nodeNameByIdRef.current = new Map(manifestData.nodes.map((node) => [node.id, node]));

        api = BrainScene.create(canvasRef.current, {
          url: '/models/brain.glb',
          dracoPath: '/vendor/draco/',
          onReady: () => {
            setLoading(false);

            api.setPalette({
              cortex: '#FCF8EE',
              white_matter: '#9aa6bd',
              deep_grey: '#1C2026',
              diencephalon: '#4A8B7F',
              brainstem: '#C05746',
              cerebellum: '#5D8A54',
              ventricles: '#2A303C',
              arteries: '#C05746',
              veins_sinuses: '#4A8B7F',
            });

            api.setLayers({
              diencephalon: { visible: true, opacity: 0.4 },
              brainstem: { visible: true, opacity: 0.4 },
              cortex: { visible: true, opacity: 0.1 },
              white_matter: { visible: false },
              deep_grey: { visible: false },
              cerebellum: { visible: false },
              arteries: { visible: false },
              veins_sinuses: { visible: false },
              cranial_nerves: { visible: false },
              tracts: { visible: false },
              meninges_dura: { visible: false },
            });

            structureToNucleusRef.current = new Map();
            nucleusToStructureIdsRef.current = new Map();
            NUCLEI.forEach((nucleus) => {
              const structureIds: string[] = [];
              nucleus.structureNames.forEach((name) => {
                const node = manifestData.nodes.find((n) => n.name === name);
                if (node) {
                  structureToNucleusRef.current.set(node.id, nucleus.id);
                  structureIds.push(node.id);
                }
              });
              nucleusToStructureIdsRef.current.set(nucleus.id, structureIds);
            });

            const getCentroid = (structureNames: string[]) => {
              const box = new api.THREE.Box3();
              let hasMesh = false;

              structureNames.forEach((name) => {
                const node = manifestData.nodes.find((n) => n.name === name);
                if (!node) return;

                const meshes = api.meshById?.get(node.id);
                meshes?.forEach((mesh) => {
                  if ('geometry' in mesh) {
                    box.expandByObject(mesh);
                    hasMesh = true;
                  }
                });
              });

              return hasMesh ? box.getCenter(new api.THREE.Vector3()) : null;
            };

            const [scn, tmn, vlpo] = NUCLEI;
            const scnPos = getCentroid(scn.structureNames);
            const tmnPos = getCentroid(tmn.structureNames);
            const vlpoPos = getCentroid(vlpo.structureNames);

            if (scnPos) {
              scnPos.y -= 0.002;
              scnPos.z += 0.001;
              api.addGlowingSphere('scn-node', scnPos, '#5D8A54', 0.0032);
            }
            if (tmnPos) {
              tmnPos.y -= 0.001;
              tmnPos.z -= 0.001;
              api.addGlowingSphere('tmn-node', tmnPos, '#4A8B7F', 0.003);
            }
            if (vlpoPos) {
              vlpoPos.y -= 0.002;
              api.addGlowingSphere('vlpo-node', vlpoPos, '#C05746', 0.003);
            }

            api.focusCategory('diencephalon');
          },
          onHover: (nodeId: string | null, point?: { x: number; y: number }) => {
            if (!nodeId) {
              setHoveredId(null);
              setHoverLabel(null);
              if (!activeIdRef.current) {
                api?.clearHighlight();
                api?.clearSelect();
              }
              return;
            }
            const nucleusId = structureToNucleusRef.current.get(nodeId) ?? nodeId;
            const nucleus = nucleiById.current.get(nucleusId);
            const manifestNode = nodeNameByIdRef.current.get(nodeId);

            setHoveredId(nucleusId);
            if (point) {
              setHoverLabel({
                id: nucleusId,
                title: nucleus ? nucleus.fullName : manifestNode?.name ?? 'Brain structure',
                subtitle: nucleus ? nucleus.abbr : manifestNode?.category,
                color: nucleus?.color,
                x: point.x,
                y: point.y,
              });
            }

            if (nucleus) {
              highlightNucleus(nucleus.id);
            }
          },
          onPick: (nodeId: string | null) => {
            if (!nodeId) return;
            const nucleusId = structureToNucleusRef.current.get(nodeId) ?? nodeId;
            if (NUCLEI.some((nucleus) => nucleus.id === nucleusId)) {
              setActiveId((current) => {
                const next = current === nucleusId ? null : nucleusId;
                if (next) {
                  highlightNucleus(next, { frame: true });
                } else {
                  api?.clearHighlight();
                  api?.clearSelect();
                  api?.focusCategory?.('diencephalon');
                }
                return next;
              });
            }
          },
        }) as BrainSceneApi;
        apiRef.current = api;
      });

    return () => {
      if (api) api.dispose();
    };
  }, [highlightNucleus]);

  /* ---- card interaction handlers ---- */
  const handleCardEnter = useCallback((nucleus: NucleusInfo) => {
    setHoveredId(nucleus.id);
    highlightNucleus(nucleus);
  }, [highlightNucleus]);

  const handleCardLeave = useCallback(() => {
    setHoveredId(null);
    setHoverLabel(null);
    if (activeId) return;
    const api = apiRef.current;
    if (api) {
      api.focusCategory?.('diencephalon');
      api.clearHighlight();
      api.clearSelect();
    }
  }, [activeId]);

  const handleCardClick = useCallback((nucleus: NucleusInfo) => {
    setActiveId(prev => {
      const next = prev === nucleus.id ? null : nucleus.id;
      const api = apiRef.current;
      if (api) {
        if (next) {
          highlightNucleus(next, { frame: true });
        } else {
          api.clearHighlight();
          api.clearSelect();
          api.focusCategory?.('diencephalon');
        }
      }
      return next;
    });
  }, [highlightNucleus]);

  const focusNucleus = useCallback((nucleus: NucleusInfo) => {
    setActiveId(nucleus.id);
    setHoveredId(nucleus.id);
    highlightNucleus(nucleus, { frame: true });
  }, [highlightNucleus]);

  const resetView = useCallback(() => {
    setActiveId(null);
    setHoveredId(null);
    setHoverLabel(null);
    const api = apiRef.current;
    if (api) {
      api.clearHighlight();
      api.clearSelect();
      api.reset();
      api.focusCategory?.('diencephalon');
    }
  }, []);

  const toggleAutoRotate = useCallback(() => {
    setAutoRotate((current) => {
      const next = !current;
      apiRef.current?.setAutoRotate(next);
      return next;
    });
  }, []);

  return (
    <div className="brain-map-container">
      {/* 3D Canvas */}
      <div className="brain-map-viewport">
        {loading && (
          <div className="brain-map-loader">
            <div className="brain-map-loader-pulse" />
            <span>Loading neuroanatomy…</span>
          </div>
        )}
        <canvas ref={canvasRef} className="brain-map-canvas" />
        {!loading && (
          <>
            <div className="brain-map-controls" aria-label="Brain map controls">
              <button type="button" onClick={resetView} aria-label="Reset brain view">
                <RotateCcw aria-hidden="true" size={16} />
              </button>
              <button type="button" onClick={toggleAutoRotate} aria-pressed={autoRotate} aria-label="Toggle brain rotation">
                <LocateFixed aria-hidden="true" size={16} />
              </button>
              <button type="button" onClick={() => apiRef.current?.zoom(-1)} aria-label="Zoom in">
                <Plus aria-hidden="true" size={16} />
              </button>
              <button type="button" onClick={() => apiRef.current?.zoom(1)} aria-label="Zoom out">
                <Minus aria-hidden="true" size={16} />
              </button>
            </div>

            <div className="brain-map-region-rail" aria-label="Key neuroanatomy regions">
              {NUCLEI.map((nucleus) => (
                <button
                  key={nucleus.id}
                  type="button"
                  className={activeId === nucleus.id || hoveredId === nucleus.id ? 'active' : ''}
                  style={{ '--nucleus-color': nucleus.color } as React.CSSProperties}
                  onMouseEnter={() => handleCardEnter(nucleus)}
                  onMouseLeave={handleCardLeave}
                  onFocus={() => handleCardEnter(nucleus)}
                  onBlur={handleCardLeave}
                  onClick={() => focusNucleus(nucleus)}
                >
                  <span>{nucleus.abbr}</span>
                  <strong>{nucleus.circadianRole}</strong>
                </button>
              ))}
            </div>

            {hoverLabel && (
              <div
                className="brain-map-hover-label"
                style={{
                  '--nucleus-color': hoverLabel.color ?? '#FCF8EE',
                  left: hoverLabel.x,
                  top: hoverLabel.y,
                } as React.CSSProperties}
              >
                {hoverLabel.subtitle && <span>{hoverLabel.subtitle}</span>}
                <strong>{hoverLabel.title}</strong>
              </div>
            )}
          </>
        )}
      </div>

      {/* Nucleus legend cards */}
      {!loading && (
        <div className="brain-map-legend">
          {NUCLEI.map(n => {
            const isHovered = hoveredId === n.id;
            const isActive = activeId === n.id;
            const isExpanded = isHovered || isActive;

            return (
              <div
                key={n.id}
                className={`brain-nucleus-card ${isExpanded ? 'expanded' : ''}`}
                style={{ '--nucleus-color': n.color } as React.CSSProperties}
                onMouseEnter={() => handleCardEnter(n)}
                onMouseLeave={handleCardLeave}
                onFocus={() => handleCardEnter(n)}
                onBlur={handleCardLeave}
                onClick={() => handleCardClick(n)}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleCardClick(n);
                  }
                }}
              >
                {/* Header row — always visible */}
                <div className="brain-nucleus-header">
                  <div
                    className="brain-nucleus-dot"
                    style={{ background: n.color, boxShadow: `0 0 10px ${n.color}, 0 0 20px ${n.color}40` }}
                  />
                  <div className="brain-nucleus-title">
                    <span className="brain-nucleus-abbr">{n.abbr}</span>
                    <span className="brain-nucleus-full">{n.fullName}</span>
                  </div>
                  <svg
                    className={`brain-nucleus-chevron ${isExpanded ? 'open' : ''}`}
                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                  >
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Expanded detail panel */}
                <div className="brain-nucleus-detail">
                  <p className="brain-nucleus-desc">{n.description}</p>

                  <div className="brain-nucleus-meta-grid">
                    <div className="brain-nucleus-meta">
                      <span className="brain-nucleus-meta-label">Neurotransmitter</span>
                      <span className="brain-nucleus-meta-value">{n.neurotransmitter}</span>
                    </div>
                    <div className="brain-nucleus-meta">
                      <span className="brain-nucleus-meta-label">Circadian role</span>
                      <span className="brain-nucleus-meta-value">{n.circadianRole}</span>
                    </div>
                    <div className="brain-nucleus-meta">
                      <span className="brain-nucleus-meta-label">Peak activity</span>
                      <span className="brain-nucleus-meta-value">{n.peakActivity}</span>
                    </div>
                  </div>

                  <div className="brain-nucleus-connections">
                    <span className="brain-nucleus-meta-label">Key connections</span>
                    <ul>
                      {n.keyConnections.map((c, i) => (
                        <li key={i}>
                          <span className="brain-conn-arrow" style={{ color: n.color }}>→</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="brain-nucleus-cite">{n.citation}</p>
                  <p className="brain-nucleus-caveat">{n.speciesCaveat}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
