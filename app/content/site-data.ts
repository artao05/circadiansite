import {
  Activity,
  AlarmClock,
  Brain,
  Clock3,
  Dna,
  HeartPulse,
  Moon,
  Pill,
  Shield,
  Stethoscope,
  SunMedium,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  DrugAbsorptionOption,
  DrugExposureProfile,
  TargetRhythmProfile,
} from "../lib/drug-timing-model";

export type Citation = {
  id: string;
  title: string;
  source: string;
  note: string;
  url?: string;
};

export type Chapter = {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  dek: string;
};

export type Claim = {
  claim: string;
  source: string;
  evidenceType: string;
  confidence: "High" | "Moderate" | "Emerging";
  caveat: string;
  visualUse: string;
  beginnerPhrasing: string;
};

export type OrganClockEvent = {
  hour: number;
  label: string;
  copy: string;
};

export type OrganClock = {
  id: string;
  name: string;
  iconName: "Brain" | "Activity" | "HeartPulse" | "Shield";
  tone: "light" | "metabolic" | "cardio" | "immune";
  events: OrganClockEvent[];
};

export type MedicineExample = {
  name: string;
  icon: LucideIcon;
  visualMode: "interactive" | "planned";
  labVariant?: "curve" | "acid-pump" | "day-runway" | "night-window";
  bodyTarget: {
    organ: string;
    action: string;
    route: string[];
  };
  doseWindow: {
    minHour: number;
    maxHour: number;
    defaultHour: number;
    presets: { label: string; hour: number }[];
  };
  exposureProfiles: DrugExposureProfile[];
  absorptionOptions?: DrugAbsorptionOption[];
  targetRhythm: TargetRhythmProfile;
  overlapLabel: string;
  interpretation: {
    low: string;
    medium: string;
    high: string;
  };
  sources: string[];
  safetyCaveat: string;
  labelCue: string;
  whyTimingAppears: string;
  morningLens: string;
  eveningLens: string;
  sourceId: string;
};

export type GeneCard = {
  gene: string;
  title: string;
  tissue: string;
  phaseHour: number;
  amplitude: number;
  copy: string;
  evidence: string;
};

export type ClockGeneCategory =
  | "corePositive"
  | "coreNegative"
  | "secondaryLoop"
  | "accessoryRegulator"
  | "organSystem"
  | "downstreamTarget";

export type ClockEdgeType =
  | "activation"
  | "repression"
  | "phosphorylation"
  | "regulation";

export type ClockGeneNode = {
  id: string;
  symbol: string;
  aliases: string[];
  category: ClockGeneCategory;
  chromosome: string;
  x: number;
  y: number;
  title: string;
  description: string;
  expressionPattern: string;
  peakTime: string;
  tissues: string[];
  diseaseAssociations: {
    disease: string;
    mechanism: string;
    sources: string[];
  }[];
  externalLinks: {
    ncbiGene: string;
    uniProt: string;
    circaKb: string;
    circaDb: string;
  };
  sources: string[];
};

export type ClockGeneEdge = {
  id: string;
  source: string;
  target: string;
  type: ClockEdgeType;
  label: string;
  description: string;
  sources: string[];
  pdbId?: string;
};

export type CircadianDataSource = {
  id: string;
  name: string;
  purpose: string;
  status: string;
  url: string;
};

export type WorkflowStep = {
  title: string;
  copy: string;
  icon: LucideIcon;
};

export const citations: Citation[] = [
  {
    id: "cederroth-2019",
    title: "Medicine in the fourth dimension",
    source: "2019 - Medicine in the 4th Dimension.pdf",
    note: "Review article used for the broad chronomedicine framing, oxaliplatin history, and translation caveats.",
  },
  {
    id: "smith-2019",
    title: "When Should You Take Your Medicines?",
    source: "2019 - When should you take your medicines.pdf",
    note: "Beginner-facing article used for medication timing examples and the wall-clock versus body-clock distinction.",
  },
  {
    id: "klerman-2026",
    title:
      "Translational applications of circadian research: connecting chronobiology to medicine",
    source:
      "2026 - Translational Applications of Circadian Research connecting chronobiology to medicine.pdf",
    note: "Perspective used for the future workflow: detecting, targeting, and exploiting biological time.",
  },
  {
    id: "circakb",
    title: "CircaKB",
    source: "Nucleic Acids Research database paper",
    note: "Primary database attribution for rhythmic gene-expression evidence across species, tissues, datasets, and algorithms.",
    url: "https://academic.oup.com/nar/article/53/D1/D67/7779352",
  },
  {
    id: "circadb",
    title: "CIRCA / CircaDB",
    source: "Circadian gene expression profiles",
    note: "Mammalian circadian transcriptional-profile database used as a source link-out for gene expression exploration.",
    url: "https://circadb.hogeneschlab.org/",
  },
  {
    id: "cgdb",
    title: "Circadian Gene DataBase",
    source: "CGDB",
    note: "Broad circadian-gene database across eukaryotes; useful for validating whether genes are circadian-related across organisms.",
    url: "https://cgdb.biocuckoo.org/",
  },
  {
    id: "reactome-clock",
    title:
      "Phosphorylated BMAL1:CLOCK activates expression of core clock genes",
    source: "Reactome pathway R-HSA-9931510",
    note: "Pathway source for activation/repression relationships in the human circadian clock network.",
    url: "https://reactome.org/content/detail/R-HSA-9931510",
  },
  {
    id: "ncbi-clock-table",
    title: "Selected mammalian circadian core clock genes",
    source: "NCBI Bookshelf / NTP table",
    note: "Public-domain reference table for core mammalian clock genes and primary functions.",
    url: "https://www.ncbi.nlm.nih.gov/books/NBK571591/table/ch3.tab1/?report=objectonly",
  },
  {
    id: "pnas-atlas",
    title: "A circadian gene expression atlas in mammals",
    source: "PNAS",
    note: "Roadmap source for explaining tissue-specific rhythmic gene expression.",
    url: "https://www.pnas.org/doi/10.1073/pnas.1408886111",
  },
];

export const chapters: Chapter[] = [
  {
    id: "opening",
    number: "00",
    eyebrow: "Medicine in the 4th dimension",
    title: "Your body is not the same body at every hour.",
    dek: "A dose, meal, light pulse, or lab test can land in a different biological world depending on when it arrives.",
  },
  {
    id: "rhythm-lab",
    number: "01",
    eyebrow: "What is a rhythm?",
    title: "A rhythm is a shape in time.",
    dek: "Period, amplitude, phase, baseline, and noise are the simple ingredients behind a surprisingly rich biological language.",
  },
  {
    id: "sync",
    number: "02",
    eyebrow: "How clocks stay in sync",
    title: "Light, sleep, meals, and activity all tug on time.",
    dek: "Circadian time is not just a wall clock. It is a living estimate that updates from repeated signals.",
  },
  {
    id: "body-clocks",
    number: "03",
    eyebrow: "The body is many clocks",
    title: "One person, many daily schedules.",
    dek: "The brain clock coordinates the day, while liver, gut, immune, cardiovascular, and metabolic tissues keep local time.",
  },
  {
    id: "medicine",
    number: "04",
    eyebrow: "When should you take medicines?",
    title: "For some drugs, timing is part of the biology.",
    dek: "Labels, side effects, absorption, metabolism, and target activity can all make time-of-day matter.",
  },
  {
    id: "oxaliplatin",
    number: "05",
    eyebrow: "Oxaliplatin and chronotherapy",
    title: "A cancer drug story where timing changed the plot.",
    dek: "Oxaliplatin became a landmark example of how chronopharmacology can change toxicity, efficacy, and clinical interpretation.",
  },
  {
    id: "genes",
    number: "06",
    eyebrow: "Clock-gene network",
    title: "The molecular clock is a web, not a list.",
    dek: "Explore core clock genes, regulatory loops, rhythmic expression evidence, disease links, and source databases in one interactive map.",
  },
  {
    id: "workflow",
    number: "07",
    eyebrow: "The future workflow",
    title: "Chronomedicine starts by measuring time.",
    dek: "The next step is to connect biological phase, rhythmic targets, intervention timing, and clinical validation.",
  },
];

