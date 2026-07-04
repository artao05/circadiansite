---
name: site-math-notation
description: >-
  Render scientific and model math on the circadian primer site with native
  notation (Unicode, subscripts, superscripts). Use when adding or editing
  parameters, axes, model variables, equations, or any abbreviated math text.
---

# Site math notation

## When to use

Use formatted math notation **wherever a variable, parameter, rate, or unit
appears** — not only in the gene-network model panel. Readers should see
publication-style symbols (subscripts, Greek letters, superscripts), not ASCII
shorthand like `A_T`, `alpha`, `tau0`, or `h^-1`.

Pair formatted symbols with plain-language labels nearby for beginners.

## Do not add KaTeX

This project uses a lightweight HTML + SVG approach (no new math dependencies).
Do not install KaTeX or MathJax unless the user explicitly requests it.

## Components

Import from `app/components/ModelNotation.tsx`:

| Export | Use for |
| --- | --- |
| `ModelNotation` | HTML copy: parameter cards, legends, inline prose |
| `SvgModelLabel` | SVG `<text>` labels (HTML `<sub>` does not work in SVG) |
| `ModelNotationId` | Stable id stored in `site-data.ts` |

```tsx
import { ModelNotation, SvgModelLabel } from "./ModelNotation";

<ModelNotation id="total-delay" />
<svg>
  <SvgModelLabel id="per-cytoplasmic-Pc" x={460} y={98} anchor="start" />
</svg>
```

## Adding a new symbol

1. Add a preset to **both** `notationPresets` and `svgNotationPresets` in
   `ModelNotation.tsx`.
2. Extend the `ModelNotationId` union in the same file.
3. Reference the id from content data (`notationId` field) — never store ASCII
   math strings in `site-data.ts`.
4. Add `.model-notation` styling only if the new preset needs special layout;
   default sub/sup rules live in `globals.css`.

## Formatting rules

| Avoid | Prefer |
| --- | --- |
| `A_T`, `K_d`, `Pc` | A<sub>T</sub>, K<sub>d</sub>, P<sub>c</sub> |
| `alpha`, `beta`, `tau`, `tau0` | α, β, τ, τ₀ |
| `h^-1`, `near`, `around` | h<sup>−1</sup>, ≈ |
| `Vmax` | V<sub>max</sub> |

- Use Unicode minus (−) inside superscripts, not hyphen-minus (-).
- Keep `font-variant-numeric: tabular-nums` on numeric readouts beside symbols.
- In SVG, use `<tspan baseline-shift="sub|super" fontSize="0.72em">`.

## Theming

Math text inherits `--ink` / `--muted` from its container. Never hardcode light or
dark hex for notation. Verify contrast in all four circadian phases (especially
night).

## Accessibility

- Put plain-language meaning in a visible label or `aria-label` on the parent
  (e.g. “Cytoplasmic PER” beside P<sub>c</sub>).
- Do not rely on color alone to distinguish curves; include the formatted symbol
  in legend and readout cards.

## Checklist

- [ ] New id added to HTML and SVG preset maps
- [ ] Content references `notationId`, not raw ASCII math
- [ ] SVG labels use `SvgModelLabel`, not HTML sub tags
- [ ] Plain-language label remains nearby for beginners
- [ ] Contrast checked in morning, midday, evening, and night
- [ ] `npm run build` passes
