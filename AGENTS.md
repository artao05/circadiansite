# AGENTS.md

## Project Purpose

This project is a public-facing interactive primer on circadian biology and
chronomedicine. It should feel like a carefully designed scientific publication:
visual first, beginner friendly, evidence aware, and explicitly educational.

Do not turn this into a personalized medication-timing product in v1. Drug
examples explain why timing can matter; they must never tell a visitor to change
when they take a medication.

## Stack

- Framework: Next 16 + React 19 through the bundled `vinext` Sites starter.
- Hosting target: Sites / Cloudflare Worker-compatible output.
- Styling: Tailwind CSS v4 plus project CSS in `app/globals.css`.
- Content: TypeScript data in `app/content/site-data.ts`; future long-form
  chapters may move to MDX.
- Interactions: React client components with SVG/CSS, supported by `d3`,
  `motion`, `lucide-react`, `clsx`, and `zod` where useful.
- No v1 persistence: keep `.openai/hosting.json` D1/R2 bindings as `null`.

## Commands

- Install: `npm install`
- Develop: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

Use `npm run build` before considering site work complete. For frontend changes,
also inspect desktop and mobile in a browser and verify that text does not
overlap controls or visuals.

## Design Rules

- Build the actual interactive report as the first screen, not a marketing page.
- Use full-width editorial sections and sticky visual panels; avoid nested cards
  and decorative dashboard chrome.
- Keep repeated item cards at 8px radius or less.
- Use familiar icon buttons from `lucide-react` when a control needs an icon.
- Keep letter spacing at `0`; do not use negative tracking.
- Avoid one-note palettes. The intended palette combines night ink, warm paper,
  amber light, teal/cyan biology, coral medication markers, and green gene
  accents.
- Support `prefers-reduced-motion`.

## Theming and the master clock

The whole site is repainted by a single "master clock". `CircadianTimeProvider`
(`app/components/CircadianTimeProvider.tsx`) holds an `hour` (0-23), buckets it
into one of four phases (morning 5-11, midday 11-17, evening 17-21, night 21-5),
and injects a full set of CSS custom properties as inline styles on the
`.circadian-shell` wrapper (plus `data-circadian-phase`). `MasterCircadianClock`
drives `hour` via its clock face and scrubber. `.circadian-shell` transitions
`background`/`color`, so time changes cross-fade the page.

Critical: night inverts. In day phases `--ink` is dark and `--paper` is light;
at night `--ink` becomes near-white and `--paper` becomes dark. A component that
hardcodes a light surface will show light text on a light panel at night (this
is exactly how the "Late light" button broke).

Rules for every new or edited component:

- Consume phase tokens; never hardcode light/dark hex or literals like
  `rgba(255, 249, 239, ...)` / `rgba(16, 24, 32, ...)` for surfaces, borders, or
  text. Use the semantic set: `--surface` (opaque panel), `--surface-soft`
  (translucent panel), `--surface-line` (hairline border), `--surface-strong`
  (high-contrast emphasis fill; inverts with phase), `--on-surface` (text on
  `--surface`, equals `--ink`), `--on-surface-strong` (text on
  `--surface-strong`). For emphasis pairs you may also use the existing
  `--selected-bg` / `--selected-fg`.
- Accent hues (`--amber`, `--cyan`, `--coral`, `--green`, `--violet`) read as
  accents in all phases and can stay as translucent colored fills/strokes.
- Inside SVGs, use `var(--...)` tokens for `fill`/`stroke`, or
  `color-mix(in srgb, var(--ink) N%, transparent)` for adaptive hairlines,
  instead of fixed rgba.
- To add a token, define it for all four phases in `getCircadianTheme` and
  mirror the default in the `:root` block of `app/globals.css`.
- Before considering a component done, verify text/background contrast in all
  four phases, especially night, on desktop and mobile.

## Scientific Safety

- Keep medication content educational and citation-forward.
- Include the site-wide caveat that medication timing should be discussed with a
  clinician or pharmacist.
- Every medication claim and quantitative claim must be traceable to the claim
  matrix or citation list.
- Prefer plain language. Define period, amplitude, phase, entrainment, and
  biological time before using them heavily.
- If a claim is uncertain, label it as a hypothesis, example, or emerging area.

## Citation linking

- Use inline citations **only when a claim needs traceability**. Prefer nearby
  caveats over citation clutter.
- Every site bibliography reference must use `CitationLink` or `CitationList`
  from `app/components/CitationLink.tsx`. Never render raw citation slug text
  in JSX.
- Add new sources to `citations` in `app/content/site-data.ts` before
  referencing them inline.
- Anchor scheme:
  - Inline origin: `#cite-{context}` (set via `citeAnchor()` in
    `app/lib/citations.ts`)
  - Bibliography target: `#source-{id}` (set via `sourceAnchor()`)
- Each bibliography card in the sources section must expose
  `id={sourceAnchor(citation.id)}` and include `CitationReturn`.
- Gene/database external link-outs (`circadianDataSources`, Reactome/NCBI labels
  in gene cards) are a separate pattern — do not route them through the bottom
  bibliography.
- When touching citation UI, verify click → scroll to source → return to reading
  in all four circadian phases.
- **Do not commit PDFs.** Store personal reference PDFs locally (e.g.
  `references/`) for your own reading; wire the public site to publisher links
  (`url` on each `Citation` in `site-data.ts`). PDF paths are gitignored.

## Content Workflow

- Add new claims to `claimMatrix` before using them in prominent copy.
- Use `beginnerPhrasing` for public-facing language and keep caveats nearby.
- Chapter 6 currently uses a curated human clock-gene network with source
  attribution and link-outs to CircaKB, CIRCA/CircaDB, CGDB, Reactome, NCBI
  Gene, and UniProt. Do not imply that it is a live database ingestion pipeline.
- Live/downloaded gene-rhythm imports, PubMed/OpenAlex evidence graphs, and
  Google Science Skills validation remain v2 unless explicitly requested.

## File Map

- `docs/IMPLEMENTATION_PLAN.md`: implementation and roadmap plan.
- `app/page.tsx`: main report composition.
- `app/content/site-data.ts`: chapters, citations, claims, drugs, genes, body
  rhythm examples, and roadmap data.
- `app/components/CircadianTimeProvider.tsx`: the master clock; owns the `hour`
  state and the per-phase CSS token sets that theme the whole site.
- `app/components/GeneNetwork.tsx`: Chapter 6 clock-gene network and player
  card.
- `app/components/*.tsx`: other interactive and editorial components.
- `app/components/CitationLink.tsx`: inline citation links and return navigation.
- `app/lib/citations.ts`: citation anchor helpers and lookup utilities.
- `app/globals.css`: global visual system and responsive behavior.
