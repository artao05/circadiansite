import type { ReactNode } from "react";

export type ModelNotationId =
  | "per-mrna-M"
  | "per-cytoplasmic-Pc"
  | "per-nuclear-P"
  | "initial-state"
  | "total-bmal-clock"
  | "binding-saturation"
  | "rates"
  | "total-delay"
  | "critical-delay";

const notationPresets: Record<ModelNotationId, ReactNode> = {
  "per-mrna-M": <>M</>,
  "per-cytoplasmic-Pc": (<>P<sub>c</sub></>),
  "per-nuclear-P": <>P</>,
  "initial-state": (<>M = P<sub>c</sub> = P = 0.1</>),
  "total-bmal-clock": (<>A<sub>T</sub> = 1.5</>),
  "binding-saturation": (<>K<sub>d</sub> = K<sub>a</sub> = K<sub>m</sub> = 1</>),
  rates: (<>α, β, V<sub>max</sub> ≈ 1 h<sup>−1</sup></>),
  "total-delay": <>τ = 9 h</>,
  "critical-delay": <>τ₀ ≈ 4.54 h</>,
};

type SvgPart = { kind: "text" | "sub" | "sup"; value: string };

const svgNotationPresets: Record<ModelNotationId, SvgPart[]> = {
  "per-mrna-M": [{ kind: "text", value: "M" }],
  "per-cytoplasmic-Pc": [{ kind: "text", value: "P" }, { kind: "sub", value: "c" }],
  "per-nuclear-P": [{ kind: "text", value: "P" }],
  "initial-state": [{ kind: "text", value: "M = P" }, { kind: "sub", value: "c" }, { kind: "text", value: " = P = 0.1" }],
  "total-bmal-clock": [{ kind: "text", value: "A" }, { kind: "sub", value: "T" }, { kind: "text", value: " = 1.5" }],
  "binding-saturation": [{ kind: "text", value: "K" }, { kind: "sub", value: "d" }, { kind: "text", value: " = K" }, { kind: "sub", value: "a" }, { kind: "text", value: " = K" }, { kind: "sub", value: "m" }, { kind: "text", value: " = 1" }],
  rates: [{ kind: "text", value: "α, β, V" }, { kind: "sub", value: "max" }, { kind: "text", value: " ≈ 1 h" }, { kind: "sup", value: "−1" }],
  "total-delay": [{ kind: "text", value: "τ = 9 h" }],
  "critical-delay": [{ kind: "text", value: "τ₀ ≈ 4.54 h" }],
};

export function ModelNotation({ id, className }: { id: ModelNotationId; className?: string }) {
  return <span className={className ? `model-notation ${className}` : "model-notation"}>{notationPresets[id]}</span>;
}

export function SvgModelLabel({ id, x, y, className, anchor = "start" }: { id: ModelNotationId; x: number; y: number; className?: string; anchor?: "start" | "middle" | "end" }) {
  const parts = svgNotationPresets[id];
  return (
    <text x={x} y={y} className={className} textAnchor={anchor}>
      {parts.map((part, index) => {
        if (part.kind === "sub") return <tspan key={index} baselineShift="sub" fontSize="0.72em">{part.value}</tspan>;
        if (part.kind === "sup") return <tspan key={index} baselineShift="super" fontSize="0.72em">{part.value}</tspan>;
        return <tspan key={index}>{part.value}</tspan>;
      })}
    </text>
  );
}
