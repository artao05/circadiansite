import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  chapters,
  citations,
  claimMatrix,
  medicineExamples,
  molecularClockTimeline,
  organClocks,
} from "./site-data";
import {
  getChapterNavChildren,
  reportSectionIds,
} from "../lib/report-nav";

const citationIds = new Set(citations.map((citation) => citation.id));
const parseIds = (value: string) => value.split(";").map((id) => id.trim());

describe("public v1 content integrity", () => {
  it("keeps citation IDs unique and resolves public evidence references", () => {
    expect(citationIds.size).toBe(citations.length);

    const referencedIds = [
      ...claimMatrix.flatMap((claim) => parseIds(claim.source)),
      ...medicineExamples.flatMap((example) => example.sources),
      ...organClocks.flatMap((organ) => organ.sources),
      ...molecularClockTimeline.sourceIds,
    ];

    referencedIds.forEach((id) => expect(citationIds.has(id), id).toBe(true));
  });

  it("keeps the chapter structure concise and navigable", () => {
    expect(chapters).toHaveLength(11);
    chapters.forEach((chapter) => {
      expect(chapter.dek.trim().split(/\s+/).length).toBeLessThanOrEqual(24);
    });
    expect(reportSectionIds).toEqual(["top", ...chapters.map((chapter) => chapter.id)]);
  });

  it("publishes only complete curated medicine examples", () => {
    expect(medicineExamples).toHaveLength(6);
    expect(
      medicineExamples.some((example) => example.name === "Long-acting insulin"),
    ).toBe(true);
    medicineExamples.forEach((example) => {
      expect(example.visualMode).toBe("interactive");
      expect(example.labVariant).toBeTruthy();
      expect(example.modelSummary.length).toBeGreaterThan(20);
      if (example.name === "Long-acting insulin") {
        expect(example.labVariant).toBe("meal-basal-layers");
        expect(example.mealLayers?.meals).toHaveLength(3);
      }
    });
    expect(getChapterNavChildren("medicine")).toHaveLength(medicineExamples.length);
  });

  it("contains no live gene-fetch UI or public gene API route", () => {
    const playerCard = readFileSync(
      join(process.cwd(), "app/components/GenePlayerCard.tsx"),
      "utf8",
    );
    expect(playerCard).not.toContain("/api/gene");
    expect(playerCard).not.toContain("Live database");
    expect(
      existsSync(join(process.cwd(), "app/api/gene/[symbol]/route.ts")),
    ).toBe(false);
  });
});
