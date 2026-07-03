#!/usr/bin/env python3
"""Generate static circadian scenario data for the rhythm lab.

The app imports the generated JSON at build time. This keeps Python-only
modeling dependencies out of the Next/vinext runtime while preserving a
reproducible path for updating the static curves.
"""

from __future__ import annotations

import json
import math
import os
import tempfile
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

os.environ.setdefault("MPLCONFIGDIR", str(Path(tempfile.gettempdir()) / "matplotlib"))

import numpy as np
from circadian.lights import LightSchedule
from circadian.metrics import esri
from circadian.models import Forger99


ROOT = Path(__file__).resolve().parent
OUTPUT_PATH = ROOT / "generated" / "rhythm-scenarios.json"
SIMULATION_DAYS = 21
DISPLAY_HOURS = 48
DT_HOURS = 0.5


@dataclass(frozen=True)
class Scenario:
    id: str
    label: str
    summary: str
    signal_scale: float
    cortisol_profile: str
    schedule_factory: Callable[[], LightSchedule]
    caveat: str


@dataclass(frozen=True)
class Chronotype:
    id: str
    label: str
    period_hours: float
    phase_offset_hours: float
    summary: str


def shift_work_schedule(lux: float = 300.0, baseline: float = 1.0) -> LightSchedule:
    """Weekly night-shift schedule with scalar output for LightSchedule validation."""

    def light_at_hour(hour: float) -> float:
        week_hour = hour % (7.0 * 24.0)
        day = int(week_hour // 24.0)
        clock_hour = week_hour % 24.0

        if day < 5:
            is_work_light = clock_hour >= 17.0 or clock_hour < 9.0
            return lux if is_work_light else baseline

        is_day_off_light = 9.0 <= clock_hour < 24.0
        return lux if is_day_off_light else baseline

    return LightSchedule(light_at_hour, period=7.0 * 24.0)


SCENARIOS = [
    Scenario(
        id="regular",
        label="Regular indoor day",
        summary="A stable 07:00-23:00 light schedule with moderate indoor light.",
        signal_scale=1.0,
        cortisol_profile="reference",
        schedule_factory=lambda: LightSchedule.Regular(
            lux=150.0,
            lights_on=7.0,
            lights_off=23.0,
        ),
        caveat="Reference educational schedule; real indoor light histories vary widely.",
    ),
    Scenario(
        id="camping",
        label="Camping schedule",
        summary="Bright daytime outdoor light with very low light at night.",
        signal_scale=1.15,
        cortisol_profile="reference",
        schedule_factory=lambda: LightSchedule.from_pulse(
            lux=10000.0,
            start=6.5,
            duration=13.5,
            period=24.0,
            baseline=0.5,
        ),
        caveat="High-amplitude light-dark contrast is modeled as an illustrative outdoor schedule.",
    ),
    Scenario(
        id="aging",
        label="Aging",
        summary="Lower SCN-output strength over a regular day, with cortisol handled separately.",
        signal_scale=0.68,
        cortisol_profile="aging",
        schedule_factory=lambda: LightSchedule.Regular(
            lux=100.0,
            lights_on=8.0,
            lights_off=22.0,
        ),
        caveat="The oscillator model does not simulate HPA-axis aging; cortisol uses a Van Cauter overlay.",
    ),
    Scenario(
        id="shiftWork",
        label="Shift work",
        summary="Five night-work days followed by two day-oriented off days.",
        signal_scale=0.62,
        cortisol_profile="misaligned",
        schedule_factory=lambda: shift_work_schedule(lux=300.0, baseline=1.0),
        caveat="This is a light-schedule simulation, not a personal shift-work risk estimate.",
    ),
]

CHRONOTYPES = [
    Chronotype(
        id="neutral",
        label="Neutral",
        period_hours=24.2,
        phase_offset_hours=0.0,
        summary="Near the default Forger99 intrinsic period.",
    ),
    Chronotype(
        id="morning",
        label="Morning person",
        period_hours=23.9,
        phase_offset_hours=-1.25,
        summary="Shorter-period, earlier-phase educational chronotype.",
    ),
    Chronotype(
        id="nightOwl",
        label="Night owl",
        period_hours=24.45,
        phase_offset_hours=1.5,
        summary="Longer-period, later-phase educational chronotype.",
    ),
]


def round_float(value: float, digits: int = 3) -> float | None:
    if value is None or not math.isfinite(value):
        return None
    return round(float(value), digits)


def circular_delta_hours(value: float | None, reference: float | None) -> float:
    if value is None or reference is None:
        return 0.0
    return ((value - reference + 12.0) % 24.0) - 12.0


def latest_marker_in_window(markers: np.ndarray, window_start: float) -> float | None:
    markers = np.asarray(markers, dtype=float)
    markers = markers[np.isfinite(markers)]
    markers = markers[markers >= window_start]
    if markers.size == 0:
        return None
    return float(markers[-1])


def normalize_signal(values: np.ndarray, tail_values: np.ndarray) -> np.ndarray:
    center = float(np.nanmean(tail_values))
    span = float(np.nanmax(tail_values) - np.nanmin(tail_values))
    if not math.isfinite(span) or span <= 1e-6:
        return np.full(values.shape, 50.0)
    normalized = 50.0 + 76.0 * ((values - center) / span)
    return np.clip(normalized, 6.0, 94.0)


def finite_last(values: np.ndarray) -> float | None:
    values = np.asarray(values, dtype=float)
    values = values[np.isfinite(values)]
    if values.size == 0:
        return None
    return float(values[-1])


def day_to_day_light_regularity(time: np.ndarray, light: np.ndarray) -> float | None:
    start = max(0.0, float(time[-1] - 7.0 * 24.0))
    hourly_time = np.arange(start, float(time[-1]), 1.0)
    if hourly_time.size < 24 * 3:
        return None

    hourly_light = np.log1p(np.interp(hourly_time, time, light))
    full_days = hourly_light.size // 24
    if full_days < 2:
        return None

    profiles = hourly_light[: full_days * 24].reshape(full_days, 24)
    correlations = []
    for current, next_profile in zip(profiles[:-1], profiles[1:]):
        if np.std(current) < 1e-6 or np.std(next_profile) < 1e-6:
            correlations.append(1.0 if np.allclose(current, next_profile) else 0.0)
        else:
            correlations.append(float(np.corrcoef(current, next_profile)[0, 1]))

    if not correlations:
        return None

    normalized = [(value + 1.0) / 2.0 for value in correlations if math.isfinite(value)]
    if not normalized:
        return None
    return float(np.clip(np.mean(normalized), 0.0, 1.0))


def simulate_combination(scenario: Scenario, chronotype: Chronotype) -> dict:
    time = np.arange(0.0, 24.0 * SIMULATION_DAYS + DT_HOURS, DT_HOURS)
    schedule = scenario.schedule_factory()
    light = np.asarray(schedule(time), dtype=float)

    model = Forger99({"taux": chronotype.period_hours})
    initial_condition = model.equilibrate(time, light, num_loops=2)
    trajectory = model(time, initial_condition, light)
    states = np.asarray(trajectory.states, dtype=float)

    window_start = float(time[-1] - DISPLAY_HOURS)
    window_mask = time >= window_start
    window_time = time[window_mask]
    display_hour = window_time - window_start
    tail_mask = time >= time[-1] - 5.0 * 24.0

    oscillator = normalize_signal(states[window_mask, 0], states[tail_mask, 0])
    process_n = np.clip(states[window_mask, 2], 0.0, 1.0)

    amplitude_samples = []
    for sample_time in np.arange(window_start, time[-1] + 0.1, 6.0):
        try:
            amplitude_samples.append(float(model.amplitude(trajectory, time=float(sample_time))))
        except Exception:
            continue

    cbt_markers = np.asarray(model.cbt(trajectory), dtype=float)
    dlmo_markers = np.asarray(model.dlmos(trajectory), dtype=float)
    latest_cbt = latest_marker_in_window(cbt_markers, window_start)
    latest_dlmo = latest_marker_in_window(dlmo_markers, window_start)

    esri_input_time = np.arange(max(0.0, time[-1] - 7.0 * 24.0), time[-1] + 1.0, 1.0)
    esri_input_light = np.clip(np.interp(esri_input_time, time, light), 0.0, 1000.0)
    esri_times, esri_values = esri(
        esri_input_time,
        esri_input_light,
        analysis_days=2,
        esri_dt=24.0,
    )
    esri_value = finite_last(esri_values)

    points = []
    for hour, lux, signal, n_value in zip(display_hour, light[window_mask], oscillator, process_n):
        points.append(
            {
                "hour": round_float(hour, 2),
                "lightLux": round_float(lux, 1),
                "oscillator": round_float(signal, 2),
                "processN": round_float(n_value, 4),
            }
        )

    return {
        "id": f"{scenario.id}-{chronotype.id}",
        "scenarioId": scenario.id,
        "chronotypeId": chronotype.id,
        "model": {
            "name": "Forger99",
            "intrinsicPeriodHours": chronotype.period_hours,
            "dtHours": DT_HOURS,
            "simulationDays": SIMULATION_DAYS,
            "displayHours": DISPLAY_HOURS,
        },
        "metrics": {
            "finalAmplitude": round_float(model.amplitude(trajectory, time=float(time[-1])), 4),
            "meanWindowAmplitude": round_float(float(np.nanmean(amplitude_samples)), 4)
            if amplitude_samples
            else None,
            "finalPhaseRadians": round_float(model.phase(trajectory, time=float(time[-1])), 4),
            "latestCbtMinDisplayHour": round_float(
                latest_cbt - window_start if latest_cbt is not None else None,
                2,
            ),
            "latestDlmoDisplayHour": round_float(
                latest_dlmo - window_start if latest_dlmo is not None else None,
                2,
            ),
            "latestCbtMinClockHour": round_float(latest_cbt % 24.0 if latest_cbt is not None else None, 2),
            "latestDlmoClockHour": round_float(latest_dlmo % 24.0 if latest_dlmo is not None else None, 2),
            "esri": round_float(esri_value, 4),
            "lightRegularity": round_float(day_to_day_light_regularity(time, light), 4),
            "meanLightLux": round_float(float(np.nanmean(light[window_mask])), 1),
            "maxLightLux": round_float(float(np.nanmax(light[window_mask])), 1),
        },
        "display": {
            "signalScale": scenario.signal_scale,
            "chronotypePhaseOffsetHours": chronotype.phase_offset_hours,
            "modelPhaseOffsetHours": 0.0,
        },
        "points": points,
    }


def main() -> None:
    combinations = [
        simulate_combination(scenario, chronotype)
        for scenario in SCENARIOS
        for chronotype in CHRONOTYPES
    ]

    baseline = next(
        item
        for item in combinations
        if item["scenarioId"] == "regular" and item["chronotypeId"] == "neutral"
    )
    baseline_dlmo = baseline["metrics"]["latestDlmoClockHour"]

    for item in combinations:
        item["display"]["modelPhaseOffsetHours"] = round_float(
            circular_delta_hours(item["metrics"]["latestDlmoClockHour"], baseline_dlmo),
            2,
        )

    export = {
        "metadata": {
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "generator": "rhythm-lab-model/generate_scenarios.py",
            "package": "circadian",
            "packageVersion": "1.0.3",
            "modelScope": (
                "Arcascope/circadian grounds light schedules, oscillator state, "
                "phase markers, amplitude, and ESRI-style regularity. Cortisol "
                "aging is an evidence overlay, not a model output."
            ),
        },
        "scenarios": [
            {
                "id": scenario.id,
                "label": scenario.label,
                "summary": scenario.summary,
                "signalScale": scenario.signal_scale,
                "cortisolProfile": scenario.cortisol_profile,
                "caveat": scenario.caveat,
            }
            for scenario in SCENARIOS
        ],
        "chronotypes": [
            {
                "id": chronotype.id,
                "label": chronotype.label,
                "periodHours": chronotype.period_hours,
                "phaseOffsetHours": chronotype.phase_offset_hours,
                "summary": chronotype.summary,
            }
            for chronotype in CHRONOTYPES
        ],
        "combinations": combinations,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(export, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH.relative_to(ROOT.parent)}")


if __name__ == "__main__":
    main()
