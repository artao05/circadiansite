export type SandboxThemeName = "elegant" | "clinical" | "brutal";

export type SandboxTheme = {
  name: string;
  shell: string;
  panel: string;
  mutedPanel: string;
  button: string;
  buttonActive: string;
  metric: string;
  chart: {
    processS: string;
    feltS: string;
    processC: string;
    caffeine: string;
    sleep: string;
    grid: string;
    text: string;
    cursor: string;
  };
};

export const sandboxThemes: Record<SandboxThemeName, SandboxTheme> = {
  elegant: {
    name: "Elegant",
    shell: "bg-[#fff9ef] text-[#101820]",
    panel: "border border-[#1018201f] bg-white/75 shadow-[0_24px_80px_rgba(16,24,32,0.10)]",
    mutedPanel: "border border-[#1018201a] bg-[#f8f2e8]/85",
    button: "border border-[#10182024] bg-white/70 text-[#101820] hover:bg-white",
    buttonActive: "border border-[#101820] bg-[#101820] text-[#fff9ef]",
    metric: "border border-[#1018201a] bg-white/72",
    chart: {
      processS: "#9f8cff",
      feltS: "#6d5df6",
      processC: "#f7b267",
      caffeine: "#54d6c2",
      sleep: "#101820",
      grid: "rgba(16,24,32,0.11)",
      text: "#66717a",
      cursor: "#ff6b6b",
    },
  },
  clinical: {
    name: "Clinical",
    shell: "bg-[#f6fafb] text-[#102027]",
    panel: "border border-[#b7c9d3] bg-white shadow-[0_18px_50px_rgba(31,71,91,0.10)]",
    mutedPanel: "border border-[#cddde4] bg-[#edf6f8]",
    button: "border border-[#b7c9d3] bg-white text-[#102027] hover:bg-[#edf6f8]",
    buttonActive: "border border-[#0e7490] bg-[#0e7490] text-white",
    metric: "border border-[#cddde4] bg-white",
    chart: {
      processS: "#7c3aed",
      feltS: "#2563eb",
      processC: "#0f9f6e",
      caffeine: "#0891b2",
      sleep: "#64748b",
      grid: "rgba(15,32,39,0.12)",
      text: "#52616b",
      cursor: "#dc2626",
    },
  },
  brutal: {
    name: "Brutal",
    shell: "bg-[#f5f0df] text-[#0b0b0b]",
    panel: "border-2 border-[#0b0b0b] bg-[#fffdf2] shadow-[8px_8px_0_#0b0b0b]",
    mutedPanel: "border-2 border-[#0b0b0b] bg-[#ffe45e]",
    button: "border-2 border-[#0b0b0b] bg-[#fffdf2] text-[#0b0b0b] hover:bg-[#ffe45e]",
    buttonActive: "border-2 border-[#0b0b0b] bg-[#0b0b0b] text-[#ffe45e]",
    metric: "border-2 border-[#0b0b0b] bg-[#fffdf2]",
    chart: {
      processS: "#7f1dff",
      feltS: "#ff2e63",
      processC: "#008f7a",
      caffeine: "#0057ff",
      sleep: "#0b0b0b",
      grid: "rgba(11,11,11,0.18)",
      text: "#0b0b0b",
      cursor: "#ff2e63",
    },
  },
};

