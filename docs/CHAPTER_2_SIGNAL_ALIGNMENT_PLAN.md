# Chapter 2 Overlapping Rhythms Implementation Plan

## Intent

Revamp Chapter 2 into a memorable interactive figure about entrainment,
internal alignment, and overlapping biological rhythms.

Core teaching sentence:

> Your body does not read the clock. It reads overlapping evidence.

The chapter should bridge Chapter 1 and Chapter 3:

- Chapter 1: what a rhythm is.
- Chapter 2: how repeated signals move rhythms into or out of coherence.
- Chapter 3: why different body clocks can keep different local schedules.

## Current Problem

The current Chapter 2 demo already includes light, sleep, meals, and activity,
but it spreads the lesson across a signal timeline, a clock-cluster chart, a
repeated-day strip, and a readout panel. That makes the section scientifically
reasonable but visually busy.

Weaknesses to address:

- The visual system still reads like horizontal timing bars and dashboard
  outputs, not a single scientific figure.
- The viewer must mentally connect the wall-time cues to the body-clock offsets.
- The clock-cluster chart explains separation, but not why overlap matters.
- Sleep, meals, light, and activity are all present, but no one graphic makes
  their coherence immediately visible.
- The repeated-day strip is useful but should be secondary to the core overlap
  concept.

## New Concept

Build an Overlapping Rhythms Studio.

The visitor edits a 24-hour day with timing signals:

- Evening light / light-off timing.
- Sleep start.
- Wake time.
- Last meal.
- Activity peak.

The central visual response is one layered wave figure:

- A light-tuned SCN rhythm.
- A sleep/night rhythm.
- A meal-tuned metabolic rhythm.
- An activity/day rhythm.
- A combined coherence shape showing whether the rhythms reinforce or flatten.

The main lesson:

- Coherent signals place wave crests near one another, so the combined rhythm
  has higher amplitude.
- Mixed signals spread the wave crests apart, so the combined rhythm is flatter,
  wider, or visibly less organized.
- Moving the meal cue should shift the food/metabolic rhythm more than the
  light/SCN rhythm.
- Moving the light cue should shift the SCN/light rhythm more than the
  food/metabolic rhythm.

## Interaction Model

Use presets first, sliders second.

Presets:

- Aligned day.
- Late light.
- Late meal.
- Mixed cues.
- Weekend drift.

Editable controls:

- Light low/off: evening to late night.
- Sleep starts: evening to after midnight.
- Sleep ends: early morning to late morning.
- Last meal: afternoon/evening to late night.
- Activity peak: morning to evening.

Presets should remain one-click narrative examples. Sliders should be available
for exploration after the visitor understands the examples.

## Derived Rhythms

Keep the model illustrative, local to `EntrainmentDemo`, and easy to audit.

Each rhythm has:

- `phase`: the time of its high point, in hours on a 24-hour circular axis.
- `amplitude`: visual strength, mostly fixed in v1.
- `color`: tied to the project palette.
- `label`: beginner-facing copy.
- `sensitivity`: weights that describe which cues move it.

Suggested rhythm sensitivities:

| Rhythm | Main cues | Suggested weights |
| --- | --- | --- |
| SCN / light | light off, sleep timing | light 0.62, sleep start 0.22, wake 0.16 |
| Sleep / night | sleep start, wake, light off | sleep start 0.45, wake 0.35, light 0.20 |
| Meal / metabolic | last meal, sleep timing, activity | meal 0.68, sleep start 0.12, activity 0.12, light 0.08 |
| Activity / day | activity peak, wake, light | activity 0.58, wake 0.22, light 0.12, meal 0.08 |

Use the current reference schedule as the baseline:

- Light low/off: 22:00.
- Sleep starts: 23:00.
- Sleep ends: 07:00.
- Last meal: 19:00.
- Activity peak: 15:00.

Compute cue shifts relative to baseline, then compute each rhythm phase as:

```ts
phase = referencePhase + weightedShiftSum
```

Keep shifts clamped to a modest range so the visual remains legible and does
not imply precise physiology.

## Coherence Model

The visual needs a simple way to show overlap.

Recommended approach:

1. Sample the 24-hour day at 96-144 points.
2. For each rhythm, compute a circular cosine wave:

```ts
value = baseline + amplitude * cos((hour - phase) / 24 * 2 * Math.PI)
```

3. Normalize each wave to a visible SVG y-range.
4. Compute the combined signal as an average of the positive portions or a
   normalized product-like overlap:

```ts
coherenceValue = mean(positiveWaveValues)
coherenceProduct = product(positiveWaveValues) ** (1 / rhythmCount)
```

5. Use the product-like value for the filled overlap shape because it drops
   visibly when one rhythm is out of phase.
6. Use circular phase spread for the numeric readout:

```ts
coherenceScore = clamp(100 - circularSpreadHours * 18, 0, 100)
```

The exact formula can be tuned during implementation. The important behavior is
that coherent presets look tall and organized, while split presets look flatter
and less synchronized.

## Visual Design

The figure should feel like an editorial scientific interactive, not a
dashboard.

Primary layout:

1. Header with the teaching sentence and caveat.
2. Preset buttons.
3. One large 24-hour wave figure.
4. Compact controls underneath or beside the figure.
5. One readout panel with the current interpretation.

Wave figure elements:

- Shared 24-hour x-axis with labels at 00, 06, 12, 18, and 24.
- Faint day/night background band.
- Thin colored wave for each rhythm.
- Colored crest marker for each rhythm, labeled directly when space allows.
- Filled overlap/coherence shape behind or below the waves.
- Optional vertical "now" marker from `useCircadianTime`.
- Small event ticks for light-off, sleep start, wake, meal, and activity.

