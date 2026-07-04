'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type * as THREE from 'three';
import { ChevronDown, LocateFixed, Minus, Plus, RotateCcw } from 'lucide-react';
import { BrainScene } from './brain-scene';

/* ------------------------------------------------------------------ */
/*  Region data — educational, citation-forward, never prescriptive   */
/* ------------------------------------------------------------------ */
type ConnectionTone = 'light' | 'timing' | 'quieting' | 'wake' | 'night';

type ConnectionInfo = {
  id: string;
  label: string;
  description: string;
  tone: ConnectionTone;
  direction: 'incoming' | 'outgoing';
  targetStructureNames: string[];
  fallbackTarget: {
    x: number;
    y: number;
  };
  labelOffset: {
    x: number;
    y: number;
  };
};

type EvidenceRow = {
  claim: string;
  source: string;
};

interface NucleusInfo {
  id: string;
  structureNames: string[];
  displayName: string;
  formalName: string;
  color: string;
  role: string;
  signalStyle: string;
  activeWhen: string;
  fallbackPosition: {
    x: number;
    y: number;
  };
  connections: ConnectionInfo[];
  description: string;
  evidence: EvidenceRow[];
  caveat: string;
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
  projectNodeIds?: (ids: string[]) => ProjectedPoint | null;
  setLayers: (layers: Record<string, BrainSceneLayerState>) => void;
  setPalette: (palette: Record<string, string>) => void;
};