export const claimMatrix: Claim[] = [
  {
    claim:
      "Circadian timing can influence drug efficacy, toxicity, absorption, metabolism, or side effects.",
    source: "smith-2019; cederroth-2019",
    evidenceType: "Beginner review and chronomedicine review",
    confidence: "High",
    caveat:
      "The relevant direction and timing depend on the drug, patient, target, and label.",
    visualUse: "Medication timing comparison panel",
    beginnerPhrasing:
      "For some medicines, the hour matters because the body is doing different jobs across the day.",
  },
  {
    claim:
      "Wall-clock morning can differ from a person's internal biological morning.",
    source: "smith-2019",
    evidenceType: "Educational review",
    confidence: "High",
    caveat:
      "Precise internal phase usually requires biomarkers or validated models.",
    visualUse: "Rhythm lab phase control and entrainment demo",
    beginnerPhrasing:
      "Your phone may say morning, but your body clock can be early, late, or shifted.",
  },
  {
    claim:
      "Oxaliplatin is a major chronotherapy example in metastatic colorectal cancer.",
    source: "cederroth-2019",
    evidenceType: "Clinical history and trial review",
    confidence: "Moderate",
    caveat:
      "Clinical translation still requires personalization and careful trial context.",
    visualUse: "Oxaliplatin evidence timeline",
    beginnerPhrasing:
      "A drug that looked too toxic in one schedule looked different when timing was designed into treatment.",
  },
  {
    claim:
      "Wearables, biospecimen-based phase tests, and validated models are central to future chronomedicine.",
    source: "klerman-2026",
    evidenceType: "Perspective review",
    confidence: "Moderate",
    caveat:
      "These methods are improving, but clinical workflows and standards are still developing.",
    visualUse: "Closing workflow",
    beginnerPhrasing:
      "Before medicine can reliably use biological time, medicine has to measure biological time.",
  },
  {
    claim:
      "Core mammalian clock genes form interlocked positive, negative, secondary, and accessory regulatory loops.",
    source: "reactome-clock; ncbi-clock-table; circakb; circadb; cgdb",
    evidenceType: "Pathway/database references and curated gene annotations",
    confidence: "Moderate",
    caveat:
      "V1 is a curated human clock-gene network with database link-outs; live CircaKB/CircaDB dataset imports remain a v2 data pipeline.",
    visualUse: "Interactive clock-gene network",
    beginnerPhrasing:
      "Clock genes talk to each other in loops: some turn rhythms on, some apply brakes, and others tune the timing.",
  },
];

export const organClocks: OrganClock[] = [
  {
    id: "brain",
    name: "Brain (SCN)",
    iconName: "Brain",
    tone: "light",
    events: [
      {
        hour: 8,
        label: "Cortisol peak & light entrainment",
        copy: "Morning light provides the strongest timing cue, while cortisol peaks to support wakefulness.",
      },
      {
        hour: 14,
        label: "Mid-afternoon dip",
        copy: "The central pacemaker exhibits a natural dip in alerting signals in the early afternoon.",
      },
      {
        hour: 21,
        label: "Melatonin onset (DLMO)",
        copy: "Dim light melatonin onset signals the biological night, preparing the brain for sleep architecture.",
      },
    ],
  },
  {
    id: "metabolism",
    name: "Metabolism (Liver/Gut)",
    iconName: "Activity",
    tone: "metabolic",
    events: [
      {
        hour: 10,
        label: "Peak glucose handling",
        copy: "Insulin sensitivity and glucose tolerance are generally highest in the first half of the day.",
      },
      {
        hour: 16,
        label: "Peak drug metabolism",
        copy: "Many liver enzymes, like CYP3A4, peak in the late afternoon, affecting how long drugs stay active.",
      },
      {
        hour: 23,
        label: "Fasting & repair mode",
        copy: "The gut slows motility and the liver shifts from storing nutrients to mobilizing them for overnight maintenance.",
      },
    ],
  },
  {
    id: "cardio",
    name: "Cardiovascular",
    iconName: "HeartPulse",
    tone: "cardio",
    events: [
      {
        hour: 5,
        label: "Pre-wake blood pressure ramp",
        copy: "Blood pressure and heart rate surge before waking, which correlates with a morning peak in cardiovascular events.",
      },
      {
        hour: 17,
        label: "Peak athletic efficiency",
        copy: "Cardiovascular efficiency and muscle strength often peak in the late afternoon.",
      },
      {
        hour: 2,
        label: "Deep sleep blood pressure dip",
        copy: "A healthy cardiovascular system exhibits a 10-20% drop in blood pressure during deep sleep.",
      },
    ],
  },
  {
    id: "immune",
    name: "Immune System",
    iconName: "Shield",
    tone: "immune",
    events: [
      {
        hour: 8,
        label: "Adaptive cellular patrol",
        copy: "T-cells and other adaptive immune cells often peak in circulation in the morning, ready for encounters.",
      },
      {
        hour: 20,
        label: "Inflammatory tone shift",
        copy: "Pro-inflammatory cytokines often rise in the evening, which is why fever and asthma symptoms can worsen at night.",
      },
      {
        hour: 2,
        label: "Tissue repair",
        copy: "Innate immune cells move into tissues overnight to clear debris and promote repair while the body rests.",
      },
    ],
  },
];

