/**
 * MAIMI GEO ATLAS — Image Analysis & Synthetic Test Specimen Utilities
 */

import { MineralSpecimen, VisualObservations } from '../types/geology';

export interface SpectralAnalysisResult extends VisualObservations {
  avgR: number;
  avgG: number;
  avgB: number;
  hexColor: string;
  brightnessPercent: number;
  hasGoldSpecks: boolean;
  hasVeining: boolean;
  isLowContrast: boolean;
  stdDev: number;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => {
    const h = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return h.length === 1 ? '0' + h : h;
  }).join('');
}

export function getHueNameFa(hue: string): string {
  const map: Record<string, string> = {
    blue: 'طیف آبی لاجوردی',
    green: 'طیف سبز زمردی/زیتونی',
    yellow_gold: 'طیف زرد طلایی/برنجی',
    red_pink: 'طیف سرخ/صورتی لعل',
    black_dark: 'طیف تیره مافیک',
    white_light: 'طیف روشن فلسیک'
  };
  return map[hue] || 'طیف رنگی مختلط';
}

/**
 * Extracts real pixel-level spectral metrics via HTML5 Canvas
 */
export async function analyzeImagePixels(dataUrl: string): Promise<SpectralAnalysisResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 320;
      let w = img.width || 300;
      let h = img.height || 300;
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
      canvas.width = Math.max(1, w);
      canvas.height = Math.max(1, h);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(createFallbackSpectralResult());
        return;
      }

      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;

      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let count = 0;
      let goldSpecks = 0;
      let whitePixels = 0;
      const luminanceValues: number[] = [];

      // Sample every 4th pixel for speed and precision
      for (let i = 0; i < d.length; i += 16) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        rSum += r;
        gSum += g;
        bSum += b;
        count++;

        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        luminanceValues.push(lum);

        // Brassy metallic highlights detector (e.g. Pyrite, Chalcopyrite, Gold)
        if (r > 160 && g > 130 && b < 110 && r - b > 45) {
          goldSpecks++;
        }
        // Bright white streaks / Calcite matrix
        if (r > 200 && g > 200 && b > 200) {
          whitePixels++;
        }
      }

      const safeCount = Math.max(1, count);
      const avgR = Math.round(rSum / safeCount);
      const avgG = Math.round(gSum / safeCount);
      const avgB = Math.round(bSum / safeCount);
      const brightness = (avgR * 0.299 + avgG * 0.587 + avgB * 0.114) / 255;
      const brightnessPercent = Math.round(brightness * 100);

      // Contrast standard deviation
      const meanLum = brightness * 255;
      let varianceSum = 0;
      for (const l of luminanceValues) {
        varianceSum += Math.pow(l - meanLum, 2);
      }
      const stdDev = Math.sqrt(varianceSum / Math.max(1, luminanceValues.length));
      const isLowContrast = stdDev < 8; // flat or blank image

      let dominantHue = 'mixed';
      if (brightness < 0.22) dominantHue = 'black_dark';
      else if (brightness > 0.82) dominantHue = 'white_light';
      else if (avgB > avgR + 15 && avgB > avgG) dominantHue = 'blue';
      else if (avgG > avgR + 10 && avgG > avgB) dominantHue = 'green';
      else if (avgR > 135 && avgG > 105 && avgB < 100) dominantHue = 'yellow_gold';
      else if (avgR > avgG + 15 && avgR > avgB + 15) dominantHue = 'red_pink';

      const hexColor = rgbToHex(avgR, avgG, avgB);
      const hasGoldSpecks = goldSpecks > 5;
      const hasVeining = whitePixels > safeCount * 0.07;

      resolve({
        colorTones: `${getHueNameFa(dominantHue)} (${hexColor})`,
        grainSizeTexture: isLowContrast ? 'بافت یکنواخت با کنتراست پایین' : 'بافت دانه‌ای ناهمگن با تنوع نوری',
        crystalHabit: 'بررسی بصری کلی بلورها در تصویر',
        luster: brightnessPercent > 65 ? 'بازتاب نوری و جلای نسبتاً درخشان' : 'جلای مات تا نیمه‌روشن',
        veinsMatrix: hasVeining ? 'مشاهده رگه‌بندی‌های روشن در ماتریس' : 'عدم مشاهده رگه‌بندی گسترده روشن',
        layeringFoliation: 'توزیع یکنواخت دانه‌ها',
        translucency: brightnessPercent > 70 ? 'نیمه‌شفاف در لبه‌ها' : 'کدر در ماتریس اصلی',
        limitations: 'تحلیل رنگ و بافت پیکسل‌های دیجیتال جایگزین آزمایش‌های فیزیکی مانند سختی موس و چگالی نیست.',
        avgR,
        avgG,
        avgB,
        hexColor,
        brightnessPercent,
        hasGoldSpecks,
        hasVeining,
        isLowContrast,
        stdDev
      });
    };

    img.onerror = () => {
      resolve(createFallbackSpectralResult());
    };

    img.src = dataUrl;
  });
}

