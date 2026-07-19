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
import type { ModelNotationId } from "../components/ModelNotation";

export type Citation = {
  id: string;
  title: string;
  source: string;
  note: string;
  url?: string;
};

export type SectionVideoExplainer = {
  title: string;
  duration: string;
  summary: string;
  youtubeId?: string;
  transcript?: string;
  citationIds?: string[];
  caveat?: string;
};

export type NavGroup = "foundations" | "clocks" | "medicine" | "evidence";

export type NavChild = {
  id: string;
  label: string;
  hash: string;
};

export type Chapter = {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  dek: string;
  navGroup: NavGroup;
  navChildren?: NavChild[];
  videoExplainer?: SectionVideoExplainer;
};

export type Claim = {
  claim: string;
  source: string;
  evidenceType: string;
  confidence: "High" | "Moderate" | "Emerging" | "Uncertain";
  caveat: string;
  visualUse: string;
  beginnerPhrasing: string;
};

export type OrganClockEvent = {
  hour: number;
  label: string;
  copy: string;
};

export type OrganClockFunction = {
  label: string;
  pattern: string;
  evidence: string;
  caveat: string;
};

export type OrganClock = {
  id: string;
  name: string;
  iconName: "Brain" | "Activity" | "HeartPulse" | "Shield";
  tone: "light" | "metabolic" | "cardio" | "immune";
  summary: string;
  evidenceNote: string;
  functions: OrganClockFunction[];
  sources: string[];
  events: OrganClockEvent[];
};

export type MealLayerMeal = {
  id: string;
  label: string;
  defaultHour: number;
};

export type MealLayerPattern = {
  id: string;
  label: string;
  hours: number[];
};

export type MealLayerSizeOption = {
  id: string;
  label: string;
  multiplier: number;
  copy: string;
};

export type MealLayersConfig = {
  meals: MealLayerMeal[];
  patterns: MealLayerPattern[];
  sizeOptions: MealLayerSizeOption[];
};