export const medicineExamples: MedicineExample[] = [
  {
    name: "Short-acting statins",
    icon: Pill,
    visualMode: "interactive",
    labVariant: "curve",
    bodyTarget: {
      organ: "Liver",
      action: "Cholesterol synthesis pathway",
      route: ["pill", "gut absorption", "bloodstream", "liver"],
    },
    doseWindow: {
      minHour: 6,
      maxHour: 23,
      defaultHour: 22,
      presets: [
        { label: "Morning", hour: 8 },
        { label: "Dinner", hour: 18 },
        { label: "Bedtime", hour: 22 },
      ],
    },
    exposureProfiles: [
      {
        id: "short",
        label: "Short-acting",
        halfLifeHours: 2.4,
        peakHours: 2,
        tailHours: 10,
        copy: "Rises over a few hours and clears quickly in this simplified model.",
      },
      {
        id: "long",
        label: "Longer-acting comparison",
        halfLifeHours: 8,
        peakHours: 3,
        tailHours: 22,
        copy: "Stays active longer, making the exact clock time less visually sharp in this model.",
      },
    ],
    targetRhythm: {
      label: "Nighttime cholesterol synthesis",
      peakHour: 2,
      widthHours: 8,
      baseline: 0.08,
      amplitude: 0.92,
      copy: "The target rhythm is shown as a nighttime wave, based on the beginner article's explanation that cholesterol synthesis rises during sleep.",
    },
    overlapLabel: "Projected overlap with nighttime synthesis",
    interpretation: {
      low: "Low overlap in this simplified model: the drug curve is mostly fading before the target rhythm rises.",
      medium:
        "Moderate overlap in this simplified model: some active drug is present during the target window.",
      high: "Higher overlap in this simplified model: active drug presence lines up with more of the target rhythm.",
    },
    sources: ["smith-2019"],
    safetyCaveat:
      "This illustrates label-based timing logic for some short-acting statins. It is not medication advice.",
    labelCue: "Often discussed with bedtime dosing in label-based examples.",
    whyTimingAppears:
      "Cholesterol synthesis tends to rise during sleep, while short-acting statins clear quickly.",
    morningLens:
      "A morning dose may miss part of the overnight synthesis window for some short-acting drugs.",
    eveningLens:
      "An evening or bedtime dose can better overlap with the target biology for some labels.",
    sourceId: "smith-2019",
  },
  {
    name: "Long-acting insulin",
    icon: Activity,
    visualMode: "planned",
    bodyTarget: {
      organ: "Pancreas / bloodstream",
      action: "Overnight glucose coverage",
      route: [
        "injection",
        "subcutaneous depot",
        "bloodstream",
        "glucose control",
      ],
    },
    doseWindow: {
      minHour: 6,
      maxHour: 23,
      defaultHour: 21,
      presets: [
        { label: "Morning", hour: 8 },
        { label: "Last meal", hour: 19 },
        { label: "Bedtime", hour: 22 },
      ],
    },
    exposureProfiles: [
      {
        id: "basal",
        label: "Basal coverage",
        halfLifeHours: 12,
        peakHours: 4,
        tailHours: 24,
        copy: "A future visual can show broad overnight coverage rather than a sharp peak.",
      },
    ],
    targetRhythm: {
      label: "Overnight glucose-control need",
      peakHour: 3,
      widthHours: 9,
      baseline: 0.25,
      amplitude: 0.55,
      copy: "A future visual can show why overnight coverage matters for specific products and regimens.",
    },
    overlapLabel: "Projected overnight coverage",
    interpretation: {
      low: "Low modeled coverage.",
      medium: "Moderate modeled coverage.",
      high: "Higher modeled coverage.",
    },
    sources: ["smith-2019"],
    safetyCaveat:
      "Insulin timing is highly regimen-specific and must come from a clinician or label.",
    labelCue: "Some once-daily instructions reference last meal or bedtime.",
    whyTimingAppears:
      "Glucose control continues through the night, so timing can shape overnight coverage.",
    morningLens:
      "Morning dosing may suit some regimens, but label and clinician guidance are decisive.",
    eveningLens:
      "Evening/bedtime examples aim at overnight glucose control in specific products.",
    sourceId: "smith-2019",
  },
  {
    name: "Anticoagulants",
    icon: HeartPulse,
    visualMode: "interactive",
    labVariant: "curve",
    bodyTarget: {
      organ: "Blood vessels",
      action: "Absorption and morning availability",
      route: ["tablet", "gut absorption", "bloodstream", "morning risk window"],
    },
    doseWindow: {
      minHour: 6,
      maxHour: 23,
      defaultHour: 19,
      presets: [
        { label: "Breakfast", hour: 8 },
        { label: "Dinner", hour: 19 },
        { label: "Bedtime", hour: 22 },
      ],
    },
    exposureProfiles: [
      {
        id: "meal-dependent",
        label: "Meal-linked availability",
        halfLifeHours: 9,
        peakHours: 3,
        tailHours: 22,
        copy: "This simplified curve rises after dosing and stays visible into the next morning.",
      },
    ],
    absorptionOptions: [
      {
        id: "with-meal",
        label: "With meal",
        multiplier: 1,
        copy: "The meal-linked setting shows stronger modeled absorption before the drug circulates.",
      },
      {
        id: "lighter-absorption",
        label: "Lighter absorption",
        multiplier: 0.58,
        copy: "The lighter setting lowers the curve to show how less absorption can reduce morning availability.",
      },
    ],
    targetRhythm: {
      label: "Morning cardiovascular risk window",
      peakHour: 7,
      widthHours: 5,
      baseline: 0.2,
      amplitude: 0.65,
      copy: "The target rhythm is shown as a simplified morning window, not a personal risk prediction.",
    },
    overlapLabel: "Projected morning availability",
    interpretation: {
      low: "Low modeled morning availability: the exposure curve is weak or fading during the morning window.",
      medium:
        "Moderate modeled morning availability: some exposure carries into the morning window.",
      high: "Higher modeled morning availability: exposure lines up with more of the morning window.",
    },
    sources: ["smith-2019"],
    safetyCaveat:
      "Anticoagulant timing depends on the exact product, meal instructions, and clinician guidance.",
    labelCue: "Some labels pair dosing with the evening meal.",
    whyTimingAppears:
      "Meal timing can affect absorption, and morning cardiovascular risk is one reason timing is studied.",
    morningLens:
      "The central question is whether enough drug is active during a higher-risk morning window.",
    eveningLens:
      "Evening meal instructions can support absorption and overnight availability for some products.",
    sourceId: "smith-2019",
  },
  {
    name: "Acid reflux medicines",
    icon: Stethoscope,
    visualMode: "interactive",
    labVariant: "acid-pump",
    bodyTarget: {
      organ: "Stomach",
      action: "PPI-style pump timing before a meal",
      route: ["tablet", "drug ready", "stomach wall", "active pumps"],
    },
    doseWindow: {
      minHour: 5,
      maxHour: 22,
      defaultHour: 7,
      presets: [
        { label: "Before breakfast", hour: 7 },
        { label: "Before dinner", hour: 18 },
        { label: "Bedtime", hour: 22 },
      ],
    },
    exposureProfiles: [
      {
        id: "first-meal",
        label: "First-meal prep",
        halfLifeHours: 5,
        peakHours: 0.75,
        tailHours: 9,
        copy: "The first-meal model treats the pump window after fasting as the clearest timing target.",
      },
      {
        id: "later-meal",
        label: "Later-meal comparison",
        halfLifeHours: 4,
        peakHours: 1.2,
        tailHours: 9,
        copy: "The later-meal comparison lowers pump availability to show why the first meal after fasting is visually different.",
      },
    ],
    targetRhythm: {
      label: "First-meal pump activation",
      peakHour: 8,
      widthHours: 4,
      baseline: 0.12,
      amplitude: 0.86,
      copy: "For a PPI-style example, the target is active stomach-wall pumps around the first meal after fasting.",
    },
    overlapLabel: "Projected pump-window readiness",
    interpretation: {
      low: "Low pump-window readiness in this simplified model: the dose is not ready before many pumps activate.",
      medium:
        "Moderate pump-window readiness in this simplified model: some drug is ready near the pump window.",
      high: "Higher pump-window readiness in this simplified model: drug presence is ready before more meal-triggered pumps activate.",
    },
    sources: ["smith-2019"],
    safetyCaveat:
      "Reflux medication timing differs by drug class and label; this site is educational.",
    labelCue: "Often timed before the first meal in educational examples.",
    whyTimingAppears:
      "For some proton-pump inhibitor labels, timing is tied to active stomach pumps around the first meal after fasting.",
    morningLens:
      "Before breakfast can place the drug before a concentrated first-meal pump window in this PPI-style example.",
    eveningLens:
      "Later timing is useful as a comparison because the first-meal pump window may already have passed.",
    sourceId: "smith-2019",
  },
  {
    name: "ADHD medicines",
    icon: Brain,
    visualMode: "interactive",
    labVariant: "day-runway",
    bodyTarget: {
      organ: "Brain / wake systems",
      action: "Daytime focus with sleep-side-effect boundary",
      route: ["capsule", "bloodstream", "brain", "wakefulness window"],
    },
    doseWindow: {
      minHour: 5,
      maxHour: 20,
      defaultHour: 8,
      presets: [
        { label: "Morning", hour: 8 },
        { label: "Midday", hour: 12 },
        { label: "Evening", hour: 18 },
      ],
    },
    exposureProfiles: [
      {
        id: "shorter",
        label: "Shorter effect",
        halfLifeHours: 4,
        peakHours: 3,
        tailHours: 13,
        copy: "The shorter-effect model fades earlier, making the sleep-boundary crossing easier to see.",
      },
      {
        id: "longer",
        label: "Longer effect",
        halfLifeHours: 7,
        peakHours: 4,
        tailHours: 18,
        copy: "The longer-effect model stretches farther into the evening in this simplified view.",
      },
    ],
    targetRhythm: {
      label: "Wakefulness versus sleep boundary",
      peakHour: 13,
      widthHours: 8,
      baseline: 0.18,
      amplitude: 0.7,
      copy: "The visual treats alerting effect as helpful in the daytime lane and increasingly awkward near the sleep boundary.",
    },
    overlapLabel: "Projected daytime alignment",
    interpretation: {
      low: "Low daytime coverage in this simplified model: the effect misses much of the daytime lane.",
      medium:
        "Moderate daytime coverage in this simplified model: useful effect and sleep boundary are both in view.",
      high: "Higher daytime coverage in this simplified model: effect sits mostly in the daytime lane.",
    },
    sources: ["smith-2019"],
    safetyCaveat:
      "ADHD medication timing depends on product formulation, symptoms, side effects, and prescriber guidance.",
    labelCue:
      "Morning use can reduce insomnia risk for some stimulant medicines.",
    whyTimingAppears:
      "A useful daytime effect can become a nighttime side effect if alerting action persists.",
    morningLens:
      "Morning dosing is a common strategy to keep wake-promoting effects away from bedtime.",
    eveningLens:
      "Evening dosing can be problematic for products that interfere with sleep.",
    sourceId: "smith-2019",
  },
  {
    name: "Sleep aids",
    icon: Moon,
    visualMode: "interactive",
    labVariant: "night-window",
    bodyTarget: {
      organ: "Sleep systems",
      action: "Desired sleep-window alignment",
      route: ["tablet", "bloodstream", "brain", "sleep window"],
    },
    doseWindow: {
      minHour: 18,
      maxHour: 23,
      defaultHour: 22,
      presets: [
        { label: "Evening", hour: 20 },
        { label: "Bedtime", hour: 22 },
        { label: "Late night", hour: 23 },
      ],
    },
    exposureProfiles: [
      {
        id: "shorter-tail",
        label: "Shorter tail",
        halfLifeHours: 3,
        peakHours: 1,
        tailHours: 8,
        copy: "The shorter-tail model concentrates effect near the intended sleep window.",
      },
      {
        id: "longer-tail",
        label: "Longer tail",
        halfLifeHours: 6,
        peakHours: 1.5,
        tailHours: 13,
        copy: "The longer-tail model makes next-morning residue more visible.",
      },
    ],
    targetRhythm: {
      label: "Intended sleep window",
      peakHour: 23,
      widthHours: 7,
      baseline: 0.08,
      amplitude: 0.88,
      copy: "The visual treats the intended sleep window as the target and the morning zone as residue to notice.",
    },
    overlapLabel: "Projected sleep-window alignment",
    interpretation: {
      low: "Low sleep-window alignment in this simplified model: the effect lands outside much of the intended sleep window.",
      medium:
        "Moderate sleep-window alignment in this simplified model: some effect lands in the sleep window.",
      high: "Higher sleep-window alignment in this simplified model: effect arrives close to the intended sleep window.",
    },
    sources: ["smith-2019"],
    safetyCaveat:
      "Sleep-aid timing and next-day impairment warnings depend on the exact product label.",
    labelCue: "The simple case: take before the intended sleep window.",
    whyTimingAppears: "The target effect is explicitly tied to sleep timing.",
    morningLens:
      "Morning use would usually conflict with the desired sleep window.",
    eveningLens:
      "Evening use is aligned with intended sleep for products whose labels say so.",
    sourceId: "smith-2019",
  },
];

