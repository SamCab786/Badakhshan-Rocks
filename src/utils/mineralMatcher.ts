/**
 * MAIMI GEO ATLAS — Advanced Mineralogical Diagnostic & Spectral Matcher
 *
 * Provides highly accurate, scientifically grounded mineral and rock matching
 * based on true optical color metrics, metallic highlights, matrix veining,
 * and optional physical field diagnostic traits.
 */

import { GEOLOGY_CATALOG, findCatalogMatch } from '../data/geologyCatalog';
import {
  IdentificationCandidate,
  MineralSpecimen,
  VisualObservations
} from '../types/geology';

export interface PhysicalFieldTraits {
  observedColor?: string; // blue, green, red_pink, yellow_gold, black_dark, white_light, brown
  estimatedHardness?: 'very_soft' | 'soft' | 'medium' | 'hard' | 'very_hard'; // <2.5, 2.5-3.5, 3.5-5.5, 5.5-7, >7
  isMagnetic?: boolean;
  acidReaction?: boolean; // fizzes in dilute acid/vinegar
  streakColor?: 'white' | 'black' | 'red_cherry' | 'yellow_gold' | 'green' | 'blue';
  translucencyLevel?: 'transparent' | 'translucent' | 'opaque';
  regionOrMine?: string; // badakhshan, panjshir, nuristan, etc.
}

export interface MatcherInput {
  avgR: number;
  avgG: number;
  avgB: number;
  brightnessPercent: number;
  hasGoldSpecks: boolean;
  hasVeining: boolean;
  stdDev: number;
  hexColor: string;
  fieldTraits?: PhysicalFieldTraits;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  if (isNaN(num)) return [128, 128, 128];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

// Perceptual color distance (weighted Euclidean)
function colorDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
): number {
  const rmean = (r1 + r2) / 2;
  const r = r1 - r2;
  const g = g1 - g2;
  const b = b1 - b2;
  return Math.sqrt(
    (((512 + rmean) * r * r) >> 8) +
      4 * g * g +
      (((767 - rmean) * b * b) >> 8)
  );
}