export type MedicineExample = {
  name: string;
  icon: LucideIcon;
  visualMode: "interactive";
  labVariant?:
    | "curve"
    | "acid-pump"
    | "day-runway"
    | "night-window"
    | "meal-basal-layers";
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
  mealLayers?: MealLayersConfig;
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
  modelSummary: string;
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

export type MolecularClockVariableId = "mRNA" | "cytoplasmicPER" | "nuclearPER";

export type MolecularClockTimelinePoint = {
  hour: number;
  mRNA: number;
  cytoplasmicPER: number;
  nuclearPER: number;
};

export type MolecularClockTimeline = {
  sourceIds: string[];
  units: string;
  caveat: string;
  parameters: {
    label: string;
    notationId: ModelNotationId;
  }[];
  variables: {
    id: MolecularClockVariableId;
    label: string;
    shortLabel: string;
    notationId: ModelNotationId;
    color: string;
    note: string;
  }[];
  annotations: {
    hour: number;
    label: string;
    copy: string;
  }[];
  points: MolecularClockTimelinePoint[];
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
  | "sequestration"
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

export type ClockMechanicsStructure = {
  id: "clock-bmal" | "per-cry";
  label: string;
  pdbId: string;
  glbPath: string;
  citationId: string;
  note: string;
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

export type TrialSimulationMode = {
  id: "untimed" | "population" | "personalized";
  label: string;
  shortLabel: string;
  strategy: string;
  copy: string;
  accent: string;
};

export const citations: Citation[] = [
  {
    id: "borbely-1982",
    title: "A two process model of sleep regulation",
    source: "Human Neurobiology",
    note: "Foundational source for the educational Process S / Process C framing in the sandbox.",
    url: "https://pubmed.ncbi.nlm.nih.gov/7185792/",
  },
  {
    id: "puckeridge-2011",
    title: "Incorporation of caffeine into a quantitative model of fatigue and sleep",
    source: "Journal of Theoretical Biology",
    note: "Physiologically based caffeine model used for the sandbox’s illustrative concentration curve, adenosine masking, wake-stability mechanism, and sleep-disruption framing.",
    url: "https://doi.org/10.1016/j.jtbi.2010.12.018",
  },
  {
    id: "mchill-2019",
    title:
      "Chronic sleep restriction greatly magnifies performance decrements immediately after awakening",
    source: "Sleep",
    note: "Forced-desynchrony and chronic sleep restriction protocol source for the 20-hour control and CSR schedules.",
    url: "https://pubmed.ncbi.nlm.nih.gov/30722039/",
  },
  {
    id: "cohen-2010",
    title: "Uncovering residual effects of chronic sleep loss on human performance",
    source: "Science Translational Medicine",
    note: "Forced-desynchrony source for the 42.85-hour control and chronic sleep loss protocol comparison.",
    url: "https://pubmed.ncbi.nlm.nih.gov/20371466/",
  },
  {
    id: "czeisler-1999",
    title: "Stability, precision, and near-24-hour period of the human circadian pacemaker",
    source: "Science",
    note: "Primary source for the near-24-hour intrinsic period used in the forced-desynchrony sandbox model.",
    url: "https://doi.org/10.1126/science.284.5423.2177",
  },
  {
    id: "cederroth-2019",
    title: "Medicine in the fourth dimension",
    source: "Cell Metabolism",
    note: "Review article used for the broad chronomedicine framing, oxaliplatin history, and translation caveats.",
    url: "https://doi.org/10.1016/j.cmet.2019.06.019",
  },
  {
    id: "giacchetti-2006",
    title:
      "Phase III trial comparing chronomodulated versus conventional fluorouracil, leucovorin, and oxaliplatin",
    source: "Journal of Clinical Oncology",
    note: "Primary randomized trial for the oxaliplatin chronotherapy case study and the difficult sex-specific survival signal.",
    url: "https://pubmed.ncbi.nlm.nih.gov/16877722/",
  },
  {
    id: "giacchetti-2012",
    title:
      "Sex moderates circadian chemotherapy effects on survival of patients with metastatic colorectal cancer",
    source: "Annals of Oncology",
    note: "Follow-up meta-analysis used to frame the unresolved question of sex moderation in chronomodulated colorectal cancer chemotherapy.",
    url: "https://pubmed.ncbi.nlm.nih.gov/22745214/",
  },
  {
    id: "walch-2026",
    title:
      "Design considerations for hypertension chronotherapy trials: insights from experience and modelling",
    source: "BMC Medicine",
    note: "Modeling paper and companion code inspiration for the educational clinical-trial simulation.",
    url: "https://pubmed.ncbi.nlm.nih.gov/42157233/",
  },
  {
    id: "time-simulations",
    title: "ojwalch/time-simulations",
    source: "GitHub repository",
    note: "Open-source simulation repository accompanying the hypertension chronotherapy trial-design modeling paper.",
    url: "https://github.com/ojwalch/time-simulations",
  },
  {
    id: "smith-2019",
    title: "When Should You Take Your Medicines?",
    source: "Journal of Biological Rhythms",
    note: "Beginner-facing article used for medication timing examples and the wall-clock versus body-clock distinction.",
    url: "https://doi.org/10.1177/0748730419892099",
  },
  {
    id: "klerman-2026",
    title:
      "Translational applications of circadian research: connecting chronobiology to medicine",
    source: "npj Biological Timing and Sleep",
    note: "Perspective used for the future workflow: detecting, targeting, and exploiting biological time.",
    url: "https://doi.org/10.1038/s44323-026-00084-2",
  },
  {
    id: "van-cauter-1996",
    title:
      "Effects of gender and age on the levels and circadian rhythmicity of plasma cortisol",
    source: "Journal of Clinical Endocrinology and Metabolism",
    note: "Primary source for aging-related cortisol nuance: higher mean and nadir with dampened relative amplitude.",
    url: "https://doi.org/10.1210/jcem.81.7.8675562",
  },
  {
    id: "arcascope-circadian",
    title: "Arcascope/circadian",
    source: "Zenodo software release and package documentation",
    note: "Offline simulation package used to generate static rhythm-lab light schedules, oscillator states, phase markers, amplitude, and regularity metrics.",
    url: "https://doi.org/10.5281/zenodo.8206871",
  },
  {
    id: "forger-1999",
    title: "A simpler model of the human circadian pacemaker",
    source: "Journal of Biological Rhythms",
    note: "Light-driven oscillator model family used by the static rhythm-lab scenario export.",
    url: "https://doi.org/10.1177/074873099129000867",
  },
  {
    id: "kim-forger-2012",
    title:
      "A mechanism for robust circadian timekeeping via stoichiometric balance",
    source: "Molecular Systems Biology",
    note: "Mathematical model source for explaining why activator-repressor abundance, tight binding, and a slow secondary negative loop can support robust molecular clock rhythms.",
    url: "https://doi.org/10.1038/msb.2012.62",
  },
  {
    id: "pdb-4f3l",
    title: "4F3L: CLOCK:BMAL1 transcriptional activator complex",
    source: "RCSB Protein Data Bank",
    note: "Mouse CLOCK:BMAL1 bHLH-PAS core structure used as the source geometry for the activator ribbon in the Chapter 5 visual.",
    url: "https://www.rcsb.org/structure/4F3L",
  },
  {
    id: "pdb-6of7",
    title: "6OF7: CRY1–PER2 complex",
    source: "RCSB Protein Data Bank",
    note: "CRY1–PER2 core structure used as the source geometry for the repressor ribbon in the Chapter 5 visual.",
    url: "https://www.rcsb.org/structure/6OF7",
  },
  {
    id: "wang-2024-oscillatory",
    title:
      "Oscillatory dynamics of the mammalian circadian clock induced by the core delayed negative feedback loop",
    source: "Nonlinear Dynamics",
    note: "Delayed-feedback model source for the Chapter 6 educational timeline of Per mRNA, cytoplasmic PER, nuclear PER, and synthesis/transport delay.",
    url: "https://doi.org/10.1007/s11071-024-09416-y",
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
  {
    id: "poggiogalle-2017",
    title: "Circadian regulation of glucose, lipid, and energy metabolism in humans",
    source: "Metabolism",
    note: "Review source for human metabolic rhythms, including glucose tolerance and insulin sensitivity.",
    url: "https://doi.org/10.1016/j.metabol.2017.11.017",
  },
  {
    id: "ada-2026-pharmacologic",
    title:
      "Pharmacologic approaches to glycemic treatment: Standards of Care in Diabetes—2026",
    source: "Diabetes Care",
    note: "Clinical guideline source for individualized basal-insulin treatment and product-specific regimen decisions.",
    url: "https://doi.org/10.2337/dc26-s009",
  },
  {
    id: "speksnijder-2024",
    title: "Circadian desynchrony and glucose metabolism",
    source: "Journal of Pineal Research",
    note: "Review source for circadian misalignment and glucose-metabolism evidence.",
    url: "https://doi.org/10.1111/jpi.12956",
  },
  {
    id: "kinouchi-2021",
    title:
      "Circadian rhythms in the tissue-specificity from metabolism to immunity",
    source: "Molecular Aspects of Medicine",
    note: "Review source for tissue-specific circadian omics from metabolism to immunity.",
    url: "https://doi.org/10.1016/j.mam.2021.100984",
  },
  {
    id: "shea-bp-2011",
    title:
      "Existence of an endogenous circadian blood pressure rhythm in humans",
    source: "Circulation Research",
    note: "Controlled human protocol source for endogenous blood-pressure rhythmicity.",
    url: "https://doi.org/10.1161/CIRCRESAHA.110.233668",
  },
  {
    id: "scheer-platelet-2011",
    title:
      "The human endogenous circadian system causes greatest platelet activation during the biological morning",
    source: "PLOS ONE",
    note: "Forced-desynchrony source for circadian platelet activation.",
    url: "https://doi.org/10.1371/journal.pone.0024549",
  },
  {
    id: "scheer-pai-2014",
    title:
      "Human circadian system causes a morning peak in prothrombotic PAI-1",
    source: "Blood",
    note: "Controlled human protocol source for PAI-1 and fibrinolytic-inhibition timing.",
    url: "https://doi.org/10.1182/blood-2013-07-517060",
  },
  {
    id: "pick-2019",
    title: "Time-of-day-dependent trafficking and function of leukocyte subsets",
    source: "Trends in Immunology",
    note: "Review source for immune-cell trafficking and function across the day.",
    url: "https://doi.org/10.1016/j.it.2019.03.010",
  },
  {
    id: "labrecque-2015",
    title: "Circadian clocks in the immune system",
    source: "Journal of Biological Rhythms",
    note: "Review source for immune clocks and inflammatory timing mechanisms.",
    url: "https://doi.org/10.1177/0748730415577723",
  },
  {
    id: "zhao-2017",
    title:
      "Opposite circadian rhythms between mouse and human leukocytes in humanized mice",
    source: "Blood",
    note: "Translational caveat source showing that immune timing can differ across species.",
    url: "https://doi.org/10.1182/blood-2017-04-778779",
  },
  {
    id: "morin-allen-2006",
    title: "The circadian visual system, 2005",
    source: "Brain Research Reviews",
    note: "Review source for the light pathway from the eyes to the suprachiasmatic nucleus.",
    url: "https://pubmed.ncbi.nlm.nih.gov/16337005/",
  },
  {
    id: "saper-2005",
    title: "Hypothalamic regulation of sleep and circadian rhythms",
    source: "Nature",
    note: "Review source for the sleep-wake circuitry and hypothalamic relay framing in the brain map.",
    url: "https://pubmed.ncbi.nlm.nih.gov/16251950/",
  },
  {
    id: "hastings-2018",
    title: "Generation of circadian rhythms in the suprachiasmatic nucleus",
    source: "Nature Reviews Neuroscience",
    note: "Review source for the SCN as the principal circadian clock and coordinator of daily physiology.",
    url: "https://pubmed.ncbi.nlm.nih.gov/29934559/",
  },
  {
    id: "haas-2008",
    title: "Histamine in the nervous system",
    source: "Physiological Reviews",
    note: "Review source for the wake-active histamine system and its broad projections through the brain.",
    url: "https://pubmed.ncbi.nlm.nih.gov/18626069/",
  },
  {
    id: "sherin-1996",
    title: "Activation of ventrolateral preoptic neurons during sleep",
    source: "Science",
    note: "Primary animal study identifying sleep-active neurons in the ventrolateral preoptic area.",
    url: "https://pubmed.ncbi.nlm.nih.gov/8539624/",
  },
  {
    id: "gaus-2002",
    title:
      "Ventrolateral preoptic nucleus contains sleep-active, galaninergic neurons in multiple mammalian species",
    source: "Neuroscience",
    note: "Comparative source supporting a related sleep-active cell group across mammalian species, including humans.",
    url: "https://pubmed.ncbi.nlm.nih.gov/12401341/",
  },
];

export const chapters: Chapter[] = [
  {
    id: "opening",
    number: "00",
    eyebrow: "Your body keeps time",
    title: "Your body isn’t the same at every hour.",
    dek: "A meal, light pulse, lab test, or dose can meet a different biological state depending on when it arrives.",
    navGroup: "foundations",
  },
  {
    id: "rhythm-lab",
    number: "01",
    eyebrow: "Reading a rhythm",
    title: "A rhythm is a repeating shape.",
    dek: "Cycle length, swing size, peak time, average level, and variation describe how a biological rhythm moves.",
    navGroup: "foundations",
    videoExplainer: {
      title: "How to read a biological rhythm",
      duration: "2 min",
      summary:
        "A quick guide to cycle length, swing size, peak time, average level, and variation before you try the rhythm lab.",
      youtubeId: "kmWSYv6ncwU",
      transcript:
        "A rhythm is a repeating shape. Cycle length, or period, is how long one cycle takes. Amplitude is the size of the swing. Phase tells you when the peak or trough lands. Baseline is the average level. Noise is ordinary variation around the pattern.",
      citationIds: ["arcascope-circadian", "forger-1999"],
    },
  },
  {
    id: "sync",
    number: "02",
    eyebrow: "Staying in sync",
    title: "Your clock takes cues from daily life.",
    dek: "Light leads, while sleep, meals, and activity add signals that can reinforce—or pull against—one another.",
    navGroup: "foundations",
  },
  {
    id: "brain",
    number: "03",
    eyebrow: "The brain clock",
    title: "Light reaches the brain’s master clock.",
    dek: "The master clock uses light that hits your eyeballs to coordinate sleep, hormones, temperature, and tissue clocks.",
    navGroup: "clocks",
  },
  {
    id: "body-clocks",
    number: "04",
    eyebrow: "Clocks across the body",
    title: "Your body keeps more than one schedule.",
    dek: "The brain coordinates the day, while the liver, gut, heart, blood vessels, and immune system keep local time.",
    navGroup: "clocks",
  },
  {
    id: "clock-mechanics",
    number: "05",
    eyebrow: "Inside the cell",
    title: "The clock runs on a feedback loop.",
    dek: "Some proteins turn clock genes on. Others build up, switch the signal off, and reset the cycle.",
    navGroup: "clocks",
  },
  {
    id: "genes",
    number: "06",
    eyebrow: "Clock-gene network",
    title: "The clock is a network, not a gene list.",
    dek: "Start with the core loop, then explore a curated atlas of genes, connections, tissues, and research sources.",
    navGroup: "clocks",
  },
  {
    id: "medicine",
    number: "07",
    eyebrow: "Medicine and time",
    title: "For some medicines, timing changes the biology.",
    dek: "Food, absorption, drug duration, side effects, and changing biological targets can all make the hour matter.",
    navGroup: "medicine",
    videoExplainer: {
      title: "Why drug timing is educational here",
      duration: "3 min",
      summary:
        "Why drug exposure, targets, and side effects can change with time—without turning the examples into personal advice.",
      transcript:
        "Medication timing can matter for several different reasons. The drug may be absorbed differently with food or sleep, the target may rise and fall across the day, or side effects may depend on when the body is more vulnerable. These examples explain the biology. They are not instructions to change a prescription schedule.",
      citationIds: ["smith-2019", "cederroth-2019", "klerman-2026"],
      caveat:
        "Medication timing should be discussed with a clinician or pharmacist.",
    },
  },
  {
    id: "oxaliplatin",
    number: "08",
    eyebrow: "Oxaliplatin case study",
    title: "A cancer drug made timing hard to ignore.",
    dek: "Oxaliplatin studies showed how a treatment schedule can change toxicity, apparent benefit, and the questions a trial leaves behind.",
    navGroup: "medicine",
  },
  {
    id: "trial-simulator",
    number: "09",
    eyebrow: "Trial design lab",
    title: "The same drug can look different in a different trial.",
    dek: "Run a fictional trial to see how ignoring, standardizing, or matching body time changes what the study can detect.",
    navGroup: "medicine",
  },
  {
    id: "sources",
    number: "10",
    eyebrow: "Evidence",
    title: "What the report claims—and how sure we are.",
    dek: "Each major claim stays connected to its evidence, uncertainty, caveats, and source.",
    navGroup: "evidence",
  },
];

export const claimMatrix: Claim[] = [
  {
    claim:
      "In a physiologically based model, caffeine concentration can mask part of an adenosine-linked homeostatic sleep drive and temporarily increase a wake-stability input; later and larger simulated doses produce greater sleep disruption.",
    source: "puckeridge-2011",
    evidenceType:
      "Physiologically based mathematical model constrained against published caffeine-and-sleep studies",
    confidence: "Moderate",
    caveat:
      "The paper found wide variation in caffeine sensitivity and tolerance. The sandbox shows one illustrative parameter profile, not a personal prediction or dosing recommendation.",
    visualUse: "Caffeine controls in the circadian sandbox",
    beginnerPhrasing:
      "In the model, caffeine hides some sleep pressure and can push predicted sleep later.",
  },
  {
    claim:
      "Forced-desynchrony protocols separate imposed sleep-wake timing from endogenous circadian phase.",
    source: "mchill-2019; cohen-2010; czeisler-1999; borbely-1982",
    evidenceType:
      "Controlled laboratory protocols and foundational two-process model paper",
    confidence: "High",
    caveat:
      "The sandbox is illustrative and not a quantitative fit to any individual participant.",
    visualUse: "Circadian sandbox forced-desynchrony scenario",
    beginnerPhrasing:
      "A non-24-hour lab schedule can separate sleep debt from body time.",
  },
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
      "For some medicines, the hour matters because the body changes across the day.",
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
      "Clock time and body time can disagree.",
  },
  {
    claim:
      "Light-driven circadian oscillator models can simulate illustrative phase, amplitude, and schedule-disruption patterns, but they are not personal medical predictions.",
    source: "arcascope-circadian; forger-1999",
    evidenceType: "Open-source software package and published oscillator model",
    confidence: "Moderate",
    caveat:
      "The rhythm lab uses static generated scenarios for education; individual phase requires measurements or validated personal models.",
    visualUse: "Rhythm lab scenario and chronotype controls",
    beginnerPhrasing:
      "Model curves show how light can tug on a clock, not what your body is doing.",
  },
  {
    claim:
      "With aging, cortisol rhythmicity can have lower relative amplitude while mean cortisol, nocturnal nadir, and sometimes peak or absolute swing are higher.",
    source: "van-cauter-1996",
    evidenceType: "Reanalysis of human 24-hour plasma cortisol profiles",
    confidence: "High",
    caveat:
      "The rhythm lab uses this as an educational overlay; it does not diagnose HPA-axis function or aging status.",
    visualUse: "Rhythm lab aging cortisol overlay",
    beginnerPhrasing:
      "A smaller cortisol swing with age doesn’t always mean lower levels.",
  },
  {
    claim:
      "Oxaliplatin is a major chronotherapy example in metastatic colorectal cancer.",
    source: "cederroth-2019; giacchetti-2006; giacchetti-2012",
    evidenceType: "Clinical history, randomized trial, and meta-analysis",
    confidence: "Moderate",
    caveat:
      "Clinical translation still requires personalization, careful trial context, and separation of prespecified findings from exploratory signals.",
    visualUse: "Oxaliplatin evidence timeline",
    beginnerPhrasing:
      "Oxaliplatin looked different when timing became part of the schedule.",
  },
  {
    claim:
      "Sex may moderate survival effects in chronomodulated metastatic colorectal cancer chemotherapy.",
    source: "giacchetti-2006; giacchetti-2012",
    evidenceType: "Randomized trial subgroup signal and later meta-analysis",
    confidence: "Uncertain",
    caveat:
      "This should be framed as a provocative unresolved research question, not a standard-of-care timing recommendation.",
    visualUse: "Oxaliplatin case-study framing",
    beginnerPhrasing:
      "One unresolved question is whether the same schedule affected groups differently.",
  },
  {
    claim:
      "In silico chronotherapy trials can show how trial design changes the chance of detecting a time-sensitive treatment effect.",
    source: "walch-2026; time-simulations",
    evidenceType: "Modeling paper and open-source simulation repository",
    confidence: "Emerging",
    caveat:
      "The site's trial lab is fictional and educational; it is not calibrated to any real drug or approval pathway.",
    visualUse: "Clinical trial simulation",
    beginnerPhrasing:
      "A fictional drug can look different when a trial measures body time.",
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
      "Medicine has to measure body time before it can use it reliably.",
  },
  {
    claim:
      "Core mammalian clock genes form interlocked positive, negative, secondary, and accessory regulatory loops.",
    source:
      "reactome-clock; ncbi-clock-table; circakb; circadb; cgdb; kim-forger-2012",
    evidenceType:
      "Pathway/database references, curated gene annotations, and mathematical modeling",
    confidence: "Moderate",
    caveat:
      "V1 is a curated human clock-gene network with database link-outs; live CircaKB/CircaDB dataset imports remain a v2 data pipeline.",
    visualUse: "Interactive clock-gene network",
    beginnerPhrasing:
      "Clock genes form loops that start, stop, and tune daily rhythms.",
  },
  {
    claim:
      "Mathematical modeling suggests that robust mammalian clock rhythms can depend on stoichiometric balance between activators such as BMAL1:CLOCK/NPAS2 and repressors such as PER/CRY, with secondary feedback helping preserve that balance.",
    source: "kim-forger-2012",
    evidenceType: "Detailed mammalian circadian-clock mathematical model",
    confidence: "Emerging",
    caveat:
      "This is a mechanistic modeling frame for education; it does not turn the v1 gene map into a quantitative live simulation of protein concentrations.",
    visualUse: "Molecular clock animation and core gene-network edges",
    beginnerPhrasing:
      "A steady molecular clock depends partly on the balance between activators and repressors.",
  },
  {
    claim:
      "A delayed negative-feedback model can represent Per mRNA, cytoplasmic PER, and nuclear PER as oscillatory model-state variables, with total synthesis and transport delay affecting whether nuclear PER oscillates.",
    source: "wang-2024-oscillatory; kim-forger-2012",
    evidenceType:
      "Mathematical modeling and delayed-feedback bifurcation analysis",
    confidence: "Emerging",
    caveat:
      "The values shown are model-scale concentrations and parameters for education, not measured human-cell molecule counts or a live quantitative simulator.",
    visualUse: "Timed molecular clock loop and model timeline",
    beginnerPhrasing:
      "The brake arrives late because messages and proteins take time to build and move.",
  },
  {
    claim:
      "Human glucose tolerance and insulin sensitivity vary across circadian phase, with poorer handling often observed later in the day than in the biological morning.",
    source: "poggiogalle-2017; speksnijder-2024",
    evidenceType: "Human metabolism reviews and controlled circadian protocols",
    confidence: "High",
    caveat:
      "Everyday glucose patterns also reflect meal timing, sleep, activity, and prior wakefulness.",
    visualUse: "Body clocks metabolism axis",
    beginnerPhrasing:
      "The same meal can meet a different metabolic state at a different body time.",
  },
  {
    claim:
      "Basal-insulin treatment is individualized; product selection, dosing, and timing depend on the prescribed regimen and clinical context.",
    source: "ada-2026-pharmacologic",
    evidenceType: "Clinical practice guideline",
    confidence: "High",
    caveat:
      "Circadian glucose rhythms do not establish a universal insulin injection time. People should follow their prescription label and clinician or pharmacist guidance.",
    visualUse: "Long-acting insulin meal-layer teaching visual",
    beginnerPhrasing:
      "Meals add glucose challenges on top of background insulin support.",
  },
  {
    claim:
      "Blood pressure, platelet activation, and PAI-1 show circadian regulation in controlled human studies.",
    source: "shea-bp-2011; scheer-platelet-2011; scheer-pai-2014",
    evidenceType: "Controlled human circadian studies",
    confidence: "High",
    caveat:
      "Morning cardiovascular risk also depends on waking, posture, hormones, behavior, and underlying disease.",
    visualUse: "Body clocks cardiovascular axis",
    beginnerPhrasing:
      "Blood pressure, clotting balance, and vascular demand change across the day.",
  },
  {
    claim:
      "Immune-cell trafficking and inflammatory responsiveness are time-structured, but timing differs by cell type and species.",
    source: "pick-2019; labrecque-2015; zhao-2017",
    evidenceType: "Immune timing reviews and translational comparative evidence",
    confidence: "Moderate",
    caveat:
      "Many immune mechanisms are animal-heavy, and mouse timing should not be copied directly onto humans.",
    visualUse: "Body clocks immune axis",
    beginnerPhrasing:
      "Immune cells don’t patrol the body the same way all day.",
  },
  {
    claim:
      "Different tissues can keep local circadian programs, so whole-body timing is coordinated but not perfectly uniform.",
    source: "kinouchi-2021; pnas-atlas",
    evidenceType: "Tissue-specific omics review and mammalian expression atlas",
    confidence: "Moderate",
    caveat:
      "Human tissue-level timing is harder to measure than animal or cell models, so exact phases vary by evidence type.",
    visualUse: "Body clocks nuance note",
    beginnerPhrasing:
      "The body is coordinated like an orchestra, not synchronized like one clock face.",
  },
];

export const organClocks: OrganClock[] = [
  {
    id: "brain",
    name: "Brain (SCN)",
    iconName: "Brain",
    tone: "light",
    summary:
      "Light reaches the master clock, which helps align sleep, hormones, temperature, and tissue clocks.",
    evidenceNote:
      "The body’s main coordinator",
    functions: [
      {
        label: "Light entrainment",
        pattern:
          "Morning and evening light can shift the internal estimate of day and night.",
        evidence: "Strong consensus",
        caveat:
          "The size and direction of the shift depend on timing, intensity, history, and individual phase.",
      },
      {
        label: "System coordination",
        pattern:
          "SCN signals help organize melatonin, cortisol, temperature, sleep pressure, and tissue timing.",
        evidence: "Strong consensus",
        caveat:
          "Peripheral clocks also respond to meals, activity, temperature, and local tissue cues.",
      },
    ],
    sources: ["cederroth-2019", "klerman-2026", "kinouchi-2021"],
    events: [
      {
        hour: 8,
        label: "Morning light and cortisol",
        copy: "Morning light is a strong timing cue, while cortisol rises around waking.",
      },
      {
        hour: 14,
        label: "Mid-afternoon dip",
        copy: "Alertness often dips in the early afternoon.",
      },
      {
        hour: 21,
        label: "Melatonin begins to rise",
        copy: "Melatonin rising in dim light marks the start of biological night.",
      },
    ],
  },
  {
    id: "metabolism",
    name: "Metabolism (Liver/Gut)",
    iconName: "Activity",
    tone: "metabolic",
    summary:
      "The liver and gut keep local time, so metabolism doesn’t work the same way all day.",
    evidenceNote:
      "Strongest human evidence: glucose handling",
    functions: [
      {
        label: "Glucose handling",
        pattern:
          "Glucose tolerance and insulin sensitivity are generally better in the biological morning than later in the day.",
        evidence: "Strong human",
        caveat:
          "Meal composition, sleep, activity, and prior wakefulness can change the observed pattern.",
      },
      {
        label: "Liver processing",
        pattern:
          "Liver clocks organize nutrient storage, lipid handling, bile acid pathways, and detoxification programs.",
        evidence: "Review consensus",
        caveat:
          "Exact clock times for hepatic functions are less settled in humans than in animal and cellular studies.",
      },
      {
        label: "Gut-microbiome timing",
        pattern:
          "Microbial composition and metabolites can fluctuate across the day and respond strongly to feeding rhythms.",
        evidence: "Emerging human",
        caveat:
          "Human microbiome timing is hard to separate from diet, sampling method, medication, and stool-based measures.",
      },
    ],
    sources: ["poggiogalle-2017", "speksnijder-2024", "kinouchi-2021"],
    events: [
      {
        hour: 10,
        label: "Peak glucose handling",
        copy: "Glucose handling is often better earlier in the biological day.",
      },
      {
        hour: 16,
        label: "Liver processing shifts",
        copy: "Liver pathways change across the day, though exact human timing varies.",
      },
      {
        hour: 23,
        label: "Overnight fasting",
        copy: "The gut and liver shift away from daytime nutrient handling overnight.",
      },
    ],
  },
  {
    id: "cardio",
    name: "Cardiovascular",
    iconName: "HeartPulse",
    tone: "cardio",
    summary:
      "Blood pressure, clotting balance, vascular tone, and heart workload all have daily patterns.",
    evidenceNote:
      "Strong controlled-human evidence",
    functions: [
      {
        label: "Blood pressure rhythm",
        pattern:
          "Controlled human studies show an endogenous blood-pressure rhythm, separate from behavior.",
        evidence: "Strong human",
        caveat:
          "Everyday blood pressure also changes with posture, sleep, activity, stress, and temperature.",
      },
      {
        label: "Clotting balance",
        pattern:
          "Platelet activation and PAI-1 show circadian timing that can favor a more prothrombotic morning state.",
        evidence: "Strong human",
        caveat:
          "This supports a risk window concept but does not explain every cardiovascular event.",
      },
      {
        label: "Vascular demand",
        pattern:
          "Heart rate, vascular tone, endothelial function, and cardiac metabolism show daily organization.",
        evidence: "Review consensus",
        caveat:
          "For many variables, the exact endogenous human phase is less secure than for BP, platelets, and PAI-1.",
      },
    ],
    sources: ["shea-bp-2011", "scheer-platelet-2011", "scheer-pai-2014"],
    events: [
      {
        hour: 5,
        label: "Pre-wake pressure rise",
        copy: "Blood pressure and heart rate begin rising around waking.",
      },
      {
        hour: 17,
        label: "Later-day performance",
        copy: "Cardiovascular performance and muscle strength often improve later in the day.",
      },
      {
        hour: 2,
        label: "Sleep pressure dip",
        copy: "Blood pressure usually falls during sleep.",
      },
    ],
  },
  {
    id: "immune",
    name: "Immune System",
    iconName: "Shield",
    tone: "immune",
    summary:
      "Immune cells circulate, enter tissues, and respond to threats on different schedules.",
    evidenceNote:
      "Cell type and species matter",
    functions: [
      {
        label: "Leukocyte trafficking",
        pattern:
          "Circulating immune-cell numbers and tissue entry show subtype-specific daily rhythms.",
        evidence: "Strong consensus",
        caveat:
          "Cell subsets can peak at different times, and human and mouse patterns can differ.",
      },
      {
        label: "Inflammatory tone",
        pattern:
          "Cytokine release, migration, phagocytosis, and inflammatory responsiveness can vary by time of day.",
        evidence: "Review consensus",
        caveat:
          "Do not reduce immunity to one universal 'best' time; the relevant function matters.",
      },
      {
        label: "Clock-inflammation feedback",
        pattern:
          "Inflammation can feed back onto central, liver, and immune clocks in mechanistic studies.",
        evidence: "Emerging",
        caveat:
          "This is a real mechanism area, but routine human phase effects need careful qualification.",
      },
    ],
    sources: ["pick-2019", "labrecque-2015", "zhao-2017"],
    events: [
      {
        hour: 8,
        label: "Immune cells in circulation",
        copy: "Some adaptive immune cells are more common in blood around the morning.",
      },
      {
        hour: 20,
        label: "Inflammation shifts",
        copy: "Inflammatory signals can change toward evening and night.",
      },
      {
        hour: 2,
        label: "Tissue repair",
        copy: "Some innate immune cells move into tissues overnight.",
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
        copy: "Rises over a few hours, then clears quickly.",
      },
      {
        id: "long",
        label: "Longer-acting comparison",
        halfLifeHours: 8,
        peakHours: 3,
        tailHours: 22,
        copy: "Stays active longer, so the exact hour matters less in the model.",
      },
    ],
    targetRhythm: {
      label: "Nighttime cholesterol synthesis",
      peakHour: 2,
      widthHours: 8,
      baseline: 0.08,
      amplitude: 0.92,
      copy: "The nighttime wave represents cholesterol synthesis rising during sleep.",
    },
    overlapLabel: "Projected overlap with nighttime synthesis",
    interpretation: {
      low: "The drug curve is mostly fading before the target rises.",
      medium:
        "Some active drug remains during the target window.",
      high: "More of the drug curve lines up with the target rhythm.",
    },
    sources: ["smith-2019"],
    safetyCaveat:
      "This illustrates label-based timing logic for some short-acting statins. It is not medication advice.",
    labelCue: "Some short-acting statin labels use evening or bedtime timing.",
    whyTimingAppears:
      "Cholesterol synthesis tends to rise during sleep, while short-acting statins clear quickly.",
    modelSummary:
      "Move the dose to see how a short drug curve overlaps an overnight target.",
    sourceId: "smith-2019",
  },
  {
    name: "Long-acting insulin",
    icon: Activity,
    visualMode: "interactive",
    labVariant: "meal-basal-layers",
    bodyTarget: {
      organ: "Liver / bloodstream",
      action: "Background support meeting meal glucose events",
      route: [
        "injection",
        "subcutaneous depot",
        "bloodstream",
        "background coverage",
      ],
    },
    doseWindow: {
      minHour: 6,
      maxHour: 22,
      defaultHour: 8,
      presets: [],
    },
    exposureProfiles: [
      {
        id: "conceptual-basal",
        label: "Conceptual basal coverage",
        halfLifeHours: 12,
        peakHours: 4,
        tailHours: 24,
        copy: "A schematic band represents sustained background coverage; it is not a product pharmacokinetic curve.",
      },
    ],
    mealLayers: {
      meals: [
        { id: "breakfast", label: "Breakfast", defaultHour: 8 },
        { id: "lunch", label: "Lunch", defaultHour: 13 },
        { id: "dinner", label: "Dinner", defaultHour: 19 },
      ],
      patterns: [
        { id: "early", label: "Earlier meals", hours: [7, 12, 17] },
        { id: "standard", label: "Standard day", hours: [8, 13, 19] },
        { id: "late-dinner", label: "Late dinner", hours: [8, 13, 21] },
      ],
      sizeOptions: [
        {
          id: "light",
          label: "Light meal",
          multiplier: 0.65,
          copy: "Smaller meal pulses in this teaching model.",
        },
        {
          id: "standard",
          label: "Standard meal",
          multiplier: 1,
          copy: "Baseline meal pulses in this teaching model.",
        },
        {
          id: "large",
          label: "Larger meal",
          multiplier: 1.35,
          copy: "Larger meal pulses in this teaching model.",
        },
      ],
    },
    targetRhythm: {
      label: "Daily glucose-handling rhythm",
      peakHour: 10,
      widthHours: 10,
      baseline: 0.28,
      amplitude: 0.62,
      copy: "The rhythm represents changing glucose-handling context across the day, not an insulin dose target.",
    },
    overlapLabel: "Meal challenge vs daily rhythm",
    interpretation: {
      low: "In this model, meals land mostly during stronger glucose-handling parts of the day.",
      medium:
        "In this model, at least one meal lands during a lower-handling part of the day.",
      high: "In this model, several meals land during lower-handling parts of the day.",
    },
    sources: ["poggiogalle-2017", "ada-2026-pharmacologic"],
    safetyCaveat:
      "Insulin products, doses, and schedules are regimen-specific. Follow the prescription label and guidance from a clinician or pharmacist.",
    labelCue:
      "Move meals to explore how daily rhythm and meal timing interact with background coverage concepts.",
    whyTimingAppears:
      "Meals create glucose events across the day, while background insulin support and separate meal-time plans can play different roles.",
    modelSummary:
      "Move meals and compare a broad background band with optional meal-time coverage concepts.",
    sourceId: "ada-2026-pharmacologic",
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
        copy: "Rises after dosing and stays visible into the next morning.",
      },
    ],
    absorptionOptions: [
      {
        id: "with-meal",
        label: "With meal",
        multiplier: 1,
        copy: "Shows stronger absorption before the drug enters circulation.",
      },
      {
        id: "lighter-absorption",
        label: "Lighter absorption",
        multiplier: 0.58,
        copy: "Lowers the curve to show how absorption changes availability.",
      },
    ],
    targetRhythm: {
      label: "Morning cardiovascular risk window",
      peakHour: 7,
      widthHours: 5,
      baseline: 0.2,
      amplitude: 0.65,
      copy: "The morning band is a teaching window, not a personal risk prediction.",
    },
    overlapLabel: "Projected morning availability",
    interpretation: {
      low: "The exposure curve is weak or fading in the morning window.",
      medium:
        "Some exposure carries into the morning window.",
      high: "More exposure lines up with the morning window.",
    },
    sources: ["smith-2019"],
    safetyCaveat:
      "Anticoagulant timing depends on the exact product, meal instructions, and clinician guidance.",
    labelCue: "Some labels pair the dose with an evening meal.",
    whyTimingAppears:
      "Meal timing can affect absorption, and morning cardiovascular risk is one reason timing is studied.",
    modelSummary:
      "Change meal-linked absorption and watch how much modeled exposure reaches morning.",
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
        copy: "Uses the first pump window after fasting as the main target.",
      },
      {
        id: "later-meal",
        label: "Later-meal comparison",
        halfLifeHours: 4,
        peakHours: 1.2,
        tailHours: 9,
        copy: "Uses a later meal to show how the pump window changes.",
      },
    ],
    targetRhythm: {
      label: "First-meal pump activation",
      peakHour: 8,
      widthHours: 4,
      baseline: 0.12,
      amplitude: 0.86,
      copy: "The target is active stomach-wall pumps around the first meal after fasting.",
    },
    overlapLabel: "Projected pump-window readiness",
    interpretation: {
      low: "The modeled drug is not ready before many pumps activate.",
      medium:
        "Some modeled drug is ready near the pump window.",
      high: "More modeled drug is ready before meal-triggered pumps activate.",
    },
    sources: ["smith-2019"],
    safetyCaveat:
      "Reflux medication timing differs by drug class and label; this site is educational.",
    labelCue: "Some labels tie the dose to the first meal.",
    whyTimingAppears:
      "For some proton-pump inhibitor labels, timing is tied to active stomach pumps around the first meal after fasting.",
    modelSummary:
      "Move the dose and meal to see whether the drug is ready when pumps switch on.",
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
        copy: "Fades earlier, making the sleep boundary easier to see.",
      },
      {
        id: "longer",
        label: "Longer effect",
        halfLifeHours: 7,
        peakHours: 4,
        tailHours: 18,
        copy: "Stretches farther into the evening.",
      },
    ],
    targetRhythm: {
      label: "Wakefulness versus sleep boundary",
      peakHour: 13,
      widthHours: 8,
      baseline: 0.18,
      amplitude: 0.7,
      copy: "The model places useful alerting effects in the day and spillover near sleep.",
    },
    overlapLabel: "Projected daytime alignment",
    interpretation: {
      low: "The effect misses much of the daytime lane.",
      medium:
        "Useful effect and the sleep boundary are both in view.",
      high: "The effect sits mostly in the daytime lane.",
    },
    sources: ["smith-2019"],
    safetyCaveat:
      "ADHD medication timing depends on product formulation, symptoms, side effects, and prescriber guidance.",
    labelCue:
      "Some stimulant labels use morning timing to reduce sleep spillover.",
    whyTimingAppears:
      "A useful daytime effect can become a nighttime side effect if alerting action persists.",
    modelSummary:
      "Move the dose to compare daytime coverage with spillover near sleep.",
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
        copy: "Keeps the effect closer to the intended sleep window.",
      },
      {
        id: "longer-tail",
        label: "Longer tail",
        halfLifeHours: 6,
        peakHours: 1.5,
        tailHours: 13,
        copy: "Makes next-morning residue easier to see.",
      },
    ],
    targetRhythm: {
      label: "Intended sleep window",
      peakHour: 23,
      widthHours: 7,
      baseline: 0.08,
      amplitude: 0.88,
      copy: "The target is the intended sleep window; the morning band shows residue.",
    },
    overlapLabel: "Projected sleep-window alignment",
    interpretation: {
      low: "The effect lands outside much of the intended sleep window.",
      medium:
        "Some effect lands in the sleep window.",
      high: "The effect arrives close to the intended sleep window.",
    },
    sources: ["smith-2019"],
    safetyCaveat:
      "Sleep-aid timing and next-day impairment warnings depend on the exact product label.",
    labelCue: "Some labels tie use to the intended sleep window.",
    whyTimingAppears: "The target effect is explicitly tied to sleep timing.",
    modelSummary:
      "Move the dose to compare sleep-window alignment with next-morning residue.",
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