export const geneCards: GeneCard[] = [
  {
    gene: "CLOCK / BMAL1",
    title: "The transcriptional metronome",
    tissue: "Core clock",
    phaseHour: 10,
    amplitude: 0.85,
    copy: "CLOCK and BMAL1 help drive the molecular loop that lets cells keep approximate daily time.",
    evidence: "Curated primer example",
  },
  {
    gene: "PER / CRY",
    title: "The feedback brake",
    tissue: "Core clock",
    phaseHour: 22,
    amplitude: 0.8,
    copy: "PER and CRY proteins feed back onto the clock loop, helping create an oscillation rather than a flat signal.",
    evidence: "Curated primer example",
  },
  {
    gene: "CYP3A4",
    title: "Drug metabolism window",
    tissue: "Liver",
    phaseHour: 15,
    amplitude: 0.7,
    copy: "CYP3A4 is a major drug-metabolizing enzyme family member, making liver timing relevant to pharmacology.",
    evidence: "Chronopharmacology example",
  },
  {
    gene: "BMAL1",
    title: "Clock meets inflammation",
    tissue: "Immune cells",
    phaseHour: 7,
    amplitude: 0.65,
    copy: "BMAL1 appears in many discussions connecting clock state with immune and inflammatory behavior.",
    evidence: "Curated biology bridge",
  },
  {
    gene: "NLRP3 axis",
    title: "Rhythmic inflammatory tone",
    tissue: "Innate immunity",
    phaseHour: 19,
    amplitude: 0.6,
    copy: "The NLRP3 inflammasome axis is a useful example for showing that immune pathways can have daily structure.",
    evidence: "Emerging explainer example",
  },
];

export const circadianDataSources: CircadianDataSource[] = [
  {
    id: "circakb",
    name: "CircaKB",
    purpose:
      "Rhythmic expression evidence across 226 time-course transcriptome datasets, 54 tissues, 15 species, and multiple computational models.",
    status:
      "Used in v1 as source attribution and link-out; designed for v2 import/download pipeline.",
    url: "https://cdsic.njau.edu.cn/CircaKB/",
  },
  {
    id: "circadb",
    name: "CIRCA / CircaDB",
    purpose:
      "Mammalian circadian transcriptional profiles from mouse and human time-course experiments.",
    status: "Used in v1 as source attribution and gene-level link-out.",
    url: "https://circadb.hogeneschlab.org/",
  },
  {
    id: "cgdb",
    name: "CGDB",
    purpose:
      "Large circadian-gene database across animals, plants, and fungi, including experimentally validated and predicted circadian genes.",
    status: "Used in v1 for broad circadian-gene database attribution.",
    url: "https://cgdb.biocuckoo.org/",
  },
  {
    id: "reactome",
    name: "Reactome Circadian Clock",
    purpose:
      "Human pathway relationships for BMAL1:CLOCK activation and feedback-loop regulation.",
    status:
      "Used in v1 to curate activation, repression, and regulation edges.",
    url: "https://reactome.org/content/detail/R-HSA-9931510",
  },
  {
    id: "ncbi-uniprot",
    name: "NCBI Gene + UniProt",
    purpose:
      "Authoritative gene/protein pages for symbols, identifiers, chromosomal locations, and protein records.",
    status: "Every player card links out to both resources.",
    url: "https://www.ncbi.nlm.nih.gov/gene/",
  },
];

const circaSearch = (symbol: string) =>
  `https://cdsic.njau.edu.cn/CircaKB/#/search?keyword=${symbol}`;

const circaDbSearch = (symbol: string) =>
  `https://circadb.hogeneschlab.org/search?q=${symbol}`;

