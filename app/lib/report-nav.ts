import {
  chapters,
  medicineExamples,
  organClocks,
  type Chapter,
  type NavChild,
  type NavGroup,
} from "../content/site-data";

export const navGroupOrder: NavGroup[] = [
  "foundations",
  "clocks",
  "medicine",
  "evidence",
];

export const navGroupMeta: Record<
  NavGroup,
  { label: string; description: string }
> = {
  foundations: {
    label: "Basics",
    description: "Learn how body time works.",
  },
  clocks: {
    label: "Body clocks",
    description: "See how the brain, organs, cells, and genes keep time.",
  },
  medicine: {
    label: "Medicine",
    description: "See why timing enters clinical research.",
  },
  evidence: {
    label: "Evidence",
    description: "Trace claims to sources.",
  },
};

const medicineSlugMap: Record<string, string> = {
  "Short-acting statins": "statins",
  "Long-acting insulin": "insulin",
  Anticoagulants: "anticoagulants",
  "Acid reflux medicines": "acid-reflux",
  "ADHD medicines": "adhd",
  "Sleep aids": "sleep-aids",
};

export function medicineSlug(name: string): string {
  return medicineSlugMap[name] ?? name.toLowerCase().replace(/\s+/g, "-");
}

export function getChapterNavChildren(chapterId: string): NavChild[] {
  if (chapterId === "body-clocks") {
    return organClocks.map((organ) => ({
      id: organ.id,
      label: organ.name,
      hash: `body-clocks/${organ.id}`,
    }));
  }

  if (chapterId === "medicine") {
    return medicineExamples.map((example) => ({
      id: medicineSlug(example.name),
      label: example.name,
      hash: `medicine/${medicineSlug(example.name)}`,
    }));
  }

  return [];
}

export function chaptersByNavGroup(): Record<NavGroup, Chapter[]> {
  return navGroupOrder.reduce(
    (groups, group) => {
      groups[group] = chapters.filter((chapter) => chapter.navGroup === group);
      return groups;
    },
    {} as Record<NavGroup, Chapter[]>,
  );
}

export const reportSectionIds = ["top", ...chapters.map((chapter) => chapter.id)];

export function parseNestedNavHash(
  hash: string,
): { chapterId: string; childId?: string } | null {
  const normalized = hash.replace(/^#/, "");
  if (!normalized) return null;

  const [chapterId, childId] = normalized.split("/");
  const chapter = chapters.find((item) => item.id === chapterId);
  if (!chapter) return null;

  return childId ? { chapterId, childId } : { chapterId };
}
