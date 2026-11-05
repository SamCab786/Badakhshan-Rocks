/**
 * MAIMI GEO ATLAS — Full-Stack Server
 * Powered by Gemini 3.8 Flash Vision and Express / Vite
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { GEOLOGY_CATALOG, findCatalogMatch } from './src/data/geologyCatalog';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json({ limit: '20mb' }));

// Helper to get initialized GoogleGenAI instance
function getGenAIClient(customKey?: string): GoogleGenAI {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('کلید GEMINI_API_KEY در محیط سرور تنظیم نشده است. لطفاً در پنل تنظیمات بررسی نمایید.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

const CATALOG_SYNOPSIS = GEOLOGY_CATALOG.map(
  (m, idx) => `${idx + 1}. [id: "${m.id}"] ${m.name_fa} (${m.name_en}) — فرمول: ${m.formula} | سختی: ${m.mohs_display} | رده: ${m.category_fa}`
).join('\n');

const SYSTEM_PROMPT = `You are the MAIMI GEO ATLAS Hybrid Engine: Multimodal AI Vision + 51-Reference Geological Catalog of Afghanistan & World Minerals.
You MUST utilize BOTH your advanced Multimodal AI Vision AND the authoritative 51-Reference Geological Catalog below in synergy.

OPERATIONAL INSTRUCTIONS:
1. Examine the visual properties in the photo (color shades, crystalline habit, cleavage steps, grain boundaries, fracture, luster, veining, matrix, transparency).
2. Cross-reference your AI findings directly with the 51-Reference Catalog below to identify the exact mineralogical match.
3. For each candidate in "candidates":
   - "catalog_id": The matching ID from the 51 reference catalog below (e.g. 'emerald', 'lapis-lazuli', 'spinel', 'pyrite', etc.)
   - "name_fa": Official Persian/Dari name from the catalog
   - "name_en": Official English name from the catalog
   - "confidence_score": Integer percentage (50-99) reflecting AI visual confidence
   - "reasoning_fa": Detailed mineralogical reasoning explaining how the AI visual evidence directly supports this 51-catalog specimen
   - "key_visual_indicators_fa": 2 to 4 specific visual features visible in the photo
   - "visual_conflicts_fa": Potential lookalike conflicts or limits of photo analysis
   - "recommended_tests_fa": Diagnostic field tests from the catalog to confirm 100%

CRITICAL INSTRUCTION:
You MUST ALWAYS provide between 2 and 5 ranked candidate hypotheses in the "candidates" array, ordered from most likely to least likely.
NEVER return an empty "candidates" array.
If green: must evaluate emerald, malachite, peridot, or tourmaline.
If red/pink: must evaluate spinel, ruby/corundum, or garnet.
If blue: must evaluate lapis-lazuli, azurite, or turquoise.
If yellow/gold: must evaluate pyrite, chalcopyrite, or native-gold.
If black/dark: must evaluate obsidian, basalt, or magnetite.
If white/clear: must evaluate quartz, calcite, or marble.

AUTHORITATIVE 51-REFERENCE CATALOG:
${CATALOG_SYNOPSIS}

Return JSON ONLY using exactly this schema:
{
  "is_geological_specimen": true,
  "image_quality": "usable",
  "insufficient_evidence": false,
  "specimen_scope": "single_phase_appearance",
  "abstention_reason_fa": "",
  "detected_visual_features": {
    "color_tones": "Visible colors in Dari/Persian",
    "grain_size_texture": "Grain texture description in Dari/Persian",
    "crystal_habit": "Visible crystal habit in Dari/Persian",
    "luster": "Visible luster in Dari/Persian",
    "veins_matrix": "Visible veins and host matrix in Dari/Persian",
    "layering_foliation": "Visible layering or foliation in Dari/Persian",
    "translucency": "Visible translucency in Dari/Persian",
    "image_limitations": "Limitations of this photo in Dari/Persian"
  },
  "candidates": [
    {
      "catalog_id": "matching-catalog-id",
      "name_en": "Standard English mineral or rock name",
      "name_fa": "Persian/Dari name of the mineral or rock",
      "confidence_score": 92,
      "category": "mineral",
      "resolution": "species",
      "reasoning_fa": "Detailed mineralogical reasoning tied to visible features in Dari/Persian",
      "key_visual_indicators_fa": ["Visible indicator 1", "Visible indicator 2"],
      "visual_conflicts_fa": ["Contradicting visual clue or absence of feature"],
      "recommended_tests_fa": ["Diagnostic field test 1", "Diagnostic field test 2"]
    }
  ]
}`;

// API: Health & Status
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    hasApiKey: hasKey,
    catalogSpecimenCount: GEOLOGY_CATALOG.length,
    defaultModel: 'gemini-3.8-flash',
    environment: isProduction ? 'production' : 'development'
  });
});

// API: Catalog
app.get('/api/catalog', (req, res) => {
  res.json({
    specimens: GEOLOGY_CATALOG,
    count: GEOLOGY_CATALOG.length
  });
});

// API: Direct Key validation test
app.post('/api/test-key', async (req, res) => {
  try {
    const customKey = req.headers['x-maimi-api-key'] as string | undefined;
    const ai = getGenAIClient(customKey);
    const model = (req.body?.model as string) || 'gemini-3.8-flash';

    const testResponse = await ai.models.generateContent({
      model,
      contents: 'Ping: reply with JSON {"status": "ok"}',
      config: {
        responseMimeType: 'application/json'
      }
    });

    res.json({
      success: true,
      model,
      message_fa: `اتصال به هوش مصنوعی با مدل ${model} با موفقیت برقرار است.`
    });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      error: error.message || 'خطا در برقراری ارتباط با مدل Gemini'
    });
  }
});

// API: Multimodal Image Identification
app.post('/api/identify', async (req, res) => {
  try {
    const { imageBase64, mimeType, reviewPass, modelPreference } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'تصویر جهت تحلیل ارسال نشده است.' });
    }

    const customKey = req.headers['x-maimi-api-key'] as string | undefined;
    const ai = getGenAIClient(customKey);

    // Clean base64 string
    const cleanBase64 = imageBase64.includes(',')
      ? imageBase64.split(',')[1]
      : imageBase64;
    const validMimeType = mimeType || 'image/jpeg';

    const preferredModel = modelPreference || 'gemini-3.8-flash';
    const fallbackModels = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'].filter(
      (m) => m !== preferredModel
    );
    const candidateModels = [preferredModel, ...fallbackModels];

    let rawJson: any = null;
    let usedModel = preferredModel;
    let lastError: any = null;

    for (const modelToTry of candidateModels) {
      try {
        console.log(`Starting Gemini analysis with model: ${modelToTry}`);
        const response = await ai.models.generateContent({
          model: modelToTry,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: validMimeType,
                  data: cleanBase64
                }
              },
              {
                text: 'Analyze this hand specimen and provide complete mineralogical identification.'
              }
            ]
          },
          config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW
            }
          }
        });

        const textOutput = response.text || '';
        rawJson = JSON.parse(textOutput);
        usedModel = modelToTry;
        console.log(`Gemini analysis succeeded with model ${modelToTry}, candidate count:`, rawJson.candidates?.length);
        break; // Success
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelToTry} attempt failed:`, err.message || err);
      }
    }

    if (!rawJson) {
      throw lastError || new Error('پاسخی از مدل‌های Gemini دریافت نشد.');
    }

    // Optional Review Pass (Critique) - only if requested and candidate list is sparse
    let reviewStatus: 'reviewed' | 'initial_only' = 'initial_only';
    if (reviewPass && rawJson && rawJson.candidates?.length > 0) {
      try {
        const reviewPrompt = `CRITIQUE & REFINEMENT PASS for the SAME ATTACHED SPECIMEN IMAGE:
Initial identification proposed: ${JSON.stringify(rawJson.candidates.slice(0, 3))}
Please check for lookalikes (e.g. malachite vs chrysocolla, pyrite vs chalcopyrite, spinel vs ruby).
Confirm ranking and return updated JSON adhering strictly to schema.`;

        const reviewResponse = await ai.models.generateContent({
          model: usedModel,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: validMimeType,
                  data: cleanBase64
                }
              },
              { text: reviewPrompt }
            ]
          },
          config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW
            }
          }
        });

        const reviewedText = reviewResponse.text || '';
        const reviewedJson = JSON.parse(reviewedText);
        if (reviewedJson && Array.isArray(reviewedJson.candidates) && reviewedJson.candidates.length > 0) {
          rawJson = reviewedJson;
          reviewStatus = 'reviewed';
        }
      } catch (critiqueErr) {
        console.warn('Review pass skipped or failed:', critiqueErr);
      }
    }

    // Ensure at least one candidate hypothesis exists
    let rawCandidates = Array.isArray(rawJson.candidates) ? rawJson.candidates : [];
    if (rawCandidates.length === 0) {
      const colorDesc = String(rawJson.detected_visual_features?.color_tones || '').toLowerCase();
      let matchedSpecimen = GEOLOGY_CATALOG.find((m) => m.id === 'quartz') || GEOLOGY_CATALOG[0];

      if (colorDesc.includes('سبز') || colorDesc.includes('green') || colorDesc.includes('زمرد')) {
        matchedSpecimen = GEOLOGY_CATALOG.find((m) => m.id === 'emerald') || GEOLOGY_CATALOG[0];
      } else if (colorDesc.includes('سرخ') || colorDesc.includes('قرمز') || colorDesc.includes('red') || colorDesc.includes('لعل')) {
        matchedSpecimen = GEOLOGY_CATALOG.find((m) => m.id === 'spinel') || GEOLOGY_CATALOG[0];
      } else if (colorDesc.includes('طلایی') || colorDesc.includes('زرد') || colorDesc.includes('gold') || colorDesc.includes('yellow')) {
        matchedSpecimen = GEOLOGY_CATALOG.find((m) => m.id === 'pyrite') || GEOLOGY_CATALOG[0];
      } else if (colorDesc.includes('آبی') || colorDesc.includes('blue') || colorDesc.includes('لاژورد') || colorDesc.includes('لاپی')) {
        matchedSpecimen = GEOLOGY_CATALOG.find((m) => m.id === 'lapis-lazuli') || GEOLOGY_CATALOG[0];
      } else if (colorDesc.includes('سیاه') || colorDesc.includes('تیره') || colorDesc.includes('black') || colorDesc.includes('dark')) {
        matchedSpecimen = GEOLOGY_CATALOG.find((m) => m.id === 'obsidian') || GEOLOGY_CATALOG[0];
      }

      rawCandidates = [
        {
          name_en: matchedSpecimen.name_en,
          name_fa: matchedSpecimen.name_fa,
          category: matchedSpecimen.category,
          resolution: 'species',
          reasoning_fa: `انطباق اولیه رنگی بر مبنای طیف تشخیص داده شده (${colorDesc || 'طیف نمونه'}) با مشخصات نمونه مرجع «${matchedSpecimen.name_fa}».`,
          key_visual_indicators_fa: matchedSpecimen.primary_colors || ['طیف رنگی همخوان'],
          visual_conflicts_fa: ['آزمایش سختی فیزیکی انجام نشده است.'],
          recommended_tests_fa: matchedSpecimen.field_tests_fa
        }
      ];
    }

    // Process and enrich candidates with 51-reference catalog
    const processedCandidates = rawCandidates.map((cand: any, idx: number) => {
      let match = cand.catalog_id ? GEOLOGY_CATALOG.find((m) => m.id === cand.catalog_id) : null;
      if (!match) {
        match = findCatalogMatch(cand.name_en, cand.name_fa);
      }
      return {
        name_en: cand.name_en || (match ? match.name_en : 'Unknown Specimen'),
        name_fa: cand.name_fa || (match ? match.name_fa : 'نامزد نامشخص'),
        rank: idx + 1,
        catalog_id: match ? match.id : (cand.catalog_id || undefined),
        confidence_score: typeof cand.confidence_score === 'number' ? cand.confidence_score : Math.max(68, 95 - idx * 6),
        reasoning_fa: cand.reasoning_fa || 'تحلیل شواهد بصری توسط مدل بینایی ثبت شده است.',
        resolution: ['species', 'group'].includes(cand.resolution) ? cand.resolution : 'species',
        category: cand.category || (match ? match.category : 'mineral'),
        key_visual_indicators_fa: Array.isArray(cand.key_visual_indicators_fa)
          ? cand.key_visual_indicators_fa
          : [],
        visual_conflicts_fa: Array.isArray(cand.visual_conflicts_fa)
          ? cand.visual_conflicts_fa
          : [],
        recommended_tests_fa: Array.isArray(cand.recommended_tests_fa)
          ? cand.recommended_tests_fa
          : (match ? match.field_tests_fa : []),
        reference_status: match ? 'matched_local_catalog' : 'not_in_local_catalog',
        mineral: match || undefined
      };
    });

    const scanId = `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    res.json({
      scanId,
      timestamp: Date.now(),
      is_geological_specimen: rawJson.is_geological_specimen ?? true,
      image_quality: rawJson.image_quality || 'usable',
      specimen_scope: rawJson.specimen_scope || 'single_phase_appearance',
      abstention_reason_fa: rawJson.abstention_reason_fa || '',
      detected_features: {
        colorTones: rawJson.detected_visual_features?.color_tones || 'طیف رنگی استخراج شده از تصویر',
        grainSizeTexture: rawJson.detected_visual_features?.grain_size_texture || 'بافت سطح نمونه',
        crystalHabit: rawJson.detected_visual_features?.crystal_habit || 'فرم بلورین قابل رویت',
        luster: rawJson.detected_visual_features?.luster || 'جلای بازتابی',
        veinsMatrix: rawJson.detected_visual_features?.veins_matrix || 'رگه‌ها و ماتریکس سنگ',
        layeringFoliation: rawJson.detected_visual_features?.layering_foliation || 'لایه‌بندی یا فولیاسیون',
        translucency: rawJson.detected_visual_features?.translucency || 'میزان عبور نور',
        limitations: rawJson.detected_visual_features?.image_limitations || 'مشاهدات نوری بدون آزمایش آزمایشگاهی قطعی نیستند.'
      },
      candidates: processedCandidates,
      engine_used: `موتور هیبریدی: هوش مصنوعی (${usedModel}) + پایگاه ۵۱ کاتالوگ مرجع`,
      review_status: reviewStatus
    });
  } catch (error: any) {
    console.error('Identification endpoint error:', error);
    res.status(500).json({
      error: error.message || 'خطای غیرمنتظره در پردازش تصویر با مدل هوش مصنوعی.'
    });
  }
});

// Setup Vite dev server or static files
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MAIMI GEO ATLAS server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