export const clockGeneNodes: ClockGeneNode[] = [
  {
    id: "ARNTL",
    symbol: "ARNTL",
    aliases: ["BMAL1", "MOP3"],
    category: "corePositive",
    chromosome: "11p15.2",
    x: 42,
    y: 22,
    title: "Positive arm partner",
    description:
      "ARNTL/BMAL1 pairs with CLOCK or NPAS2 to bind E-box elements and activate the next wave of clock and clock-controlled genes.",
    expressionPattern:
      "Rhythmic transcript with tissue-specific phase; often interpreted as a central positive-loop component.",
    peakTime: "Morning to midday in many curated examples",
    tissues: ["SCN", "liver", "heart", "skeletal muscle", "immune cells"],
    diseaseAssociations: [
      {
        disease: "Sleep/circadian disruption",
        mechanism:
          "Changes in BMAL1 function can weaken the transcriptional feedback loop that organizes cellular time.",
        sources: ["NCBI core clock table", "Reactome", "CircaKB"],
      },
      {
        disease: "Metabolic and inflammatory phenotypes",
        mechanism:
          "BMAL1 connects clock timing to metabolic and immune transcriptional programs.",
        sources: ["Reactome", "CircaDB/CIRCA"],
      },
    ],
    externalLinks: {
      ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/406",
      uniProt: "https://www.uniprot.org/uniprotkb/O00327/entry",
      circaKb: circaSearch("ARNTL"),
      circaDb: circaDbSearch("ARNTL"),
    },
    sources: ["reactome-clock", "ncbi-clock-table", "circakb", "circadb"],
  },
  {
    id: "CLOCK",
    symbol: "CLOCK",
    aliases: ["KAT13D"],
    category: "corePositive",
    chromosome: "4q12",
    x: 58,
    y: 22,
    title: "Positive arm transcription factor",
    description:
      "CLOCK forms the canonical heterodimer with BMAL1, activating PER, CRY, REV-ERB/ROR loop genes, DBP, and many output genes.",
    expressionPattern:
      "Broadly expressed clock component; activity is rhythmic through partners, feedback, and post-translational state.",
    peakTime: "Day-active transcriptional program",
    tissues: ["brain", "liver", "heart", "kidney", "adipose"],
    diseaseAssociations: [
      {
        disease: "Sleep timing and chronotype traits",
        mechanism:
          "CLOCK variation can affect phase, period, or sleep timing traits in human studies.",
        sources: ["NCBI core clock table", "Reactome"],
      },
      {
        disease: "Metabolic risk",
        mechanism:
          "CLOCK participates in transcriptional programs tied to feeding, energy balance, and metabolism.",
        sources: ["Reactome", "CircaKB"],
      },
    ],
    externalLinks: {
      ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/9575",
      uniProt: "https://www.uniprot.org/uniprotkb/O15516/entry",
      circaKb: circaSearch("CLOCK"),
      circaDb: circaDbSearch("CLOCK"),
    },
    sources: ["reactome-clock", "ncbi-clock-table", "circakb"],
  },
  {
    id: "NPAS2",
    symbol: "NPAS2",
    aliases: ["MOP4"],
    category: "corePositive",
    chromosome: "2q11.2",
    x: 50,
    y: 10,
    title: "CLOCK paralog",
    description:
      "NPAS2 can substitute for CLOCK in some contexts, especially in forebrain-linked clock regulation.",
    expressionPattern:
      "Tissue-enriched positive-loop component with rhythmic regulation in selected datasets.",
    peakTime: "Dataset and tissue dependent",
    tissues: ["forebrain", "SCN-associated circuits", "liver"],
    diseaseAssociations: [
      {
        disease: "Sleep and mood traits",
        mechanism:
          "As a CLOCK paralog, NPAS2 can shift the strength or context of positive-loop transcription.",
        sources: ["NCBI core clock table", "Reactome"],
      },
    ],
    externalLinks: {
      ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/4862",
      uniProt: "https://www.uniprot.org/uniprotkb/Q99743/entry",
      circaKb: circaSearch("NPAS2"),
      circaDb: circaDbSearch("NPAS2"),
    },
    sources: ["reactome-clock", "ncbi-clock-table", "circakb"],
  },
  {
    id: "PER1",
    symbol: "PER1",
    aliases: ["RIGUI"],
    category: "coreNegative",
    chromosome: "17p13.1",
    x: 30,
    y: 58,
    title: "Negative feedback period gene",
    description:
      "PER1 is activated by BMAL1:CLOCK and later contributes to repression of the same positive complex.",
    expressionPattern:
      "Strong rhythmic transcript in many clock datasets; phase often follows daytime E-box activation.",
    peakTime: "Afternoon to evening in many mammalian datasets",
    tissues: ["SCN", "liver", "heart", "blood", "fibroblasts"],
    diseaseAssociations: [
      {
        disease: "Circadian rhythm sleep-wake disorders",
        mechanism:
          "PER-family changes can alter period length, phase timing, or feedback-loop stability.",
        sources: ["Reactome", "NCBI core clock table", "CircaKB"],
      },
    ],
    externalLinks: {
      ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/5187",
      uniProt: "https://www.uniprot.org/uniprotkb/O15534/entry",
      circaKb: circaSearch("PER1"),
      circaDb: circaDbSearch("PER1"),
    },
    sources: ["reactome-clock", "circakb", "circadb"],
  },
  {
    id: "PER2",
    symbol: "PER2",
    aliases: ["FASPS"],
    category: "coreNegative",
    chromosome: "2q37.3",
    x: 42,
    y: 72,
    title: "Period-length anchor",
    description:
      "PER2 is a core negative-loop component whose timing and stability are central to circadian period and phase.",
    expressionPattern:
      "Rhythmic in many tissues; used frequently as a phase marker in experimental systems.",
    peakTime: "Evening to early night in many mammalian datasets",
    tissues: ["SCN", "liver", "heart", "kidney", "skin"],
    diseaseAssociations: [
      {
        disease: "Familial advanced sleep phase",
        mechanism:
          "PER2 phosphorylation/stability changes can shift circadian phase earlier.",
        sources: ["NCBI core clock table", "Reactome"],
      },
      {
        disease: "Cancer biology",
        mechanism:
          "PER2 connects circadian timing with cell-cycle and DNA-damage programs in several studies.",
        sources: ["CGDB", "CircaKB"],
      },
    ],
    externalLinks: {
      ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/8864",
      uniProt: "https://www.uniprot.org/uniprotkb/O15055/entry",
      circaKb: circaSearch("PER2"),
      circaDb: circaDbSearch("PER2"),
    },
    sources: ["reactome-clock", "ncbi-clock-table", "cgdb", "circakb"],
  },
  {
    id: "PER3",
    symbol: "PER3",
    aliases: ["GIG13"],
    category: "coreNegative",
    chromosome: "1p36.23",
    x: 18,
    y: 68,
    title: "Sleep-timing modulator",
    description:
      "PER3 is part of the Period family and is often discussed in human sleep timing and vulnerability contexts.",
    expressionPattern:
      "Rhythmic in selected tissues with phase and amplitude varying by dataset.",
    peakTime: "Tissue dependent",
    tissues: ["brain", "blood", "skin", "peripheral tissues"],
    diseaseAssociations: [
      {
        disease: "Sleep homeostasis and shift-work vulnerability",
        mechanism:
          "PER3 variation has been linked to differences in sleep timing and response to circadian challenge.",
        sources: ["NCBI core clock table", "CGDB"],
      },
    ],
    externalLinks: {
      ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/8863",
      uniProt: "https://www.uniprot.org/uniprotkb/P56645/entry",
      circaKb: circaSearch("PER3"),
      circaDb: circaDbSearch("PER3"),
    },
    sources: ["ncbi-clock-table", "cgdb", "circakb"],
  },
  {
    id: "CRY1",
    symbol: "CRY1",
    aliases: ["PHLL1"],
    category: "coreNegative",
    chromosome: "12q23.3",
    x: 58,
    y: 72,
    title: "Cryptochrome repressor",
    description:
      "CRY1 joins PER proteins to repress BMAL1:CLOCK-driven transcription and close the primary feedback loop.",
    expressionPattern:
      "Rhythmic in many datasets; CircaKB highlights CRY1 as a cross-dataset search example.",
    peakTime: "Evening/night in many curated examples",
    tissues: ["heart", "retina", "liver", "brain", "blood"],
    diseaseAssociations: [
      {
        disease: "Delayed sleep phase traits",
        mechanism:
          "CRY1 variants can strengthen or prolong repression, shifting circadian phase later in some contexts.",
        sources: ["Reactome", "CircaKB"],
      },
    ],
    externalLinks: {
      ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/1407",
      uniProt: "https://www.uniprot.org/uniprotkb/Q16526/entry",
      circaKb: circaSearch("CRY1"),
      circaDb: circaDbSearch("CRY1"),
    },
    sources: ["reactome-clock", "circakb", "circadb"],
  },
  {
    id: "CRY2",
    symbol: "CRY2",
    aliases: ["HCRY2"],
    category: "coreNegative",
    chromosome: "11p11.2",
    x: 72,
    y: 60,
    title: "Cryptochrome partner",
    description:
      "CRY2 participates in the negative limb and helps tune the timing and strength of transcriptional repression.",
    expressionPattern:
      "Rhythmic evidence is dataset-dependent, with broad expression across peripheral tissues.",
    peakTime: "Tissue dependent",
    tissues: ["brain", "liver", "heart", "kidney", "blood"],
    diseaseAssociations: [
      {
        disease: "Metabolic and sleep traits",
        mechanism:
          "CRY-family regulation connects clock phase with endocrine and metabolic timing in human studies.",
        sources: ["Reactome", "CGDB"],
      },
    ],
    externalLinks: {
      ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/1408",
      uniProt: "https://www.uniprot.org/uniprotkb/Q49AN0/entry",
      circaKb: circaSearch("CRY2"),
      circaDb: circaDbSearch("CRY2"),
    },
    sources: ["reactome-clock", "cgdb", "circakb"],
  },
  {
    id: "NR1D1",
    symbol: "NR1D1",
    aliases: ["REV-ERBA", "REV-ERB alpha"],
    category: "secondaryLoop",
    chromosome: "17q21.1",
    x: 22,
    y: 34,
    title: "Secondary-loop repressor",
    description:
      "NR1D1/REV-ERB alpha is activated by BMAL1:CLOCK and represses ARNTL/BMAL1-linked transcription through RORE/RRE elements.",
    expressionPattern:
      "Rhythmic nuclear receptor with strong tissue-specific amplitude in metabolic tissues.",
    peakTime: "Daytime in many mammalian tissues",
    tissues: ["liver", "adipose", "muscle", "brain", "immune cells"],
    diseaseAssociations: [
      {
        disease: "Metabolic inflammation",
        mechanism:
          "REV-ERB signaling links circadian timing with lipid metabolism and inflammatory transcriptional programs.",
        sources: ["Reactome", "CircaKB"],
      },
    ],
    externalLinks: {
      ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/9572",
      uniProt: "https://www.uniprot.org/uniprotkb/P20393/entry",
      circaKb: circaSearch("NR1D1"),
      circaDb: circaDbSearch("NR1D1"),
    },
    sources: ["reactome-clock", "ncbi-clock-table", "circakb"],
  },
  {
    id: "NR1D2",
    symbol: "NR1D2",
    aliases: ["REV-ERBB", "REV-ERB beta"],
    category: "secondaryLoop",
    chromosome: "3p24.2",
    x: 16,
    y: 46,
    title: "REV-ERB partner",
    description:
      "NR1D2 reinforces REV-ERB-mediated repression within the secondary loop, helping stabilize the clock network.",
    expressionPattern:
      "Rhythmic nuclear receptor with context-dependent amplitude.",
    peakTime: "Daytime in selected datasets",
    tissues: ["liver", "brain", "muscle", "adipose"],
    diseaseAssociations: [
      {
        disease: "Metabolic and inflammatory regulation",
        mechanism:
          "REV-ERB beta contributes to the same nuclear-receptor timing layer as NR1D1.",
        sources: ["Reactome", "CGDB"],
      },
    ],
    externalLinks: {
      ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/9975",
      uniProt: "https://www.uniprot.org/uniprotkb/Q14995/entry",
      circaKb: circaSearch("NR1D2"),
      circaDb: circaDbSearch("NR1D2"),
    },
    sources: ["reactome-clock", "cgdb", "circakb"],
  },
  {
    id: "RORA",
    symbol: "RORA",
    aliases: ["ROR alpha"],
    category: "secondaryLoop",
    chromosome: "15q22.2",
    x: 78,
    y: 34,
    title: "Secondary-loop activator",
    description:
      "RORA competes at RORE/RRE elements and activates BMAL1-linked transcription, opposing REV-ERB repression.",
    expressionPattern:
      "Rhythmic nuclear receptor with tissue-specific expression, especially in neural and metabolic contexts.",
    peakTime: "Tissue dependent",
    tissues: ["brain", "liver", "immune cells", "muscle"],
    diseaseAssociations: [
      {
        disease: "Neurodevelopmental and immune phenotypes",
        mechanism:
          "ROR signaling connects circadian transcription with neuronal and immune regulatory programs.",
        sources: ["Reactome", "CGDB"],
      },
    ],
    externalLinks: {
      ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/6095",
      uniProt: "https://www.uniprot.org/uniprotkb/P35398/entry",
      circaKb: circaSearch("RORA"),
      circaDb: circaDbSearch("RORA"),
    },
    sources: ["reactome-clock", "ncbi-clock-table", "cgdb", "circakb"],
  },
  {
    id: "RORB",
    symbol: "RORB",
    aliases: ["ROR beta"],
    category: "secondaryLoop",
    chromosome: "9q21.13",
    x: 84,
    y: 46,
    title: "Neural ROR loop factor",
    description:
      "RORB is a ROR-family activator with more restricted tissue distribution than RORA/RORC.",
    expressionPattern:
      "Often enriched in neural tissues; rhythmicity depends strongly on tissue and dataset.",
    peakTime: "Dataset dependent",
    tissues: ["brain", "retina", "brown adipose"],
    diseaseAssociations: [
      {
        disease: "Neural timing traits",
        mechanism:
          "RORB may tune clock-controlled transcription in selected neural circuits.",
        sources: ["Reactome", "CircaKB"],
      },
    ],
    externalLinks: {
      ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/6096",
      uniProt: "https://www.uniprot.org/uniprotkb/Q92753/entry",
      circaKb: circaSearch("RORB"),
      circaDb: circaDbSearch("RORB"),
    },
    sources: ["reactome-clock", "circakb"],
  },
  {
    id: "RORC",
    symbol: "RORC",
    aliases: ["ROR gamma", "RORGT"],
    category: "secondaryLoop",
    chromosome: "1q21.3",
    x: 90,
    y: 58,
    title: "Immune-linked ROR loop factor",
    description:
      "RORC participates in the ROR activator family and is especially useful for connecting clocks with immune differentiation.",
    expressionPattern:
      "Rhythmicity and expression are strongly tissue and immune-cell-state dependent.",
    peakTime: "Dataset dependent",
    tissues: ["immune cells", "thymus", "lymphoid tissues"],
    diseaseAssociations: [
      {
        disease: "Inflammatory and autoimmune biology",
        mechanism:
          "RORC/ROR gamma t biology connects transcriptional timing with T-cell inflammatory programs.",
        sources: ["Reactome", "CGDB"],
      },
    ],
    externalLinks: {
      ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/6097",
      uniProt: "https://www.uniprot.org/uniprotkb/P51449/entry",
      circaKb: circaSearch("RORC"),
      circaDb: circaDbSearch("RORC"),
    },
    sources: ["reactome-clock", "cgdb", "circakb"],
  },
  {
    id: "DBP",
    symbol: "DBP",
    aliases: ["D-box binding PAR bZIP"],
    category: "accessoryRegulator",
    chromosome: "19q13.33",
    x: 50,
    y: 88,
    title: "Clock output amplifier",
    description:
      "DBP is activated by BMAL1:CLOCK and helps drive D-box output genes, linking core timing to downstream physiology.",
    expressionPattern: "Strong rhythmic output transcript in many tissues.",
    peakTime: "Day to early evening in many mammalian tissues",
    tissues: ["liver", "kidney", "heart", "brain"],
    diseaseAssociations: [
      {
        disease: "Metabolic and xenobiotic handling",
        mechanism:
          "DBP-family output programs influence detoxification and metabolic timing.",
        sources: ["Reactome", "CircaKB"],
      },
    ],
    externalLinks: {
      ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/1628",
      uniProt: "https://www.uniprot.org/uniprotkb/Q10586/entry",
      circaKb: circaSearch("DBP"),
      circaDb: circaDbSearch("DBP"),
    },
    sources: ["reactome-clock", "circakb", "circadb"],
  },
  {
    id: "NFIL3",
    symbol: "NFIL3",
    aliases: ["E4BP4"],
    category: "accessoryRegulator",
    chromosome: "9q22.31",
    x: 36,
    y: 88,
    title: "D-box repressive counterweight",
    description:
      "NFIL3/E4BP4 often acts opposite DBP-like activators at D-box elements, helping sculpt clock output rhythms.",
    expressionPattern:
      "Rhythmic accessory regulator with strong immune and metabolic relevance.",
    peakTime: "Often anti-phase to DBP-like output in model diagrams",
    tissues: ["immune cells", "liver", "gut", "brain"],
    diseaseAssociations: [
      {
        disease: "Immune regulation and gut biology",
        mechanism:
          "NFIL3 links circadian timing to immune-cell differentiation and intestinal programs.",
        sources: ["NCBI core clock table", "CGDB"],
      },
    ],
    externalLinks: {
      ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/4783",
      uniProt: "https://www.uniprot.org/uniprotkb/Q16649/entry",
      circaKb: circaSearch("NFIL3"),
      circaDb: circaDbSearch("NFIL3"),
    },
    sources: ["ncbi-clock-table", "cgdb", "circakb"],
  },
  {
    id: "CSNK1D",
    symbol: "CSNK1D",
    aliases: ["CK1 delta"],
    category: "accessoryRegulator",
    chromosome: "17q25.3",
    x: 24,
    y: 82,
    title: "Post-translational timer",
    description:
      "Casein kinase 1 delta phosphorylates PER/CRY-related clock proteins, changing stability, localization, and period timing.",
    expressionPattern:
      "Regulatory enzyme; clock effect is often post-translational rather than simply expression amplitude.",
    peakTime: "Activity and target-state dependent",
    tissues: ["broad"],
    diseaseAssociations: [
      {
        disease: "Sleep phase disorders",
        mechanism:
          "Kinase-driven PER phosphorylation can alter clock speed and phase.",
        sources: ["NCBI core clock table", "CGDB"],
      },
    ],
    externalLinks: {
      ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/1453",
      uniProt: "https://www.uniprot.org/uniprotkb/P48730/entry",
      circaKb: circaSearch("CSNK1D"),
      circaDb: circaDbSearch("CSNK1D"),
    },
    sources: ["ncbi-clock-table", "cgdb"],
  },
  {
    id: "CSNK1E",
    symbol: "CSNK1E",
    aliases: ["CK1 epsilon"],
    category: "accessoryRegulator",
    chromosome: "22q13.1",
    x: 76,
    y: 82,
    title: "Period tuning kinase",
    description:
      "Casein kinase 1 epsilon phosphorylates clock proteins and helps determine period length and phase dynamics.",
    expressionPattern:
      "Regulatory enzyme with broad expression; effects depend on substrates and phosphorylation state.",
    peakTime: "Activity and target-state dependent",
    tissues: ["broad"],
    diseaseAssociations: [
      {
        disease: "Circadian period and sleep timing",
        mechanism:
          "CSNK1E-mediated phosphorylation tunes PER/CRY timing and feedback-loop speed.",
        sources: ["NCBI core clock table", "CGDB"],
      },
    ],
    externalLinks: {
      ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/1454",
      uniProt: "https://www.uniprot.org/uniprotkb/P49674/entry",
      circaKb: circaSearch("CSNK1E"),
      circaDb: circaDbSearch("CSNK1E"),
    },
    sources: ["ncbi-clock-table", "cgdb"],
  },
  {
    id: "BHLHE40",
    symbol: "BHLHE40",
    aliases: ["DEC1", "SHARP2"],
    category: "accessoryRegulator",
    chromosome: "3p26.1",
    x: 8,
    y: 58,
    title: "E-box suppressor",
    description:
      "BHLHE40/DEC1 is activated by BMAL1:CLOCK and can suppress E-box-driven PER/CRY transcription.",
    expressionPattern:
      "Rhythmic accessory regulator with stress and hypoxia responsiveness.",
    peakTime: "Dataset dependent",
    tissues: ["immune cells", "liver", "muscle", "epithelia"],
    diseaseAssociations: [
      {
        disease: "Inflammation and cancer biology",
        mechanism:
          "DEC-family factors connect clock output with stress, immune, and proliferation programs.",
        sources: ["NCBI core clock table", "CGDB"],
      },
    ],
    externalLinks: {
      ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/8553",
      uniProt: "https://www.uniprot.org/uniprotkb/O14503/entry",
      circaKb: circaSearch("BHLHE40"),
      circaDb: circaDbSearch("BHLHE40"),
    },
    sources: ["ncbi-clock-table", "cgdb", "circakb"],
  },
  {
    id: "BHLHE41",
    symbol: "BHLHE41",
    aliases: ["DEC2", "SHARP1"],
    category: "accessoryRegulator",
    chromosome: "12p12.1",
    x: 92,
    y: 68,
    title: "DEC-family clock regulator",
    description:
      "BHLHE41/DEC2 is another E-box-linked suppressor that can shape sleep and clock-output phenotypes.",
    expressionPattern:
      "Context-dependent rhythmic expression; often treated as an accessory clock regulator.",
    peakTime: "Dataset dependent",
    tissues: ["brain", "immune cells", "epithelia"],
    diseaseAssociations: [
      {
        disease: "Short sleep phenotype",
        mechanism:
          "BHLHE41/DEC2 variants have been linked to altered sleep duration in human reports.",
        sources: ["NCBI core clock table", "CGDB"],
      },
    ],
    externalLinks: {
      ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/79365",
      uniProt: "https://www.uniprot.org/uniprotkb/Q9C0J9/entry",
      circaKb: circaSearch("BHLHE41"),
      circaDb: circaDbSearch("BHLHE41"),
    },
    sources: ["ncbi-clock-table", "cgdb"],
  },
  {
    id: "FBXL3",
    symbol: "FBXL3",
    aliases: ["FBL3"],
    category: "accessoryRegulator",
    chromosome: "13q22.3",
    x: 66,
    y: 88,
    title: "CRY stability regulator",
    description:
      "FBXL3 targets CRY proteins for ubiquitin-mediated degradation, helping control repression duration.",
    expressionPattern:
      "Accessory regulator; clock effect is primarily protein stability control.",
    peakTime: "Target-state dependent",
    tissues: ["broad"],
    diseaseAssociations: [
      {
        disease: "Clock period regulation",
        mechanism:
          "Changing CRY stability changes the length and strength of negative feedback.",
        sources: ["CGDB", "Reactome"],
      },
    ],
    externalLinks: {
      ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/26224",
      uniProt: "https://www.uniprot.org/uniprotkb/Q9UKT7/entry",
      circaKb: circaSearch("FBXL3"),
      circaDb: circaDbSearch("FBXL3"),
    },
    sources: ["cgdb", "reactome-clock"],
  },
  {
    id: "TIMELESS",
    symbol: "TIMELESS",
    aliases: ["TIM"],
    category: "accessoryRegulator",
    chromosome: "12q13.3",
    x: 50,
    y: 56,
    title: "Clock and genome-stability bridge",
    description:
      "TIMELESS is listed among selected mammalian clock-related genes and links timing biology with cell-cycle and genome-maintenance processes.",
    expressionPattern: "Rhythmicity varies by tissue and cell-cycle context.",
    peakTime: "Dataset dependent",
    tissues: ["proliferating tissues", "immune cells", "epithelia"],
    diseaseAssociations: [
      {
        disease: "Cancer and genome stability",
        mechanism:
          "TIMELESS participates in clock-associated feedback and DNA replication/checkpoint biology.",
        sources: ["NCBI core clock table", "CGDB"],
      },
    ],
    externalLinks: {
      ncbiGene: "https://www.ncbi.nlm.nih.gov/gene/8914",
      uniProt: "https://www.uniprot.org/uniprotkb/Q9UNS1/entry",
      circaKb: circaSearch("TIMELESS"),
      circaDb: circaDbSearch("TIMELESS"),
    },
    sources: ["ncbi-clock-table", "cgdb"],
  },
  {
    id: "ORGAN_LIVER",
    symbol: "Liver",
    aliases: ["Hepatic system"],
    category: "organSystem",
    chromosome: "N/A",
    x: 80,
    y: 80,
    title: "Hepatic Circadian Output",
    description:
      "The liver is a major peripheral oscillator, driven by the central clock but also entrained heavily by feeding behavior.",
    expressionPattern: "Organ-level rhythmic metabolic regulation",
    peakTime: "Variable by feeding schedule",
    tissues: ["Liver"],
    diseaseAssociations: [
      {
        disease: "Metabolic Syndrome",
        mechanism:
          "Desynchronization between the liver clock and the SCN can drive metabolic dysfunction.",
        sources: ["Circadian Medicine"],
      },
    ],
    externalLinks: {
      ncbiGene: "",
      uniProt: "",
      circaKb: "",
      circaDb: "",
    },
    sources: ["general-biology"],
  },
  {
    id: "DBP_OUTPUT",
    symbol: "D-box outputs",
    aliases: ["DBP-regulated output genes", "D-box output layer"],
    category: "downstreamTarget",
    chromosome: "multiple loci",
    x: 20,
    y: 80,
    title: "DBP-regulated output layer",
    description:
      "A simplified downstream layer representing genes and pathways shaped by DBP-family D-box regulation.",
    expressionPattern:
      "Rhythmic output programs vary by tissue and downstream target.",
    peakTime: "Often follows upstream DBP-family activity",
    tissues: ["liver", "kidney", "brain"],
    diseaseAssociations: [
      {
        disease: "Sleep and metabolic rhythm disruption",
        mechanism:
          "Clock-output programs can connect transcriptional timing to sleep consolidation, detoxification, and metabolic physiology.",
        sources: ["NCBI core clock table", "Reactome"],
      },
    ],
    externalLinks: {
      ncbiGene: "",
      uniProt: "",
      circaKb: "",
      circaDb: "",
    },
    sources: ["ncbi-clock-table", "reactome-clock"],
  },
];