export const clockMechanicsStructures: ClockMechanicsStructure[] = [
  {
    id: "clock-bmal",
    label: "CLOCK/BMAL1 activator",
    pdbId: "4F3L",
    glbPath: "/models/clock-bmal-4f3l.glb",
    citationId: "pdb-4f3l",
    note: "Core bHLH-PAS structure; the scroll movement is an authored educational sequence.",
  },
  {
    id: "per-cry",
    label: "PER/CRY repressor",
    pdbId: "6OF7",
    glbPath: "/models/per-cry-6of7.glb",
    citationId: "pdb-6of7",
    note: "CRY1–PER2 core structure; the docking pose is illustrative rather than molecular dynamics.",
  },
];

export const molecularClockTimeline: MolecularClockTimeline = {
  sourceIds: ["kim-forger-2012", "wang-2024-oscillatory"],
  units: "Relative model concentration",
  caveat:
    "Curves are calibrated for explanation from Wang 2024 model settings, not measured molecule counts.",
  parameters: [
    { label: "Initial state", notationId: "initial-state" },
    { label: "Total BMAL1:CLOCK", notationId: "total-bmal-clock" },
    { label: "Binding and saturation", notationId: "binding-saturation" },
    { label: "Rates", notationId: "rates" },
    { label: "Total delay", notationId: "total-delay" },
    { label: "Critical delay", notationId: "critical-delay" },
  ],
  variables: [
    {
      id: "mRNA",
      label: "Per mRNA",
      shortLabel: "M",
      notationId: "per-mrna-M",
      color: "var(--coral)",
      note: "The message produced after BMAL1:CLOCK activation.",
    },
    {
      id: "cytoplasmicPER",
      label: "Cytoplasmic PER",
      shortLabel: "Pc",
      notationId: "per-cytoplasmic-Pc",
      color: "var(--cyan)",
      note: "Protein translated in the cytoplasm before nuclear entry.",
    },
    {
      id: "nuclearPER",
      label: "Nuclear PER",
      shortLabel: "P",
      notationId: "per-nuclear-P",
      color: "var(--violet)",
      note: "Delayed repressor signal that accumulates in the nucleus.",
    },
  ],
  annotations: [
    {
      hour: 6,
      label: "Activator exposed",
      copy: "BMAL1:CLOCK can drive E-box transcription while nuclear PER remains low.",
    },
    {
      hour: 12,
      label: "Message and protein build",
      copy: "Per mRNA and cytoplasmic PER rise before repression catches up.",
    },
    {
      hour: 18,
      label: "Delayed nuclear entry",
      copy: "Nuclear PER climbs after the synthesis and transport delay.",
    },
    {
      hour: 22,
      label: "Repressor-bound",
      copy: "PER/CRY complexes sequester the positive arm and quiet output.",
    },
  ],
  points: [
    { hour: 0, mRNA: 0.22, cytoplasmicPER: 0.18, nuclearPER: 1.55 },
    { hour: 2, mRNA: 0.28, cytoplasmicPER: 0.2, nuclearPER: 1.18 },
    { hour: 4, mRNA: 0.55, cytoplasmicPER: 0.28, nuclearPER: 0.62 },
    { hour: 6, mRNA: 0.95, cytoplasmicPER: 0.45, nuclearPER: 0.22 },
    { hour: 8, mRNA: 1.22, cytoplasmicPER: 0.72, nuclearPER: 0.12 },
    { hour: 10, mRNA: 1.36, cytoplasmicPER: 1.05, nuclearPER: 0.1 },
    { hour: 12, mRNA: 1.12, cytoplasmicPER: 1.32, nuclearPER: 0.28 },
    { hour: 14, mRNA: 0.78, cytoplasmicPER: 1.52, nuclearPER: 0.64 },
    { hour: 16, mRNA: 0.48, cytoplasmicPER: 1.42, nuclearPER: 1.12 },
    { hour: 18, mRNA: 0.32, cytoplasmicPER: 1.08, nuclearPER: 1.62 },
    { hour: 20, mRNA: 0.24, cytoplasmicPER: 0.72, nuclearPER: 1.78 },
    { hour: 22, mRNA: 0.21, cytoplasmicPER: 0.38, nuclearPER: 1.7 },
    { hour: 24, mRNA: 0.22, cytoplasmicPER: 0.18, nuclearPER: 1.55 },
  ],
};

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
    id: "kim-forger-2012",
    name: "Kim & Forger stoichiometric model",
    purpose:
      "Mechanistic modeling source for activator-repressor balance, tight protein binding, and secondary feedback in robust clock timing.",
    status:
      "Used in v1 to annotate the molecular animation and core PER/CRY sequestration edges.",
    url: "https://doi.org/10.1038/msb.2012.62",
  },
  {
    id: "wang-2024-oscillatory",
    name: "Wang delayed negative-feedback model",
    purpose:
      "Modeling source for Per mRNA, cytoplasmic PER, nuclear PER, total delay, and delay-induced oscillatory behavior in the timed loop.",
    status:
      "Used in v1 as an educational model-unit timeline, not as a measured molecule-count simulator.",
    url: "https://doi.org/10.1007/s11071-024-09416-y",
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
      "ARNTL/BMAL1 pairs with CLOCK or NPAS2 to bind E-box elements and activate the next wave of clock and clock-controlled genes; molecular models treat its abundance relative to PER/CRY repressors as a key balance point.",
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
    sources: [
      "reactome-clock",
      "ncbi-clock-table",
      "circakb",
      "circadb",
      "kim-forger-2012",
    ],
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
      "CLOCK forms the canonical heterodimer with BMAL1, activating PER, CRY, REV-ERB/ROR loop genes, DBP, and many output genes before negative-loop proteins sequester the complex.",
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
    sources: [
      "reactome-clock",
      "ncbi-clock-table",
      "circakb",
      "kim-forger-2012",
    ],
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
      "PER1 is activated by BMAL1:CLOCK and later contributes to repression by helping the negative-loop complex bind and inactivate the positive arm.",
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
    sources: ["reactome-clock", "circakb", "circadb", "kim-forger-2012"],
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
      "PER2 is a core negative-loop component whose timing, stability, and balance against activator abundance are central to circadian period and phase.",
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
    sources: [
      "reactome-clock",
      "ncbi-clock-table",
      "cgdb",
      "circakb",
      "kim-forger-2012",
    ],
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
      "CRY1 joins PER proteins to repress BMAL1:CLOCK-driven transcription; the Kim-Forger model highlights this tight activator-repressor binding as a rhythm-generating motif.",
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
    sources: ["reactome-clock", "circakb", "circadb", "kim-forger-2012"],
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
      "CRY2 participates in the negative limb and helps tune the timing, strength, and duration of transcriptional repression.",
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
    sources: ["reactome-clock", "cgdb", "circakb", "kim-forger-2012"],
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
    sources: ["reactome-clock", "ncbi-clock-table", "kim-forger-2012"],
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
      type: "sequestration" as ClockEdgeType,
      label: "protein sequestration",
      description:
        "PER/CRY complexes bind and inactivate the positive transcriptional arm; Kim and Forger modeled this activator-repressor stoichiometry as a route to robust rhythms.",
      sources: ["reactome-clock", "ncbi-clock-table", "kim-forger-2012"],
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
    title: "A toxicity problem",
    copy: "An early phase I schedule produced too much toxicity.",
  },
  {
    year: "Early 1990s",
    title: "Timing enters the schedule",
    copy: "Mouse studies helped shape an infusion schedule that changed delivery across the day.",
  },
  {
    year: "1990s",
    title: "A promising signal",
    copy: "Timed combinations reported less severe mucosal toxicity and better tumor response in cited trials.",
  },
  {
    year: "2006",
    title: "The randomized trial complicates the story",
    copy: "A phase III trial raised a difficult question about different survival effects by sex.",
  },
  {
    year: "2012",
    title: "The question stays open",
    copy: "A later meta-analysis supported the signal, but the result still called for better trials—not bedside timing advice.",
  },
];

export const trialSimulationModes: TrialSimulationMode[] = [
  {
    id: "untimed",
    label: "Ignore body time",
    shortLabel: "Ignore",
    strategy: "Dose when visits happen",
    copy: "Visits set the dose time. Different body clocks spread the drug across biological time.",
    accent: "var(--coral)",
  },
  {
    id: "population",
    label: "One time for everyone",
    shortLabel: "One time",
    strategy: "Use one wall-clock time",
    copy: "Everyone gets the same clock time, but early and late body clocks still land at different internal times.",
    accent: "var(--amber)",
  },
  {
    id: "personalized",
    label: "Match body time",
    shortLabel: "Match",
    strategy: "Dose by estimated body time",
    copy: "Different appointment times aim for the same biological target.",
    accent: "var(--cyan)",
  },
];

export const roadmapItems = [
  "CircaKB/CircaDB gene rhythm import",
  "NCBI gene metadata enrichment",
  "Regimen-specific insulin timing visual",
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