type ProjectedPoint = {
  x: number;
  y: number;
  visible?: boolean;
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
    id: 'master-clock-node',
    structureNames: ['Anterior hypothalamus.l', 'Anterior hypothalamus.r'],
    displayName: 'Master clock',
    formalName: 'Suprachiasmatic nucleus',
    color: '#5D8A54',
    role: 'Turns light into body time',
    signalStyle: 'A daily timing pulse',
    activeWhen: 'Most active during the biological day',
    fallbackPosition: { x: 49, y: 48 },
    connections: [
      {
        id: 'light-from-eyes',
        label: 'Light from the eyes',
        description: 'Special light-sensing cells in the eyes send time-of-day information into the master clock.',
        tone: 'light',
        direction: 'incoming',
        targetStructureNames: ['Optic nerve (II).l', 'Optic nerve (II).r', 'Optic chiasm.l', 'Optic chiasm.r'],
        fallbackTarget: { x: 16, y: 39 },
        labelOffset: { x: -13, y: -7 },
      },
      {
        id: 'sleep-timing',
        label: 'Timing for sleep',
        description: 'The master clock helps make sleep easier or harder through relay regions in the hypothalamus.',
        tone: 'timing',
        direction: 'outgoing',
        targetStructureNames: ['Preoptic hypothalamus.l', 'Preoptic hypothalamus.r'],
        fallbackTarget: { x: 55, y: 68 },
        labelOffset: { x: 10, y: 10 },
      },
      {
        id: 'night-hormone',
        label: 'Night hormone',
        description: 'A multi-step nerve pathway helps the pineal gland release melatonin at night.',
        tone: 'night',
        direction: 'outgoing',
        targetStructureNames: ['Pineal gland'],
        fallbackTarget: { x: 78, y: 41 },
        labelOffset: { x: 11, y: -9 },
      },
    ],
    description:
      'This small clock sits above the crossing point of the optic nerves. It uses light information to keep daily rhythms aligned across sleep, hormones, temperature, and body tissues.',
    evidence: [
      {
        claim: 'Light information reaches the master clock from the eyes.',
        source: 'Morin and Allen, Brain Research Reviews, 2006.',
      },
      {
        claim: 'The master clock shapes sleep timing mostly through relay regions.',
        source: 'Saper and colleagues, Nature, 2005.',
      },
      {
        claim: 'The melatonin signal is controlled through a multi-step nerve pathway to the pineal gland.',
        source: 'Hastings and colleagues, Nature Reviews Neuroscience, 2018.',
      },
    ],
    caveat: 'The pathway is simplified for teaching; several relay regions are grouped together.',
  },
  {
    id: 'wakefulness-hub-node',
    structureNames: ['Tuberal hypothalamus.l', 'Tuberal hypothalamus.r'],
    displayName: 'Wakefulness hub',
    formalName: 'Tuberomammillary nucleus',
    color: '#4A8B7F',
    role: 'Spreads an alerting signal',
    signalStyle: 'A broad histamine signal',
    activeWhen: 'Most active during wakefulness',
    fallbackPosition: { x: 52, y: 58 },
    connections: [
      {
        id: 'alert-cortex',
        label: 'Alert cortex',
        description: 'This hub sends a broad wakefulness signal toward the thinking parts of the brain.',
        tone: 'wake',
        direction: 'outgoing',
        targetStructureNames: ['Orbital gyri.l', 'Orbital gyri.r', 'Inferior frontal sulcus.l', 'Inferior frontal sulcus.r'],
        fallbackTarget: { x: 54, y: 18 },
        labelOffset: { x: -8, y: -12 },
      },
      {
        id: 'stay-awake-input',
        label: 'Stay-awake input',
        description: 'Nearby orexin neurons help stabilize the wakefulness hub when the brain needs to stay alert.',
        tone: 'timing',
        direction: 'incoming',
        targetStructureNames: ['Lateral hypothalamus.l', 'Lateral hypothalamus.r'],
        fallbackTarget: { x: 77, y: 62 },
        labelOffset: { x: 13, y: 5 },
      },
      {
        id: 'sleep-switch-quiet',
        label: 'Sleep switch quiets it',
        description: 'During sleep, the sleep switch turns this wake signal down.',
        tone: 'quieting',
        direction: 'incoming',
        targetStructureNames: ['Preoptic hypothalamus.l', 'Preoptic hypothalamus.r'],
        fallbackTarget: { x: 42, y: 70 },
        labelOffset: { x: -16, y: 10 },
      },
    ],
    description:
      'This wakefulness hub is one of the brain\'s main sources of histamine signaling. It is active while awake, quiet during sleep, and helps keep the cortex in an alert state.',
    evidence: [
      {
        claim: 'Histamine neurons are active during waking and quiet during sleep.',
        source: 'Saper and colleagues, Nature, 2005.',
      },
      {
        claim: 'The wakefulness hub sends broad alerting signals through the brain.',
        source: 'Haas and colleagues, Physiological Reviews, 2008.',
      },
      {
        claim: 'Orexin neurons help stabilize wake-promoting systems.',
        source: 'Saper and colleagues, Nature, 2005.',
      },
    ],
    caveat: 'The broad cortex glow represents a diffuse alerting system, not a single wire-like tract.',
  },
  {
    id: 'sleep-switch-node',
    structureNames: ['Preoptic hypothalamus.l', 'Preoptic hypothalamus.r'],
    displayName: 'Sleep switch',
    formalName: 'Ventrolateral preoptic area',
    color: '#C05746',
    role: 'Turns down arousal',
    signalStyle: 'A quieting sleep signal',
    activeWhen: 'Most active during sleep',
    fallbackPosition: { x: 43, y: 70 },
    connections: [
      {
        id: 'quiet-wake-hub',
        label: 'Quiets wakefulness hub',
        description: 'The sleep switch inhibits the histamine wake signal.',
        tone: 'quieting',
        direction: 'outgoing',
        targetStructureNames: ['Tuberal hypothalamus.l', 'Tuberal hypothalamus.r'],
        fallbackTarget: { x: 52, y: 58 },
        labelOffset: { x: 13, y: -7 },
      },
      {
        id: 'quiet-alert-centers',
        label: 'Quiets alert centers',
        description: 'It also helps quiet other alerting centers in the brainstem.',
        tone: 'quieting',
        direction: 'outgoing',
        targetStructureNames: ['Pons.l', 'Pons.r', 'Midbrain.l', 'Midbrain.r'],
        fallbackTarget: { x: 36, y: 88 },
        labelOffset: { x: -15, y: 11 },
      },
      {
        id: 'clock-timing-input',
        label: 'Clock timing input',
        description: 'The master clock helps set when the sleep switch is more likely to win.',
        tone: 'timing',
        direction: 'incoming',
        targetStructureNames: ['Anterior hypothalamus.l', 'Anterior hypothalamus.r'],
        fallbackTarget: { x: 49, y: 48 },
        labelOffset: { x: 12, y: -9 },
      },
    ],
    description:
      'The sleep switch is a sleep-promoting region near the front of the hypothalamus. When it becomes active, it helps silence wake-promoting systems so sleep can take hold.',
    evidence: [
      {
        claim: 'Sleep-active neurons in this region were identified in animal studies.',
        source: 'Sherin and colleagues, Science, 1996.',
      },
      {
        claim: 'The sleep switch inhibits wake-promoting systems.',
        source: 'Saper and colleagues, Nature, 2005.',
      },
      {
        claim: 'Human postmortem work supports a similar sleep-promoting cell group.',
        source: 'Gaus and colleagues, The Journal of Neuroscience, 2002.',
      },
    ],
    caveat: 'The switch metaphor is simplified; real sleep control is distributed across several brain regions.',
  },
];