export const clockGeneEdges: ClockGeneEdge[] = [
  {
    id: "CLOCK-ARNTL",
    source: "CLOCK",
    target: "ARNTL",
    type: "regulation",
    label: "heterodimer",
    description: "CLOCK and BMAL1 form the positive transcriptional complex.",
    sources: ["reactome-clock", "ncbi-clock-table"],
    pdbId: "4F3L",
  },
  {
    id: "NPAS2-ARNTL",
    source: "NPAS2",
    target: "ARNTL",
    type: "regulation",
    label: "alternative heterodimer",
    description:
      "NPAS2 can partner with BMAL1 as a CLOCK-like positive-loop factor.",
    sources: ["reactome-clock", "ncbi-clock-table"],
  },
  ...[
    "PER1",
    "PER2",
    "PER3",
    "CRY1",
    "CRY2",
    "NR1D1",
    "RORA",
    "RORC",
    "DBP",
    "BHLHE40",
  ].map((target) => ({
    id: `ARNTL-CLOCK-${target}`,
    source: "ARNTL",
    target,
    type: "activation" as ClockEdgeType,
    label: "E-box activation",
    description:
      "BMAL1:CLOCK activates transcription of core clock and clock-output genes.",
    sources: ["reactome-clock"],
  })),
  ...["ARNTL", "CLOCK", "NPAS2"].flatMap((target) =>
    ["PER1", "PER2", "CRY1", "CRY2"].map((source) => ({
      id: `${source}-represses-${target}`,
      source,
      target,
      type: "repression" as ClockEdgeType,
      label: "feedback repression",
      description:
        "PER/CRY complexes repress the positive transcriptional arm.",
      sources: ["reactome-clock", "ncbi-clock-table"],
    })),
  ),
  ...["ARNTL", "NPAS2", "NFIL3"].flatMap((target) =>
    ["NR1D1", "NR1D2"].map((source) => ({
      id: `${source}-represses-${target}`,
      source,
      target,
      type: "repression" as ClockEdgeType,
      label: "RORE repression",
      description:
        "REV-ERB nuclear receptors repress secondary-loop target genes.",
      sources: ["reactome-clock"],
    })),
  ),
  ...["ARNTL", "NPAS2", "NFIL3"].flatMap((target) =>
    ["RORA", "RORB", "RORC"].map((source) => ({
      id: `${source}-activates-${target}`,
      source,
      target,
      type: "activation" as ClockEdgeType,
      label: "RORE activation",
      description:
        "ROR nuclear receptors activate secondary-loop target genes.",
      sources: ["reactome-clock"],
    })),
  ),
  ...["PER1", "PER2", "PER3", "CRY1", "CRY2", "ARNTL"].flatMap((target) =>
    ["CSNK1D", "CSNK1E"].map((source) => ({
      id: `${source}-phosphorylates-${target}`,
      source,
      target,
      type: "phosphorylation" as ClockEdgeType,
      label: "phosphorylation",
      description:
        "Casein kinase 1 family members phosphorylate clock proteins and tune stability/localization.",
      sources: ["ncbi-clock-table"],
    })),
  ),
  ...["CRY1", "CRY2"].map((target) => ({
    id: `FBXL3-regulates-${target}`,
    source: "FBXL3",
    target,
    type: "regulation" as ClockEdgeType,
    label: "protein stability",
    description:
      "FBXL3 regulates CRY protein stability through ubiquitin-linked degradation.",
    sources: ["cgdb", "reactome-clock"],
  })),
  ...["PER1", "PER2", "CRY1", "CRY2"].flatMap((target) =>
    ["BHLHE40", "BHLHE41"].map((source) => ({
      id: `${source}-represses-${target}`,
      source,
      target,
      type: "repression" as ClockEdgeType,
      label: "E-box suppression",
      description:
        "DEC-family factors suppress E-box-driven clock-gene transcription.",
      sources: ["ncbi-clock-table"],
    })),
  ),
  {
    id: "DBP-NFIL3",
    source: "DBP",
    target: "NFIL3",
    type: "regulation",
    label: "D-box output balance",
    description:
      "DBP and NFIL3 are opposing D-box-linked output regulators in the accessory timing layer.",
    sources: ["ncbi-clock-table", "cgdb"],
  },
  {
    id: "TIMELESS-CRY1",
    source: "TIMELESS",
    target: "CRY1",
    type: "regulation",
    label: "negative-loop support",
    description:
      "TIMELESS is represented as an accessory bridge into negative-loop timing and genome-maintenance biology.",
    sources: ["ncbi-clock-table"],
  },
  {
    id: "ARNTL-DBP",
    source: "ARNTL",
    target: "DBP",
    type: "activation",
    label: "transcriptional activation",
    description: "BMAL1/CLOCK activates transcription of DBP.",
    sources: ["NCBI core clock table"],
  },
  {
    id: "ARNTL-ORGAN_LIVER",
    source: "ARNTL",
    target: "ORGAN_LIVER",
    type: "regulation",
    label: "downstream regulation",
    description:
      "The core clock directly drives metabolic rhythms in the liver.",
    sources: ["General biology"],
  },
  {
    id: "DBP-DBP_OUTPUT",
    source: "DBP",
    target: "DBP_OUTPUT",
    type: "activation",
    label: "D-box output program",
    description:
      "DBP-family regulators help translate core clock timing into downstream rhythmic output programs.",
    sources: ["ncbi-clock-table", "reactome-clock"],
  },
];

