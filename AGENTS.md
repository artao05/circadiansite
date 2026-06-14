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

## Scientific Safety

- Keep medication content educational and citation-forward.
- Include the site-wide caveat that medication timing should be discussed with a
  clinician or pharmacist.
- Every medication claim and quantitative claim must be traceable to the claim
  matrix or citation list.
- Prefer plain language. Define period, amplitude, phase, entrainment, and
  biological time before using them heavily.
- If a claim is uncertain, label it as a hypothesis, example, or emerging area.

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
- `app/components/GeneNetwork.tsx`: Chapter 6 clock-gene network and player
  card.
- `app/components/*.tsx`: other interactive and editorial components.
- `app/globals.css`: global visual system and responsive behavior.
