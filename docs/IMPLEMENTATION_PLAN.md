# Circadian Biology Interactive Primer - Implementation Plan

## Summary

Build v1 as a beautiful interactive science report for the curious public. The
site teaches that biology changes across time, then lets readers manipulate
rhythms and see how period, amplitude, phase, entrainment, drug timing, and
gene expression relate to chronomedicine.

The first release is curated and educational. It does not provide personalized
recommendations, accounts, persistence, or live biomedical API calls.

## Full Stack

- **Frontend/runtime:** Next 16, React 19, vinext, Vite, TypeScript.
- **Hosting:** Sites-compatible Cloudflare Worker output via the bundled
  `sites()` Vite plugin and `@cloudflare/vite-plugin`.
- **Styling:** Tailwind CSS v4 plus custom CSS variables and editorial layout
  classes in `app/globals.css`.
- **Interactive visuals:** React client components, SVG, CSS transforms, `d3`
  for chart scales/math, `motion` for animation patterns, `lucide-react` for
  iconography.
- **Content/data:** structured TypeScript data for v1; MDX packages are
  installed for future chapter authoring.
- **Validation:** `npm run build`, `npm run lint`, Playwright browser review,
  and later Vitest coverage for chart math/data transforms.

## Installed Package Groups

Base starter:

```bash
next react react-dom vinext vite typescript tailwindcss
@cloudflare/vite-plugin @vitejs/plugin-react @vitejs/plugin-rsc
react-server-dom-webpack eslint eslint-config-next wrangler
drizzle-orm drizzle-kit
```

Added for this project:

```bash
@next/mdx @mdx-js/loader @mdx-js/react remark-gfm rehype-slug
d3 motion lucide-react clsx zod
@types/d3 vitest jsdom @testing-library/react
@testing-library/jest-dom @playwright/test prettier
```

## Experience Architecture

- **Opening:** cinematic 24-hour biological clock with changing physiology.
- **Chapter 1:** rhythm lab with sliders for period, amplitude, phase,
  baseline, and noise.
- **Chapter 2:** entrainment demo showing light, meals, sleep timing, and
  activity pulling internal time into or out of sync.
- **Chapter 3:** body-clock timeline spanning brain, liver, gut, immune,
  cardiovascular, and sleep systems.
- **Chapter 4:** reusable drug-timing visual lab with medication tabs, safety
  caveats, and a first full statin scenario showing body route, exposure curve,
  target rhythm, and simplified overlap projection.
- **Chapter 5:** oxaliplatin chronotherapy story as an evidence timeline.
- **Chapter 6:** interactive human clock-gene network with 21 curated nodes,
  63 relationship edges, category coloring, player cards, tissue/disease notes,
  and source link-outs to CircaKB, CIRCA/CircaDB, CGDB, Reactome, NCBI Gene,
  and UniProt.
- **Closing:** chronomedicine workflow and v2 roadmap for databases and
  scientific validation.

## Implementation Phases

1. **Scaffold and guardrails**
   - Start from the bundled vinext Sites starter.
   - Keep D1/R2 off in `.openai/hosting.json`.
   - Add `AGENTS.md` and this plan.

2. **Curated content foundation**
   - Create `site-data.ts` with chapters, citations, claim matrix, medication
     examples, clock-gene network nodes/edges, body rhythm events, and roadmap
     items.
   - Keep all medication copy educational and caveated.

3. **Interactive visual modules**
   - Implement rhythm sliders as an SVG line chart.
   - Implement entrainment as day-by-day phase offset visualization.
   - Implement a 24-hour body timeline.
   - Implement the Chapter 4 drug-timing lab with reusable scenario data, curve
     helpers, dose-time controls, duration toggles, body-route diagrams, and
     scaffolded future visual models for the remaining medication tabs.
   - Implement the Chapter 6 clock-gene network with node selection, category
     filtering, source tab, edge legends, and external gene/protein links.

4. **Editorial shell**
   - Persistent table of contents.
   - Chapter bands with large visual anchors and compact side notes.
   - Citation footer and knowledge matrix.
   - Responsive layout with mobile-first control sizing.

5. **Validation**
   - Run lint/build.
   - Inspect desktop and mobile in the browser.
   - Verify no overlapping text, blank visuals, or unsafe medication phrasing.

## V2 Roadmap

- Add MDX authoring pipeline for longer chapters.
- Build a real CircaKB/CIRCA/CircaDB download/import pipeline to replace
  curated rhythmic-expression fields with dataset-backed phase/amplitude
  records.
- Add NCBI, PubMed, and OpenAlex pipelines for references and evidence graphs.
- Add a review workflow for Gemini/Google Science Skills if the workspace gains
  access to those tools.
- Add downloadable claim matrix and citation exports.