const NUCLEI_BY_ID = new Map(NUCLEI.map((nucleus) => [nucleus.id, nucleus]));

const toneClass: Record<ConnectionTone, string> = {
  light: 'light',
  timing: 'timing',
  quieting: 'quieting',
  wake: 'wake',
  night: 'night',
};

const connectionPath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2 - 10;
  return `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
};

const clampOverlayPoint = (point: { x: number; y: number }) => ({
  x: Math.min(92, Math.max(8, point.x)),
  y: Math.min(86, Math.max(10, point.y)),
});

const pointsAreClose = (a?: ProjectedPoint, b?: ProjectedPoint) => {
  if (!a || !b) return false;
  return Math.abs(a.x - b.x) < 0.25 && Math.abs(a.y - b.y) < 0.25 && a.visible === b.visible;
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export function InteractiveBrainMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<BrainSceneApi | null>(null);
  const structureToNucleusRef = useRef(new Map<string, string>());
  const nucleusToStructureIdsRef = useRef(new Map<string, string[]>());
  const connectionToStructureIdsRef = useRef(new Map<string, string[]>());
  const nodeNameByIdRef = useRef(new Map<string, BrainManifestNode>());
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoverLabel, setHoverLabel] = useState<HoverLabel | null>(null);
  const [activeId, setActiveId] = useState<string | null>(NUCLEI[0].id);
  const [autoRotate, setAutoRotate] = useState(true);
  const [openEvidenceId, setOpenEvidenceId] = useState<string | null>(null);
  const [anchorPositions, setAnchorPositions] = useState<Record<string, ProjectedPoint>>({});

  const activeIdRef = useRef<string | null>(null);
  const visibleNucleus = NUCLEI_BY_ID.get(hoveredId ?? activeId ?? NUCLEI[0].id) ?? NUCLEI[0];

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const getNucleusStructureIds = useCallback((nucleus: NucleusInfo | string) => {
    const nucleusId = typeof nucleus === 'string' ? nucleus : nucleus.id;
    return nucleusToStructureIdsRef.current.get(nucleusId) ?? [];
  }, []);

  const getAnchorPoint = useCallback((key: string, fallback: { x: number; y: number }) => {
    const projected = anchorPositions[key];
    return projected?.visible === false ? fallback : projected ?? fallback;
  }, [anchorPositions]);

  const getConnectionTargetPoint = useCallback((connection: ConnectionInfo) => (
    getAnchorPoint(connection.id, connection.fallbackTarget)
  ), [getAnchorPoint]);

  const getConnectionLabelPoint = useCallback((source: { x: number; y: number }, target: { x: number; y: number }, connection: ConnectionInfo) => (
    clampOverlayPoint({
      x: (source.x + target.x) / 2 + connection.labelOffset.x,
      y: (source.y + target.y) / 2 + connection.labelOffset.y,
    })
  ), []);

  const highlightNucleus = useCallback((nucleus: NucleusInfo | string, options?: { frame?: boolean }) => {
    const nucleusId = typeof nucleus === 'string' ? nucleus : nucleus.id;
    const nucleusInfo = NUCLEI_BY_ID.get(nucleusId);
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
            connectionToStructureIdsRef.current = new Map();
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

              nucleus.connections.forEach((connection) => {
                const targetIds = connection.targetStructureNames
                  .map((name) => manifestData.nodes.find((n) => n.name === name)?.id)
                  .filter((id): id is string => Boolean(id));
                connectionToStructureIdsRef.current.set(connection.id, targetIds);
              });
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

            const [masterClock, wakefulnessHub, sleepSwitch] = NUCLEI;
            const masterClockPos = getCentroid(masterClock.structureNames);
            const wakefulnessHubPos = getCentroid(wakefulnessHub.structureNames);
            const sleepSwitchPos = getCentroid(sleepSwitch.structureNames);

            if (masterClockPos) {
              masterClockPos.y -= 0.002;
              masterClockPos.z += 0.001;
              api.addGlowingSphere(masterClock.id, masterClockPos, masterClock.color, 0.0032);
            }
            if (wakefulnessHubPos) {
              wakefulnessHubPos.y -= 0.001;
              wakefulnessHubPos.z -= 0.001;
              api.addGlowingSphere(wakefulnessHub.id, wakefulnessHubPos, wakefulnessHub.color, 0.003);
            }
            if (sleepSwitchPos) {
              sleepSwitchPos.y -= 0.002;
              api.addGlowingSphere(sleepSwitch.id, sleepSwitchPos, sleepSwitch.color, 0.003);
            }

            api.focusCategory('diencephalon');
            highlightNucleus(NUCLEI[0].id, { frame: true });
          },
          onHover: (nodeId: string | null, point?: { x: number; y: number }) => {
            if (!nodeId) {
              setHoveredId(null);
              setHoverLabel(null);
              if (activeIdRef.current) {
                highlightNucleus(activeIdRef.current);
              } else {
                api?.clearHighlight();
                api?.clearSelect();
              }
              return;
            }
            const nucleusId = structureToNucleusRef.current.get(nodeId) ?? nodeId;
            const nucleus = NUCLEI_BY_ID.get(nucleusId);
            const manifestNode = nodeNameByIdRef.current.get(nodeId);

            setHoveredId(nucleusId);
            if (point) {
              setHoverLabel({
                id: nucleusId,
                title: nucleus ? nucleus.displayName : manifestNode?.name ?? 'Brain structure',
                subtitle: nucleus ? nucleus.role : manifestNode?.category,
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
    const api = apiRef.current;
    if (activeId) {
      highlightNucleus(activeId);
      return;
    }
    if (api) {
      api.focusCategory?.('diencephalon');
      api.clearHighlight();
      api.clearSelect();
    }
  }, [activeId, highlightNucleus]);

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
    setActiveId(NUCLEI[0].id);
    setHoveredId(null);
    setHoverLabel(null);
    setOpenEvidenceId(null);
    const api = apiRef.current;
    if (api) {
      api.reset();
      api.focusCategory?.('diencephalon');
      highlightNucleus(NUCLEI[0].id, { frame: true });
    }
  }, [highlightNucleus]);

  const toggleAutoRotate = useCallback(() => {
    setAutoRotate((current) => {
      const next = !current;
      apiRef.current?.setAutoRotate(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (loading) return undefined;

    let frameId = 0;
    let disposed = false;

    const updateProjectedAnchors = () => {
      const api = apiRef.current;

      if (api?.projectNodeIds) {
        const next: Record<string, ProjectedPoint> = {};
        const sourcePoint = api.projectNodeIds(getNucleusStructureIds(visibleNucleus.id));

        if (sourcePoint) next[`${visibleNucleus.id}:source`] = sourcePoint;

        visibleNucleus.connections.forEach((connection) => {
          const targetPoint = api.projectNodeIds?.(connectionToStructureIdsRef.current.get(connection.id) ?? []);
          if (targetPoint) next[connection.id] = targetPoint;
        });

        setAnchorPositions((current) => {
          const currentKeys = Object.keys(current);
          const nextKeys = Object.keys(next);
          const changed = currentKeys.length !== nextKeys.length
            || nextKeys.some((key) => !pointsAreClose(current[key], next[key]));

          return changed ? next : current;
        });
      }

      if (!disposed) frameId = requestAnimationFrame(updateProjectedAnchors);
    };

    updateProjectedAnchors();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
    };
  }, [getNucleusStructureIds, loading, visibleNucleus]);

  const sourcePoint = getAnchorPoint(`${visibleNucleus.id}:source`, visibleNucleus.fallbackPosition);
  const connectionLayouts = visibleNucleus.connections.map((connection) => {
    const targetPoint = getConnectionTargetPoint(connection);
    const from = connection.direction === 'incoming' ? targetPoint : sourcePoint;
    const to = connection.direction === 'incoming' ? sourcePoint : targetPoint;

    return {
      connection,
      targetPoint,
      labelPoint: getConnectionLabelPoint(sourcePoint, targetPoint, connection),
      path: connectionPath(from, to),
    };
  });

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
            <div
              className="brain-connection-overlay"
              aria-label={`${visibleNucleus.displayName} connections`}
              style={{ '--nucleus-color': visibleNucleus.color } as React.CSSProperties}
            >
              <div className="brain-connection-heading">
                <span>Anatomic region</span>
                <strong>{visibleNucleus.formalName}</strong>
              </div>

              <svg className="brain-connection-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <marker id="brain-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                    <path d="M 0 0 L 8 4 L 0 8 z" fill="context-stroke" />
                  </marker>
                  <marker id="brain-quiet-stop" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                    <path d="M 6 0 L 6 8" stroke="context-stroke" strokeWidth="2" strokeLinecap="round" />
                  </marker>
                </defs>
                {connectionLayouts.map(({ connection, path }) => {
                  const markerEnd = connection.tone === 'quieting' ? 'url(#brain-quiet-stop)' : 'url(#brain-arrow)';

                  return (
                    <path
                      key={connection.id}
                      className={`brain-connection-line ${toneClass[connection.tone]}`}
                      d={path}
                      markerEnd={markerEnd}
                    />
                  );
                })}
              </svg>

              <div
                className="brain-connection-source-pin"
                style={{
                  left: `${sourcePoint.x}%`,
                  top: `${sourcePoint.y}%`,
                }}
                aria-hidden="true"
              />

              {connectionLayouts.map(({ connection, targetPoint, labelPoint }) => (
                <React.Fragment key={connection.id}>
                  <div
                    className={`brain-connection-target ${toneClass[connection.tone]}`}
                    style={{
                      left: `${targetPoint.x}%`,
                      top: `${targetPoint.y}%`,
                    }}
                    aria-hidden="true"
                  />
                  <div
                    className={`brain-connection-label ${toneClass[connection.tone]}`}
                    style={{
                      left: `${labelPoint.x}%`,
                      top: `${labelPoint.y}%`,
                    }}
                  >
                    <span className="brain-connection-dot" aria-hidden="true" />
                    <span className="brain-connection-copy">
                      <em>{connection.direction === 'incoming' ? 'Input' : 'Output'}</em>
                      <strong>{connection.label}</strong>
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>

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
                  <span>{nucleus.displayName}</span>
                  <strong>{nucleus.role}</strong>
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
            const isEvidenceOpen = openEvidenceId === n.id;

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
                    <span className="brain-nucleus-name">{n.displayName}</span>
                    <span className="brain-nucleus-full">{n.role}</span>
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
                      <span className="brain-nucleus-meta-label">Formal name</span>
                      <span className="brain-nucleus-meta-value">{n.formalName}</span>
                    </div>
                    <div className="brain-nucleus-meta">
                      <span className="brain-nucleus-meta-label">Signal style</span>
                      <span className="brain-nucleus-meta-value">{n.signalStyle}</span>
                    </div>
                    <div className="brain-nucleus-meta">
                      <span className="brain-nucleus-meta-label">Active when</span>
                      <span className="brain-nucleus-meta-value">{n.activeWhen}</span>
                    </div>
                  </div>

                  <div className="brain-nucleus-connections">
                    <span className="brain-nucleus-meta-label">Three connections to watch</span>
                    <ul>
                      {n.connections.map((connection) => (
                        <li key={connection.id}>
                          <span className={`brain-conn-arrow ${toneClass[connection.tone]}`} />
                          <span>
                            <strong>{connection.label}</strong>
                            {connection.description}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    className="brain-evidence-toggle"
                    aria-expanded={isEvidenceOpen}
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpenEvidenceId((current) => current === n.id ? null : n.id);
                    }}
                  >
                    Evidence
                    <ChevronDown aria-hidden="true" size={14} className={isEvidenceOpen ? 'open' : ''} />
                  </button>

                  {isEvidenceOpen && (
                    <div className="brain-evidence-panel" onClick={(event) => event.stopPropagation()}>
                      <table>
                        <thead>
                          <tr>
                            <th>Displayed claim</th>
                            <th>Source note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {n.evidence.map((row) => (
                            <tr key={row.claim}>
                              <td>{row.claim}</td>
                              <td>{row.source}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <p className="brain-nucleus-caveat">{n.caveat}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
