"use client";

import { GripHorizontal, Info, Maximize2, Minimize2, Play, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { SectionVideoExplainer as SectionVideoExplainerData } from "../content/site-data";
import { CitationList } from "./CitationLink";

type SectionVideoExplainerProps = {
  explainer: SectionVideoExplainerData;
  sectionTitle: string;
};

type PlayerPosition = {
  x: number;
  y: number;
};

function youtubeEmbedUrl(youtubeId: string) {
  return `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function SectionVideoExplainer({
  explainer,
  sectionTitle,
}: SectionVideoExplainerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState<PlayerPosition | null>(null);
  const [sourceSection, setSourceSection] = useState<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const playerRef = useRef<HTMLElement>(null);
  const dragOffsetRef = useRef<PlayerPosition | null>(null);

  const closePlayer = useCallback(() => {
    setIsOpen(false);
    setIsExpanded(false);
    setPosition(null);
    setSourceSection(null);
  }, []);

  const openPlayer = () => {
    const trigger = triggerButtonRef.current;
    setSourceSection(
      trigger?.closest("section") ??
        trigger?.closest<HTMLElement>(".chapter-intro") ??
        null,
    );
    setPosition(null);
    setIsExpanded(false);
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePlayer();
      }
    };

    closeButtonRef.current?.focus();
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closePlayer, isOpen]);

  useEffect(() => {
    if (!isOpen || isExpanded || !sourceSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (!entry.isIntersecting || entry.intersectionRatio < 0.18) {
          closePlayer();
        }
      },
      {
        root: null,
        threshold: [0, 0.18],
      },
    );

    observer.observe(sourceSection);
    return () => observer.disconnect();
  }, [closePlayer, isExpanded, isOpen, sourceSection]);

  useEffect(() => {
    if (!position || isExpanded) return;

    const onResize = () => {
      const player = playerRef.current;
      if (!player) return;

      const rect = player.getBoundingClientRect();
      setPosition((current) => {
        if (!current) return current;
        return {
          x: clamp(current.x, 12, Math.max(12, window.innerWidth - rect.width - 12)),
          y: clamp(current.y, 12, Math.max(12, window.innerHeight - rect.height - 12)),
        };
      });
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isExpanded, position]);

  const setDragPosition = useCallback((clientX: number, clientY: number) => {
    const offset = dragOffsetRef.current;
    const player = playerRef.current;
    if (!offset || !player || isExpanded) return;

    const rect = player.getBoundingClientRect();
    setPosition({
      x: clamp(
        clientX - offset.x,
        12,
        Math.max(12, window.innerWidth - rect.width - 12),
      ),
      y: clamp(
        clientY - offset.y,
        12,
        Math.max(12, window.innerHeight - rect.height - 12),
      ),
    });
  }, [isExpanded]);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerMove = (event: PointerEvent) => {
      setDragPosition(event.clientX, event.clientY);
    };

    const onPointerEnd = () => {
      dragOffsetRef.current = null;
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerEnd);
    window.addEventListener("pointercancel", onPointerEnd);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerEnd);
      window.removeEventListener("pointercancel", onPointerEnd);
    };
  }, [isOpen, setDragPosition]);

  const startDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (isExpanded || window.matchMedia("(max-width: 720px)").matches) return;
    if (event.target instanceof Element && event.target.closest("button")) return;
    const player = playerRef.current;
    if (!player) return;

    const rect = player.getBoundingClientRect();
    dragOffsetRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    setPosition({ x: rect.left, y: rect.top });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const dragPlayer = (event: ReactPointerEvent<HTMLElement>) => {
    setDragPosition(event.clientX, event.clientY);
  };

  const endDrag = (event: ReactPointerEvent<HTMLElement>) => {
    dragOffsetRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const playerStyle: CSSProperties | undefined =
    position && !isExpanded
      ? {
          left: `${position.x}px`,
          top: `${position.y}px`,
        }
      : undefined;

  return (
    <>
      <button
        ref={triggerButtonRef}
        className="section-video-trigger"
        type="button"
        aria-label={`Open video explainer for ${sectionTitle}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={openPlayer}
      >
        <Info size={18} aria-hidden="true" />
      </button>

      {isOpen ? (
        <section
          ref={playerRef}
          className={`section-video-player${isExpanded ? " expanded" : ""}${
            position && !isExpanded ? " positioned" : ""
          }`}
          role="dialog"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          style={playerStyle}
        >
          <header
            className="section-video-header"
            onPointerDown={startDrag}
            onPointerMove={dragPlayer}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <GripHorizontal
              className="section-video-grip"
              size={18}
              aria-hidden="true"
            />
            <div>
              <p className="kicker">{explainer.duration} explainer</p>
              <h3 id={titleId}>{explainer.title}</h3>
            </div>
            <div className="section-video-controls">
              <button
                className="section-video-control"
                type="button"
                aria-label={
                  isExpanded
                    ? "Restore video explainer"
                    : "Expand video explainer"
                }
                onClick={() => setIsExpanded((current) => !current)}
              >
                {isExpanded ? (
                  <Minimize2 size={18} aria-hidden="true" />
                ) : (
                  <Maximize2 size={18} aria-hidden="true" />
                )}
              </button>
              <button
                ref={closeButtonRef}
                className="section-video-control"
                type="button"
                aria-label="Close video explainer"
                onClick={closePlayer}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="section-video-scroll">
            <div className="section-video-frame">
              {explainer.youtubeId ? (
                <iframe
                  src={youtubeEmbedUrl(explainer.youtubeId)}
                  title={explainer.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <div className="section-video-placeholder">
                  <Play size={32} aria-hidden="true" />
                  <span>Video slot ready</span>
                </div>
              )}
            </div>

            <div className="section-video-body">
              <p id={descriptionId} className="section-video-summary">
                {explainer.summary}
              </p>

              {explainer.transcript ? (
                <details className="section-video-transcript">
                  <summary>Transcript draft</summary>
                  <p>{explainer.transcript}</p>
                </details>
              ) : null}

              {explainer.caveat ? (
                <p className="section-video-caveat">{explainer.caveat}</p>
              ) : null}

              {explainer.citationIds?.length ? (
                <div
                  className="section-video-citations"
                  aria-label="Related sources"
                >
                  <CitationList
                    ids={explainer.citationIds}
                    contextPrefix={`video-${sectionTitle.toLowerCase().replace(/\s+/g, "-")}`}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
