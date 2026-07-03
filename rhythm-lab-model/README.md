# Rhythm Lab Model Exports

This folder keeps the offline modeling work for the Chapter 1 rhythm lab out of
the runtime app. The site consumes committed static data; it does not install or
run Python in the browser or the Cloudflare Worker.

## Generate Data

Install the Python dependency in a temporary or local environment:

```bash
python3 -m pip install -r rhythm-lab-model/requirements.txt
```

Then regenerate the export:

```bash
python3 rhythm-lab-model/generate_scenarios.py
```

The script writes `rhythm-lab-model/generated/rhythm-scenarios.json`.

## Scope

The Arcascope `circadian` package grounds light schedules, oscillator state,
phase markers, amplitude, and ESRI-style regularity metrics. It is not an HPA
axis aging model. Aging cortisol is therefore applied in the React layer as an
evidence overlay from Van Cauter et al. 1996 rather than as a direct output of
the oscillator simulation.