Suggested colors:

- SCN / light: amber plus cyan accent.
- Sleep / night: night ink or violet.
- Meal / metabolic: coral.
- Activity / day: green.
- Coherence fill: translucent teal/cyan with amber highlight at high coherence.

Avoid nested cards. Keep the section as one full-width editorial panel with a
single strong figure.

## Readout States

The readout should explain what moved and what stayed anchored.

States:

- Aligned signals.
- Coherent but shifted.
- Late light split.
- Late meal split.
- Mixed timing evidence.
- Weekend drift.

Example readout copy:

- "The waves crest together, so the simplified combined rhythm is tall and
  coherent."
- "Light moved later, so the SCN rhythm trails while the meal rhythm stays near
  the food schedule."
- "Meals moved later, so the metabolic rhythm trails while the light-tuned SCN
  rhythm stays closer to the light schedule."
- "Several cues point to different times, so the combined rhythm flattens."

Keep the language educational and avoid personalized advice.

## Component Plan

Primary file:

- `app/components/EntrainmentDemo.tsx`

Implementation steps:

1. Preserve the exported `EntrainmentDemo` component and current import path.
2. Keep the existing preset and schedule concepts, but rename internal model
   helpers around rhythm phases rather than clock estimates.
3. Replace the timeline plus cluster SVGs with one wave SVG.
4. Add helper functions for:
   - circular hour normalization;
   - circular phase distance;
   - cue shift calculation;
   - rhythm phase calculation;
   - wave sampling;
   - SVG path generation;
   - coherence scoring;
   - state/readout selection.
5. Keep controls semantic:
   - preset buttons use `aria-pressed`;
   - range controls have labels, values, and descriptions;
   - SVG has a title and description;
   - readout uses polite live updates only if it does not become noisy.
6. Preserve `prefers-reduced-motion` support by avoiding required animation and
   disabling decorative transitions where appropriate.

Secondary file:

- `app/globals.css`

CSS steps:

1. Replace obsolete clock-cluster styles only after confirming they are not used
   elsewhere.
2. Add wave-studio classes for:
   - outer editorial panel;
   - preset row;
   - responsive figure layout;
   - SVG wave labels;
   - compact controls;
   - readout status states.
3. Keep repeated item cards at 8px radius or less.
4. Avoid negative letter spacing.
5. Check mobile text wrapping around labels and control values.

Optional doc/content touch:

- `app/content/site-data.ts`

Only update chapter copy if needed. The current Chapter 2 title and dek already
fit the overlap concept, so a content edit may not be necessary.

## Responsive Behavior

Desktop:

- Large wave figure occupies the main column.
- Controls can sit in a compact grid below the figure or in a narrow side rail.
- Readout stays adjacent but visually secondary.

Tablet:

- Presets wrap.
- Wave figure stays full width.
- Controls use two columns.

Mobile:

- Wave figure remains one SVG with stable aspect ratio.
- Direct labels should simplify or hide if they collide.
- Controls stack in one column.
- Readout appears below the figure.
- No horizontal page overflow.

## Scientific Safety

Required caveat near the interactive:

> This is an educational model of timing evidence, not a measurement of your
> circadian phase or a recommendation to change sleep, meals, activity, or
> medication timing.

Use wording such as:

- "In this simplified model..."
- "Illustrative overlap..."
- "Repeated cues can pull rhythms earlier or later."
- "Real circadian phase depends on light history, sleep, meals, activity, and
  individual biology."

Avoid wording such as:

- "Your actual body clock is..."
- "You should..."
- "This predicts..."
- "Optimal schedule..."

Do not introduce medication instructions in this section.

## Implementation Slices

1. Model and presets
   - Refactor the local schedule model into derived rhythm phases.
   - Preserve all five existing cues.
   - Add coherence scoring and readout states.

2. Wave figure
   - Build the 24-hour SVG axis.
   - Render individual rhythm waves.
   - Render event ticks and crest markers.
   - Render the coherence fill/product shape.

3. Controls and copy
   - Keep preset-first exploration.
   - Condense control descriptions.
   - Add the overlap-focused readout and caveat.

4. Responsive CSS
   - Replace the multi-chart layout with a single editorial figure.
   - Tune desktop, tablet, and mobile layout.
   - Respect reduced-motion preferences.

5. Validation
   - Run `npm run lint`.
   - Run `npm run build`.
   - Inspect desktop and mobile in a browser.
   - Confirm no text overlaps controls or visuals.

## Acceptance Criteria

- The first impression communicates "overlapping timing signals set biological
  coherence."
- Light, sleep, meals, and activity remain represented in the interactive.
- Moving meal timing visibly shifts the meal/metabolic rhythm more than the
  SCN/light rhythm.
- Moving light timing visibly shifts the SCN/light rhythm more than the
  meal/metabolic rhythm.
- Coherent presets produce a taller, cleaner overlap shape.
- Mixed presets produce a flatter or visibly split overlap shape.
- The section feels like one scientific figure, not several dashboard widgets.
- The readout is understandable without reading every slider description.
- Caveat language stays nearby and does not give behavioral or medication
  advice.
- Mobile has no horizontal overflow.
- Fresh browser console has no new warnings or errors.
- `npm run lint` and `npm run build` pass.

## Open Design Questions

- Should the combined shape be rendered behind the waves as a glow/fill, or in a
  separate mini-lane below the waves for clarity?
- Should sleep be a smooth rhythm wave, a shaded night band, or both?
- Should the repeated-day adaptation concept remain as a subtle secondary note,
  or be removed from Chapter 2 and saved for a later section?
- Should the current wall-time marker remain in the figure, or does it distract
  from the overlap lesson?