export function matchSpecimensByMineralogy(
  input: MatcherInput
): IdentificationCandidate[] {
  const {
    avgR,
    avgG,
    avgB,
    brightnessPercent,
    hasGoldSpecks,
    hasVeining,
    fieldTraits
  } = input;

  const scored: Array<{
    mineral: MineralSpecimen;
    score: number;
    reasons: string[];
    indicators: string[];
    conflicts: string[];
  }> = [];

  for (const mineral of GEOLOGY_CATALOG) {
    let score = 0;
    const reasons: string[] = [];
    const indicators: string[] = [];
    const conflicts: string[] = [];

    // 1. Color Matching: compare input RGB against specimen color swatches
    let minColorDist = 999;
    const swatches = mineral.color_swatches || ['#1e293b'];
    for (const hex of swatches) {
      const [sr, sg, sb] = hexToRgb(hex);
      const dist = colorDistance(avgR, avgG, avgB, sr, sg, sb);
      if (dist < minColorDist) minColorDist = dist;
    }

    // Color closeness score (0 - 50 points)
    const colorMatchPoints = Math.max(0, 50 - minColorDist / 7);
    score += colorMatchPoints;
    if (colorMatchPoints > 28) {
      indicators.push(`هم‌پوشانی بالای طیف رنگی با نمونه‌های استاندارد ${mineral.name_fa}`);
    }

    // 2. Metallic / Golden Specks weighting (Pyrite, Chalcopyrite, Gold, Lapis Lazuli)
    if (hasGoldSpecks) {
      if (
        mineral.id === 'pyrite' ||
        mineral.id === 'native-gold' ||
        mineral.id === 'chalcopyrite'
      ) {
        score += 45;
        reasons.push('مشاهده دانه‌ها یا بازتاب‌های درخشان متالیک طلایی برنجی در ساختار سنگ.');
        indicators.push('ذرات متالیک بازتابی طلایی');
      } else if (mineral.id === 'lapis-lazuli') {
        score += 35;
        reasons.push('وجود دانه‌های طلایی برنجی پیریت پراکنده در ماتریس سنگ لاجورد.');
        indicators.push('پیریت‌های هم‌زاد در لاجورد');
      } else {
        score -= 10;
        conflicts.push('وجود ذرات متالیک طلایی با ویژگی‌های خالص این کانی هم‌خوانی کامل ندارد.');
      }
    }

    // 3. Matrix & White Veining (Calcite, Quartz, Lapis, Marble)
    if (hasVeining) {
      if (
        mineral.id === 'lapis-lazuli' ||
        mineral.id === 'marble' ||
        mineral.id === 'serpentinite' ||
        mineral.id === 'chalcedony-agate'
      ) {
        score += 25;
        reasons.push('مشاهده رگه‌بندی‌های کلسیت/کوارتز در بافت سنگ.');
        indicators.push('رگه‌های روشن ماتریکس');
      } else if (mineral.id === 'obsidian' || mineral.id === 'emerald') {
        score -= 5;
      }
    }

    // 4. Luster & Brightness checks
    if (brightnessPercent < 25) {
      // Dark / Mafic minerals (Obsidian, Basalt, Gabbro, Magnetite, Biotite)
      if (
        mineral.id === 'obsidian' ||
        mineral.id === 'basalt' ||
        mineral.id === 'gabbro' ||
        mineral.id === 'magnetite' ||
        mineral.id === 'biotite' ||
        mineral.id === 'hornblende'
      ) {
        score += 25;
        indicators.push('درجه روشنایی تیره مافیک سنگ');
      }
    } else if (brightnessPercent > 70) {
      // Light / Felsic / Transparent minerals (Quartz, Gypsum, Marble, Calcite)
      if (
        mineral.id === 'quartz' ||
        mineral.id === 'gypsum' ||
        mineral.id === 'marble' ||
        mineral.id === 'calcite' ||
        mineral.id === 'muscovite'
      ) {
        score += 25;
        indicators.push('روشنایی بالا و شفافیت در لبه‌ها');
      }
    }

    // 5. Blue tones (Lapis, Azurite, Turquoise, Aquamarine, Fluorite)
    if (avgB > avgR + 10 && avgB > avgG) {
      if (
        mineral.id === 'lapis-lazuli' ||
        mineral.id === 'azurite' ||
        mineral.id === 'turquoise' ||
        mineral.id === 'aquamarine' ||
        mineral.id === 'chrysocolla'
      ) {
        score += 35;
        reasons.push(`طیف آبی چشمگیر منطبق بر فازهای سولفات/مس/بریل در ${mineral.name_fa}.`);
        indicators.push('رنگ آبی سیر شاخص');
      }
    }

    // 6. Green tones (Emerald, Malachite, Peridot, Epidote, Serpentine, Tourmaline)
    if (avgG > avgR + 10 && avgG > avgB) {
      if (
        mineral.id === 'emerald' ||
        mineral.id === 'malachite' ||
        mineral.id === 'olivine' ||
        mineral.id === 'epidote' ||
        mineral.id === 'serpentinite' ||
        mineral.id === 'tourmaline'
      ) {
        score += 35;
        reasons.push(`طیف سبز زنده هماهنگ با کانی‌های کروم‌دار یا مس/آهن در ${mineral.name_fa}.`);
        indicators.push('رنگ سبز مشخص');
      }
    }

    // 7. Red/Pink tones (Spinel, Garnet, Corundum/Ruby, Kunzite, Cinnabar, Rose Quartz)
    if (avgR > avgG + 15 && avgR > avgB + 10) {
      if (
        mineral.id === 'spinel' ||
        mineral.id === 'garnet' ||
        mineral.id === 'corundum' ||
        mineral.id === 'kunzite' ||
        mineral.id === 'cinnabar' ||
        mineral.id === 'rose-quartz'
      ) {
        score += 35;
        reasons.push(`طیف سرخ/صورتی مشخص منطبق بر ساختار بلورین ${mineral.name_fa}.`);
        indicators.push('رنگ سرخ/صورتی شاخص');
      }
    }

    // 8. PHYSICAL FIELD TRAITS (Strong scientific determinism if provided)
    if (fieldTraits) {
      // Magnetism
      if (fieldTraits.isMagnetic !== undefined) {
        if (fieldTraits.isMagnetic) {
          if (mineral.id === 'magnetite') score += 100;
          else score -= 40;
        } else {
          if (mineral.id === 'magnetite') score -= 50;
        }
      }

      // Acid reaction
      if (fieldTraits.acidReaction !== undefined) {
        if (fieldTraits.acidReaction) {
          if (
            mineral.id === 'calcite' ||
            mineral.id === 'aragonite' ||
            mineral.id === 'marble' ||
            mineral.id === 'limestone' ||
            mineral.id === 'malachite' ||
            mineral.id === 'azurite'
          ) {
            score += 70;
            indicators.push('واکنش جوشان با اسید رقیق (کربنات کلسیم/مس)');
          } else {
            score -= 30;
          }
        }
      }

      // Hardness constraint
      if (fieldTraits.estimatedHardness) {
        const minH = mineral.mohs_min || 5;
        const maxH = mineral.mohs_max || 6;
        if (fieldTraits.estimatedHardness === 'very_hard') {
          // > 7 (Quartz, Spinel, Emerald, Topaz, Corundum)
          if (minH >= 7) {
            score += 50;
            indicators.push(`سختی بالای ۷ موهس هماهنگ با ${mineral.name_fa}`);
          } else {
            score -= 40;
          }
        } else if (fieldTraits.estimatedHardness === 'very_soft') {
          // < 2.5 (Talc, Gypsum, Muscovite)
          if (maxH <= 2.5) {
            score += 50;
            indicators.push(`نرمی شدید (خراش با ناخن) منطبق بر ${mineral.name_fa}`);
          } else {
            score -= 40;
          }
        } else if (fieldTraits.estimatedHardness === 'soft') {
          // 2.5 - 3.5 (Calcite, Galena, Native Gold)
          if (minH <= 3.5 && maxH >= 2.5) {
            score += 40;
          }
        }
      }

      // Streak constraint
      if (fieldTraits.streakColor) {
        if (fieldTraits.streakColor === 'red_cherry') {
          if (mineral.id === 'hematite' || mineral.id === 'cinnabar') score += 90;
          else score -= 30;
        } else if (fieldTraits.streakColor === 'black') {
          if (
            mineral.id === 'pyrite' ||
            mineral.id === 'magnetite' ||
            mineral.id === 'chalcopyrite'
          )
            score += 60;
          else if (mineral.id === 'native-gold') score -= 50;
        } else if (fieldTraits.streakColor === 'yellow_gold') {
          if (mineral.id === 'native-gold') score += 100;
          else if (mineral.id === 'pyrite') score -= 50;
        }
      }
    }

    // Default rationale if empty
    if (reasons.length === 0) {
      reasons.push(
        `تشابه طیفی با پارامترهای پایگاه داده و الگوهای بلوری نمونه مرجع ${mineral.name_fa}.`
      );
    }
    if (indicators.length === 0) {
      indicators.push('تطابق رنگ و بازتاب کلی');
    }
    if (conflicts.length === 0) {
      conflicts.push('آزمایش‌های اندازه‌گیری سختی و وزن مخصوص برای قطعیت کامل نیاز است.');
    }

    scored.push({
      mineral,
      score,
      reasons,
      indicators,
      conflicts
    });
  }

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Return top 5 distinct candidates
  return scored.slice(0, 5).map((item, idx) => ({
    name_en: item.mineral.name_en,
    name_fa: item.mineral.name_fa,
    rank: idx + 1,
    reasoning_fa: item.reasons.join(' '),
    resolution: 'species',
    category: item.mineral.category,
    key_visual_indicators_fa: item.indicators,
    visual_conflicts_fa: item.conflicts,
    recommended_tests_fa: item.mineral.field_tests_fa,
    reference_status: 'matched_local_catalog',
    mineral: item.mineral
  }));
}
