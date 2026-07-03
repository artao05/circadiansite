export const sandboxChartColors = {
  processS: "var(--violet)",
  feltS: "color-mix(in srgb, var(--violet) 72%, var(--ink))",
  processC: "var(--amber)",
  caffeine: "var(--cyan)",
  sleep: "var(--ink)",
  grid: "color-mix(in srgb, var(--ink) 11%, transparent)",
  text: "var(--muted)",
  cursor: "var(--coral)",
} as const;

export type SandboxChartColors = typeof sandboxChartColors;
