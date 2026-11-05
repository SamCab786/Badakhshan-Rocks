/**
 * MAIMI GEO ATLAS — Geological Domain & Report Types
 */

export type MineralCategory =
  | 'gemstone'
  | 'mineral'
  | 'igneous'
  | 'metamorphic'
  | 'sedimentary'
  | 'unknown';

export interface MineralSpecimen {
  id: string;
  name_en: string;
  name_fa: string;
  category: MineralCategory;
  category_fa: string;
  category_en: string;
  formula: string;
  mohs_min?: number;
  mohs_max?: number;
  mohs_display: string;
  sg_min?: number;
  sg_max?: number;
  sg_display: string;
  crystal_system_fa: string;
  cleavage_fa: string;
  fracture_fa: string;
  luster_fa: string;
  streak_fa: string;
  streak_hex: string;
  color_swatches?: string[];
  diagnostic_features_fa: string;
  badakhshan_afghanistan_notes_fa: string;
  field_tests_fa: string[];
  primary_colors?: string[];
}

export interface VisualObservations {
  colorTones: string;
  grainSizeTexture: string;
  crystalHabit: string;
  luster: string;
  veinsMatrix: string;
  layeringFoliation: string;
  translucency: string;
  limitations: string;
  // Spectral and pixel-level CV metrics
  avgR?: number;
  avgG?: number;
  avgB?: number;
  hexColor?: string;
  brightnessPercent?: number;
  hasGoldSpecks?: boolean;
  hasVeining?: boolean;
  isLowContrast?: boolean;
}

export type CandidateResolution = 'species' | 'group' | 'undetermined';

export interface IdentificationCandidate {
  name_en: string;
  name_fa: string;
  rank: number;
  reasoning_fa: string;
  reasoning_en?: string;
  resolution: CandidateResolution;
  category: MineralCategory;
  key_visual_indicators_fa: string[];
  visual_conflicts_fa: string[];
  recommended_tests_fa: string[];
  reference_status: 'matched_local_catalog' | 'not_in_local_catalog';
  confidence_score?: number;
  catalog_id?: string;
  mineral?: MineralSpecimen;
}

export interface ScanResult {
  scanId: string;
  timestamp: number;
  imageSrc: string;
  candidates: IdentificationCandidate[];
  detected_features: VisualObservations;
  engine_used: string;
  review_status: 'reviewed' | 'initial_only';
  image_quality: 'usable' | 'limited' | 'poor';
  specimen_scope: 'single_phase_appearance' | 'multi_phase_appearance' | 'undetermined';
  abstention_reason_fa?: string;
}

/**
 * CandidateReport:
 * Synchronously bound report for a specific selected candidate of a specific scan.
 * Guarantees all reference properties, diagnostic notes, tests, and visual indicators
 * belong to this exact candidate and scanId.
 */
export interface CandidateReport {
  scanId: string;
  candidateIndex: number;
  totalCandidates: number;
  candidate: IdentificationCandidate;
  mineral: MineralSpecimen;
  // Demarcation 1: Direct Visual Observations from THIS photo
  visualObservations: VisualObservations;
  // Demarcation 2: Model Hypothesis for THIS photo
  hypothesis: {
    rank: number;
    nameFa: string;
    nameEn: string;
    resolution: CandidateResolution;
    reasoningFa: string;
    keyIndicators: string[];
    conflicts: string[];
    engineUsed: string;
    reviewStatus: 'reviewed' | 'initial_only';
    confidenceScore?: number;
    catalogId?: string;
  };
  // Demarcation 3: Authoritative Reference Specifications
  referenceSpecs: {
    formula: string;
    mohs: string;
    specificGravity: string;
    crystalSystem: string;
    cleavage: string;
    fracture: string;
    luster: string;
    streak: string;
    streakHex: string;
    categoryFa: string;
    diagnosticFeaturesFa: string;
    localityNotesFa: string;
  };
  // Demarcation 4: Field & Laboratory Testing
  fieldTests: string[];
}

export interface HistoryItem {
  id: string;
  scanId: string;
  timestamp: number;
  primaryNameFa: string;
  primaryNameEn: string;
  engine: string;
  candidateCount: number;
  thumbnailSrc?: string;
}
