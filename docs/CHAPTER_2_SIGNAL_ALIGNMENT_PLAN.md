# Chapter 2 Signal Alignment Studio Plan

## Intent

Revamp Chapter 2 from a small two-slider offset chart into a memorable
interactive figure about entrainment.

Core teaching sentence:

> Your body does not read the clock. It reads evidence.

The chapter should bridge Chapter 1 and Chapter 3:

- Chapter 1: what a rhythm is.
- Chapter 2: how rhythms get set by repeated signals.
- Chapter 3: why different body clocks can keep different local schedules.

## Current Problem

The existing Chapter 2 demo is scientifically reasonable but visually modest.
It uses light-off and last-meal sliders to show brain/gut offset across eight
days. That teaches internal desynchronization, but it undersells the broader
chapter promise: light, sleep, meals, and activity all tug on time.

Weaknesses to address:

- The signal strip promises more inputs than the graphic uses.
- The eight-day rows feel abstract and dashboard-like.
- The visual does not strongly show wall time versus inferred biological time.
- The "forecast" language may imply more precision than a simplified model has.

## New Concept

Build a Signal Alignment Studio.

The visitor edits a 24-hour day with timing signals:

- Evening light / light-off timing.
- Sleep window.
- Last meal.
- Activity peak.

The visual response should show:

- Wall time as an explicit 24-hour schedule.
- Body time as a cluster of clocks responding to those signals.
- A clear alignment readout: aligned cues, late light, late meal, mixed cues, or
  drift.
- A repeated-day adaptation strip or similar inertia cue, framed as an
  illustrative response rather than a prediction.

## Interaction Model

Use presets first, sliders second.

Presets:

- Aligned day.
- Late light.
- Late meal.
- Mixed cues.
- Weekend drift.

Editable controls:

- Light off: evening to late night.
- Sleep start.
- Wake time.
- Last meal.
- Activity peak.

Derived outputs:

- Brain / SCN inferred phase, most sensitive to light and sleep timing.
- Gut / liver inferred phase, most sensitive to last meal.
- Sleep gate inferred phase, sensitive to sleep window and evening light.
- Alignment score or strain label, explained in plain language.

## Visual Direction

The figure should feel like an editorial scientific interactive, not a dashboard.

Preferred layout:

- A 24-hour wall-time track with signal bands and event pulses.
- A body-time panel with clock estimates that cluster or separate.
- A short repeated-day response strip showing inertia.
- A concise interpretation panel with caveat language nearby.

Palette:

- Night ink and warm paper base.
- Amber for light.
- Teal/cyan for brain/SCN.
- Coral for meals/gut.
- Green for activity/sleep support.

## Safety And Copy

Avoid personalized prescription language.

Use wording such as:

- "In this simplified model..."
- "Illustrative response."
- "Repeated cues can pull internal time earlier or later."
- "Real circadian phase depends on light history, sleep, meals, activity, and
  individual biology."

Avoid wording such as:

- "Your actual body clock is..."
- "You should..."
- "This predicts..."
- "Optimal schedule..."

## Implementation Slices

1. React/component model
   - Replace `EntrainmentDemo` internals while preserving the exported component
     name and Chapter 2 import path.
   - Keep helper math local unless it becomes broadly reused.
   - Use semantic controls and ARIA labels.

2. Visual CSS
   - Add Signal Alignment Studio classes to `app/globals.css`.
   - Keep mobile and desktop layouts stable.
   - Support `prefers-reduced-motion`.
   - Keep interactive targets at least 44px when practical.

3. Content/science review
   - Confirm the graphic teaches entrainment before desynchronization.
   - Confirm labels are beginner-friendly.
   - Confirm caveats do not turn into medical or lifestyle advice.

## Acceptance Criteria

- The first impression communicates "signals set biological time."
- The chapter intro only promises timing signals represented by the studio.
- The visitor can understand the state change after moving one control.
- Presets create meaningfully different visual states.
- Mobile view has no horizontal page overflow.
- Fresh browser console has no new warnings or errors.
- `npm run lint` and `npm run build` pass.
