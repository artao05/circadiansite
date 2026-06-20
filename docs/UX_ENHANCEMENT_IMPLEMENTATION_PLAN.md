# UX Enhancement Implementation Plan

## Goal

Improve the primer's first-use experience without changing the v1 product
scope: it remains a public, educational, citation-forward chronomedicine report,
not a personalized medication-timing tool.

## Task 1: Functional Bugs And Console Hygiene

Status: complete

- Fix duplicate clock-gene node identifiers so network selection, filtering, and
  React reconciliation stay stable.
- Fix Recharts container warnings by rendering charts only after their frame has
  valid dimensions.
- Align gene category labels and visual classes with the current curated network
  category model.
- Re-run browser console checks, `npm run build`, and `npm run lint` after edits.

## Task 2: First-Viewport UX

Status: initial pass complete

- Reduce desktop hero top-heaviness so the explanatory copy and primary actions
  land in the first viewport more reliably.
- Improve mobile hero sequencing so the clock concept appears earlier without
  burying the educational copy.
- Keep the first screen as the actual interactive report, not a marketing hero.

## Task 3: Navigation UX

Status: initial pass complete

- Replace the mobile chapter-number overflow with a more robust compact chapter
  navigation pattern.
- Increase touch targets to at least 44px where practical.
- Add clearer current-section feedback for a long, scroll-heavy report.

## Validation Checklist

- `npm run build`
- `npm run lint`
- Desktop browser pass at the default viewport.
- Mobile browser pass around 390px width.
- Browser console check for new warnings/errors.
- Confirm medication copy remains educational and caveated.

## Current Follow-Ups

- Replace the oxaliplatin timeline `<img>` elements with an optimized image
  path or explicitly document why the static images should remain plain images.
- Code-split lower-page heavy modules to address the build warning about client
  chunks larger than 500 kB.
- Add active-section feedback to the chapter navigation.
