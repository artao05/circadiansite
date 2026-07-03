---
name: site-citations
description: >-
  Add or edit inline citations and bibliography entries on the circadian primer
  site. Use when wiring evidence spines, medication source strips, video
  explainers, or sources at the bottom of the page.
---

# Site citations

## When to cite

Use inline citations only when a claim needs traceability. Do not add citations
for decoration.

## Data first

1. Add the source to `citations` in `app/content/site-data.ts`.
2. Use a stable slug id (e.g. `smith-2019`).
3. Set `source` to the journal or publisher name and `url` to a DOI, PubMed, or
   official publisher link.
4. Only then reference that id inline.

**Never commit PDFs.** Local copies may live in `references/` for research, but
that directory is gitignored. The site bibliography always links out to the
published source.

## Inline references

Use `CitationList` for multiple ids:

```tsx
import { CitationList } from "../components/CitationLink";

<CitationList
  ids={example.sources}
  contextPrefix={example.name.toLowerCase().replace(/\s+/g, "-")}
/>
```

Use `CitationLink` for a single reference:

```tsx
import { CitationLink } from "../components/CitationLink";

<CitationLink id="smith-2019" context="rhythm-lab-intro" />
```

Rules:

- `context` (or `contextPrefix` + index) must be unique per inline location.
- Never render raw slug strings like `{source}` or `join(", ")`.
- Default link label is the citation slug; pass `label` only when needed.

## Bibliography cards

In `app/page.tsx`, each source card needs:

```tsx
import { CitationReturn } from "./components/CitationLink";
import { sourceAnchor } from "./lib/citations";

<article
  id={sourceAnchor(citation.id)}
  className="source-card"
>
  {/* title, note, external url */}
  <CitationReturn citationId={citation.id} />
</article>
```

## Out of scope

Do not use this pattern for:

- Gene network database labels (`"Reactome"`, `"NCBI core clock table"`)
- `circadianDataSources` external link-outs
- Free-text evidence notes in `InteractiveBrainMap`

Those keep their existing external-link or plain-text patterns.

## Checklist

- [ ] Id exists in `citations` array with a public `url` (no PDF committed)
- [ ] Unique `context` / `contextPrefix`
- [ ] Source card has `sourceAnchor` id and `CitationReturn`
- [ ] Contrast checked in morning, midday, evening, and night phases
- [ ] `npm run build` passes
- [ ] Click citation → lands on source card → "Return to reading" works