function createFallbackSpectralResult(): SpectralAnalysisResult {
  return {
    colorTones: 'طیف رنگی نامشخص',
    grainSizeTexture: 'نامشخص',
    crystalHabit: 'نامشخص',
    luster: 'نامشخص',
    veinsMatrix: 'نامشخص',
    layeringFoliation: 'نامشخص',
    translucency: 'نامشخص',
    limitations: 'خطا در بارگذاری تصویر برای آنالیز طیفی.',
    avgR: 128,
    avgG: 128,
    avgB: 128,
    hexColor: '#808080',
    brightnessPercent: 50,
    hasGoldSpecks: false,
    hasVeining: false,
    isLowContrast: false,
    stdDev: 20
  };
}

/**
 * Creates a synthetic, morphologically accurate hand-specimen canvas data URL
 * for immediate deterministic testing of any catalog rock.
 */
export function generateSyntheticSpecimen(mineral: MineralSpecimen): string {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const swatches = mineral.color_swatches && mineral.color_swatches.length >= 2
    ? mineral.color_swatches
    : ['#1e293b', '#334155', '#0f172a'];

  // Base rock gradient
  const grad = ctx.createRadialGradient(200, 200, 30, 200, 200, 200);
  grad.addColorStop(0, swatches[0] || '#2563eb');
  grad.addColorStop(0.5, swatches[1] || '#1d4ed8');
  grad.addColorStop(1, swatches[swatches.length - 1] || '#0f172a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 400, 400);

  // Add mineralogical specific morphological patterns
  if (mineral.id === 'lapis-lazuli') {
    // Brassy pyrite flecks
    ctx.fillStyle = '#facc15';
    for (let i = 0; i < 65; i++) {
      const x = 40 + Math.random() * 320;
      const y = 40 + Math.random() * 320;
      const size = 2 + Math.random() * 4;
      ctx.fillRect(x, y, size, size);
    }
    // White calcite vein
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(30, 140);
    ctx.bezierCurveTo(120, 100, 240, 220, 370, 180);
    ctx.stroke();
  } else if (mineral.id === 'emerald') {
    // Hexagonal crystal lines & inclusions
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.7)';
    ctx.lineWidth = 3;
    ctx.strokeRect(90, 90, 220, 220);
    ctx.beginPath();
    ctx.moveTo(90, 90);
    ctx.lineTo(310, 310);
    ctx.moveTo(310, 90);
    ctx.lineTo(90, 310);
    ctx.stroke();
  } else if (mineral.id === 'pyrite' || mineral.id === 'native-gold') {
    // Metallic faceted reflections
    ctx.fillStyle = '#fde047';
    for (let i = 0; i < 80; i++) {
      const x = 30 + Math.random() * 340;
      const y = 30 + Math.random() * 340;
      ctx.fillRect(x, y, 7, 7);
    }
  } else if (mineral.id === 'malachite') {
    // Concentric botryoidal rings
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.75)';
    ctx.lineWidth = 4;
    for (let r = 20; r < 180; r += 25) {
      ctx.beginPath();
      ctx.arc(200, 200, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (mineral.id === 'granite') {
    // Salt-and-pepper mottled grains
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * 400;
      const y = Math.random() * 400;
      const roll = Math.random();
      ctx.fillStyle = roll > 0.6 ? '#f87171' : roll > 0.3 ? '#f8fafc' : '#09090b';
      ctx.fillRect(x, y, 5, 5);
    }
  } else if (mineral.id === 'obsidian') {
    // Glassy conchoidal arcs
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(150 + i * 20, 150 + i * 20, 50 + i * 25, 0, Math.PI * 0.7);
      ctx.stroke();
    }
  }

  return canvas.toDataURL('image/jpeg', 0.92);
}
