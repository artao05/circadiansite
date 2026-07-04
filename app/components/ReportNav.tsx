"use client";

import { List, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import { chapters } from "../content/site-data";
import {
  chaptersByNavGroup,
  getChapterNavChildren,
  navGroupMeta,
  navGroupOrder,
  reportSectionIds,
} from "../lib/report-nav";
import { useCircadianTime } from "./CircadianTimeProvider";

function getActiveChapterId(sectionId: string) {
  if (sectionId === "top") return null;
  return chapters.some((chapter) => chapter.id === sectionId) ? sectionId : null;
}

export function ReportNav() {
  const { phaseLabel } = useCircadianTime();
  const [activeSection, setActiveSection] = useState<string>("top");
  const [contentsOpen, setContentsOpen] = useState(false);
  const groupedChapters = useMemo(() => chaptersByNavGroup(), []);

  const activeChapterId = getActiveChapterId(activeSection);
  const activeChapter = chapters.find((chapter) => chapter.id === activeChapterId);

  const closeContents = useCallback(() => setContentsOpen(false), []);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash.includes("/")) return;

    const chapterId = hash.split("/")[0];
    const chapterElement = document.getElementById(chapterId);
    if (!chapterElement) return;

    requestAnimationFrame(() => {
      chapterElement.scrollIntoView({ block: "start" });
    });
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }, []);

  useEffect(() => {
    const elements = reportSectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: "-88px 0px -55% 0px",
        threshold: [0, 0.15, 0.35, 0.55, 0.75, 1],
      },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!contentsOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeContents();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeContents, contentsOpen]);

  const handleNavClick = () => {
    closeContents();
  };

  const handleNestedNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    chapterId: string,
    childHash: string,
  ) => {
    event.preventDefault();
    closeContents();

    const chapterElement = document.getElementById(chapterId);
    chapterElement?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${childHash}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };

  return (
    <>
      <nav className="report-nav" aria-label="Report chapters">
        <div className="report-nav-start">
          <a className="brand-mark" href="#top" aria-label="Go to top">
            <span aria-hidden="true" />
            Circadian Primer
          </a>
          <button
            type="button"
            className="report-nav-contents-button"
            aria-expanded={contentsOpen}
            aria-controls="report-contents-panel"
            onClick={() => setContentsOpen((open) => !open)}
          >
            <List size={18} aria-hidden="true" />
            <span>Contents</span>
          </button>
        </div>

        {activeChapter ? (
          <p className="report-nav-context" aria-live="polite">
            <span className="report-nav-context-number">{activeChapter.number}</span>
            <span className="report-nav-context-eyebrow">{activeChapter.eyebrow}</span>
          </p>
        ) : (
          <p className="report-nav-context report-nav-context-idle">
            <span className="report-nav-phase-dot" aria-hidden="true" />
            <span>{phaseLabel}</span>
          </p>
        )}

        <div className="report-nav-chapters" aria-label="Chapter numbers">
          {chapters.map((chapter) => {
            const isActive = chapter.id === activeChapterId;
            return (
              <a
                key={chapter.id}
                href={`#${chapter.id}`}
                className={isActive ? "is-active" : undefined}
                aria-label={`${chapter.number} · ${chapter.eyebrow}`}
                aria-current={isActive ? "location" : undefined}
                title={`${chapter.number} · ${chapter.title}`}
                onClick={handleNavClick}
              >
                {chapter.number}
              </a>
            );
          })}
        </div>
      </nav>

      <div
        className={`report-contents-root${contentsOpen ? " is-open" : ""}`}
        aria-hidden={!contentsOpen}
      >
        <button
          type="button"
          className="report-contents-backdrop"
          aria-label="Close contents"
          onClick={closeContents}
          tabIndex={contentsOpen ? 0 : -1}
        />
        <aside
          id="report-contents-panel"
          className="report-contents-panel"
          aria-label="Report contents"
          aria-hidden={!contentsOpen}
        >
          <header className="report-contents-header">
            <div>
              <p className="kicker">Report outline</p>
              <h2>Contents</h2>
            </div>
            <button
              type="button"
              className="report-contents-close"
              aria-label="Close contents"
              onClick={closeContents}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          <div className="report-contents-body">
            {navGroupOrder.map((group) => {
              const groupChapters = groupedChapters[group];
              if (!groupChapters.length) return null;

              return (
                <section key={group} className="report-contents-group">
                  <header>
                    <h3>{navGroupMeta[group].label}</h3>
                    <p>{navGroupMeta[group].description}</p>
                  </header>
                  <ul>
                    {groupChapters.map((chapter) => {
                      const children =
                        chapter.navChildren ?? getChapterNavChildren(chapter.id);

                      return (
                        <li key={chapter.id}>
                          <a
                            href={`#${chapter.id}`}
                            className={
                              chapter.id === activeChapterId ? "is-active" : undefined
                            }
                            onClick={handleNavClick}
                          >
                            <span>{chapter.number}</span>
                            <span>
                              <strong>{chapter.eyebrow}</strong>
                              <small>{chapter.title}</small>
                            </span>
                          </a>
                          {children.length ? (
                            <ul className="report-contents-children">
                              {children.map((child) => (
                                <li key={child.id}>
                                  <a
                                    href={`#${child.hash}`}
                                    onClick={(event) =>
                                      handleNestedNavClick(
                                        event,
                                        chapter.id,
                                        child.hash,
                                      )
                                    }
                                  >
                                    {child.label}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        </aside>
      </div>
    </>
  );
}
