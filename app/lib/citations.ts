import { citations } from "../content/site-data";

export type CitationId = (typeof citations)[number]["id"];

export const CITATION_RETURN_KEY = "circadian:citation-return";

export const citationById = Object.fromEntries(
  citations.map((citation) => [citation.id, citation]),
) as Record<CitationId, (typeof citations)[number]>;

const citationIdSet = new Set<string>(citations.map((citation) => citation.id));

export function sourceAnchor(id: string) {
  return `source-${id}`;
}

export function citeAnchor(context: string) {
  return `cite-${context}`;
}

export function assertCitationId(id: string): asserts id is CitationId {
  if (process.env.NODE_ENV !== "production" && !citationIdSet.has(id)) {
    console.warn(`Unknown citation id: "${id}". Add it to citations in site-data.ts.`);
  }
}

export function isCitationId(id: string): id is CitationId {
  return citationIdSet.has(id);
}

export type CitationReturnState = {
  context: string;
  sourceId: string;
};

export function storeCitationReturn(context: string, sourceId: string) {
  if (typeof sessionStorage === "undefined") return;
  const state: CitationReturnState = { context, sourceId };
  sessionStorage.setItem(CITATION_RETURN_KEY, JSON.stringify(state));
}

export function readCitationReturn(): CitationReturnState | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(CITATION_RETURN_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CitationReturnState;
    if (parsed.context && parsed.sourceId) return parsed;
  } catch {
    return null;
  }

  return null;
}
