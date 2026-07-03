"use client";

import { ArrowUpLeft } from "lucide-react";
import { useEffect, useState } from "react";
import {
  assertCitationId,
  citeAnchor,
  citationById,
  CITATION_RETURN_KEY,
  readCitationReturn,
  sourceAnchor,
  storeCitationReturn,
  type CitationId,
} from "../lib/citations";

type CitationLinkProps = {
  id: CitationId | string;
  context: string;
  label?: string;
};

export function CitationLink({ id, context, label }: CitationLinkProps) {
  assertCitationId(id);
  const citation = citationById[id as CitationId];
  const displayLabel = label ?? id;

  return (
    <a
      id={citeAnchor(context)}
      className="citation-link"
      href={`#${sourceAnchor(id)}`}
      aria-label={`View source: ${citation?.title ?? id}`}
      onClick={() => storeCitationReturn(context, id)}
    >
      {displayLabel}
    </a>
  );
}

type CitationListProps = {
  ids: string[];
  contextPrefix: string;
};

export function CitationList({ ids, contextPrefix }: CitationListProps) {
  if (!ids.length) return null;

  return (
    <>
      {ids.map((id, index) => (
        <span key={`${contextPrefix}-${id}`}>
          {index > 0 ? ", " : null}
          <CitationLink
            id={id}
            context={`${contextPrefix}-${index}`}
          />
        </span>
      ))}
    </>
  );
}

type CitationReturnProps = {
  citationId: string;
};

export function CitationReturn({ citationId }: CitationReturnProps) {
  const [returnState, setReturnState] = useState<ReturnType<
    typeof readCitationReturn
  >>(null);

  useEffect(() => {
    const syncReturn = () => {
      setReturnState(readCitationReturn());
    };

    syncReturn();
    window.addEventListener("hashchange", syncReturn);
    window.addEventListener("storage", syncReturn);

    return () => {
      window.removeEventListener("hashchange", syncReturn);
      window.removeEventListener("storage", syncReturn);
    };
  }, []);

  if (!returnState || returnState.sourceId !== citationId) return null;

  return (
    <div className="citation-return-bar">
      <a
        className="citation-return"
        href={`#${citeAnchor(returnState.context)}`}
        aria-label="Return to where you were reading"
        onClick={() => {
          sessionStorage.removeItem(CITATION_RETURN_KEY);
          setReturnState(null);
        }}
      >
        <ArrowUpLeft size={14} aria-hidden="true" />
        <span>Return to reading</span>
      </a>
    </div>
  );
}