export const workflowSteps: WorkflowStep[] = [
  {
    title: "Measure biological time",
    copy: "Use light history, sleep timing, wearables, and phase biomarkers to estimate internal time.",
    icon: Clock3,
  },
  {
    title: "Map rhythmic targets",
    copy: "Identify which pathways, genes, symptoms, or drug-handling steps change across the day.",
    icon: Dna,
  },
  {
    title: "Time the intervention",
    copy: "Align the intervention with the target window while considering safety and patient context.",
    icon: AlarmClock,
  },
  {
    title: "Validate clinically",
    copy: "Test whether timing improves efficacy, lowers toxicity, or clarifies who benefits.",
    icon: Shield,
  },
];

export const oxaliplatinEvents = [
  {
    year: "1990",
    title: "Toxicity problem",
    copy: "Early development faced excessive toxicity in a phase I trial.",
  },
  {
    year: "Early 1990s",
    title: "Chronomodulated infusion",
    copy: "Mouse timing studies helped guide clinical schedules with a peak delivery rate around 16:00.",
  },
  {
    year: "1990s",
    title: "Clinical signal",
    copy: "Chronomodulated combinations reported lower severe mucosal toxicity and higher objective response in cited trials.",
  },
  {
    year: "Next question",
    title: "Personalization",
    copy: "The durable lesson is not one universal hour; it is the need to match therapy to internal circadian phase.",
  },
];

export const roadmapItems = [
  "CircaKB/CircaDB gene rhythm import",
  "NCBI gene metadata enrichment",
  "PubMed and OpenAlex citation graph",
  "Evidence confidence scoring",
  "Reviewer workflow for science skill validation",
];

export const heroStats = [
  { value: "24h", label: "daily biological frame" },
  { value: "5", label: "rhythm controls" },
  { value: "6", label: "medicine examples" },
  { value: "v2", label: "database-backed atlas" },
];

export const timingSignals = [
  { label: "Light", icon: SunMedium },
  { label: "Sleep", icon: Moon },
  { label: "Meals", icon: Waves },
  { label: "Activity", icon: Activity },
];
