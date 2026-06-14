"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type CircadianPhase = "morning" | "midday" | "evening" | "night";

type CircadianTheme = {
  phase: CircadianPhase;
  label: string;
  caption: string;
  variables: CSSProperties & Record<`--${string}`, string>;
};

type CircadianTimeContextValue = {
  hour: number;
  phase: CircadianPhase;
  phaseLabel: string;
  phaseCaption: string;
  setHour: (hour: number) => void;
};

const CircadianTimeContext = createContext<CircadianTimeContextValue | null>(
  null,
);

function normalizeHour(hour: number) {
  return ((Math.round(hour) % 24) + 24) % 24;
}

export function formatMasterHour(hour: number) {
  return `${String(normalizeHour(hour)).padStart(2, "0")}:00`;
}

function getCircadianTheme(hour: number): CircadianTheme {
  const normalized = normalizeHour(hour);

  if (normalized >= 5 && normalized < 11) {
    return {
      phase: "morning",
      label: "Morning",
      caption:
        "Warm light, rising cortisol, and systems shifting toward activity.",
      variables: {
        "--ink": "#17202a",
        "--ink-soft": "#263446",
        "--paper": "#fff4df",
        "--paper-deep": "#f1dcc0",
        "--line": "rgba(80, 49, 27, 0.18)",
        "--muted": "#716553",
        "--amber": "#f8b84e",
        "--cyan": "#5dcfc1",
        "--coral": "#ef6f61",
        "--green": "#7fbf72",
        "--violet": "#9b8fe8",
        "--card": "rgba(255, 251, 241, 0.9)",
        "--hero-bg-1": "#1b2932",
        "--hero-bg-2": "#324f55",
        "--hero-aura": "rgba(248, 184, 78, 0.3)",
        "--hero-copy-muted": "rgba(255, 249, 239, 0.8)",
        "--nav-bg": "rgba(23, 32, 42, 0.82)",
        "--visual-panel-bg": "rgba(255, 251, 241, 0.76)",
        "--control-bg": "#fff8eb",
        "--selected-bg": "#17202a",
        "--selected-fg": "#fff8eb",
        "--opening-bg": "#fff7e8",
        "--rhythm-bg": "#f3f5df",
        "--sync-bg": "#f7ead0",
        "--medicine-bg": "#fff0e8",
        "--genes-bg": "#eff6df",
        "--oxal-bg": "#1a2630",
        "--time-glow": "rgba(248, 184, 78, 0.36)",
      },
    };
  }

  if (normalized >= 11 && normalized < 17) {
    return {
      phase: "midday",
      label: "Midday",
      caption:
        "Crisp contrast, high signal, and physiology in active daylight.",
      variables: {
        "--ink": "#101820",
        "--ink-soft": "#1d2a35",
        "--paper": "#f8f2e8",
        "--paper-deep": "#eadfce",
        "--line": "rgba(16, 24, 32, 0.16)",
        "--muted": "#66717a",
        "--amber": "#f7b267",
        "--cyan": "#54d6c2",
        "--coral": "#ff6b6b",
        "--green": "#8bcf7f",
        "--violet": "#9f8cff",
        "--card": "rgba(255, 252, 246, 0.88)",
        "--hero-bg-1": "#101820",
        "--hero-bg-2": "#152630",
        "--hero-aura": "rgba(84, 214, 194, 0.2)",
        "--hero-copy-muted": "rgba(255, 249, 239, 0.78)",
        "--nav-bg": "rgba(16, 24, 32, 0.82)",
        "--visual-panel-bg": "rgba(255, 252, 246, 0.72)",
        "--control-bg": "#fff9ef",
        "--selected-bg": "#101820",
        "--selected-fg": "#fff9ef",
        "--opening-bg": "#fff9ef",
        "--rhythm-bg": "#eef6f2",
        "--sync-bg": "#f5ebda",
        "--medicine-bg": "#fdf1ef",
        "--genes-bg": "#edf7e9",
        "--oxal-bg": "#111c24",
        "--time-glow": "rgba(84, 214, 194, 0.28)",
      },
    };
  }

  if (normalized >= 17 && normalized < 21) {
    return {
      phase: "evening",
      label: "Evening",
      caption:
        "Lower light, warmer edges, and the body preparing to shift states.",
      variables: {
        "--ink": "#161922",
        "--ink-soft": "#252332",
        "--paper": "#f5eadc",
        "--paper-deep": "#e3cdbd",
        "--line": "rgba(38, 25, 38, 0.18)",
        "--muted": "#6f6470",
        "--amber": "#f0a85d",
        "--cyan": "#65c8bd",
        "--coral": "#f06c72",
        "--green": "#83bd82",
        "--violet": "#a78bfa",
        "--card": "rgba(255, 247, 237, 0.86)",
        "--hero-bg-1": "#171923",
        "--hero-bg-2": "#312535",
        "--hero-aura": "rgba(240, 108, 114, 0.24)",
        "--hero-copy-muted": "rgba(255, 242, 229, 0.76)",
        "--nav-bg": "rgba(22, 25, 34, 0.84)",
        "--visual-panel-bg": "rgba(255, 247, 237, 0.72)",
        "--control-bg": "#fff4e8",
        "--selected-bg": "#161922",
        "--selected-fg": "#fff4e8",
        "--opening-bg": "#fff2e2",
        "--rhythm-bg": "#efece2",
        "--sync-bg": "#f4dfce",
        "--medicine-bg": "#fae6e4",
        "--genes-bg": "#e9f0df",
        "--oxal-bg": "#151722",
        "--time-glow": "rgba(240, 108, 114, 0.34)",
      },
    };
  }

  return {
    phase: "night",
    label: "Night",
    caption: "Deep ink, low light, sleep pressure, repair, and hormonal night.",
    variables: {
      "--ink": "#eef6f7",
      "--ink-soft": "#d8e7ea",
      "--paper": "#0d151d",
      "--paper-deep": "#111f2b",
      "--line": "rgba(232, 242, 244, 0.14)",
      "--muted": "#a9b9c0",
      "--amber": "#d6a45c",
      "--cyan": "#63d6cf",
      "--coral": "#f17b7d",
      "--green": "#9bd890",
      "--violet": "#b9a7ff",
      "--card": "rgba(18, 31, 42, 0.82)",
      "--hero-bg-1": "#071018",
      "--hero-bg-2": "#101b27",
      "--hero-aura": "rgba(99, 214, 207, 0.2)",
      "--hero-copy-muted": "rgba(232, 242, 244, 0.72)",
      "--nav-bg": "rgba(7, 16, 24, 0.9)",
      "--visual-panel-bg": "rgba(18, 31, 42, 0.7)",
      "--control-bg": "#142231",
      "--selected-bg": "#63d6cf",
      "--selected-fg": "#071018",
      "--opening-bg": "#0f1a24",
      "--rhythm-bg": "#101f26",
      "--sync-bg": "#151f28",
      "--medicine-bg": "#171e27",
      "--genes-bg": "#101f22",
      "--oxal-bg": "#080d13",
      "--time-glow": "rgba(99, 214, 207, 0.3)",
    },
  };
}

export function CircadianTimeProvider({ children }: { children: ReactNode }) {
  const [hour, setHourState] = useState(8);
  const theme = useMemo(() => getCircadianTheme(hour), [hour]);

  const value = useMemo<CircadianTimeContextValue>(
    () => ({
      hour,
      phase: theme.phase,
      phaseLabel: theme.label,
      phaseCaption: theme.caption,
      setHour: (nextHour) => setHourState(normalizeHour(nextHour)),
    }),
    [hour, theme.caption, theme.label, theme.phase],
  );

  return (
    <CircadianTimeContext.Provider value={value}>
      <div
        className="circadian-shell"
        data-circadian-phase={theme.phase}
        style={theme.variables}
      >
        {children}
      </div>
    </CircadianTimeContext.Provider>
  );
}

export function useCircadianTime() {
  const context = useContext(CircadianTimeContext);
  if (!context) {
    throw new Error(
      "useCircadianTime must be used inside CircadianTimeProvider",
    );
  }
  return context;
}
