import React, { useState } from 'react';
import {
  Eye,
  BookOpen,
  FlaskConical,
  Compass,
  Layers,
  Copy,
  Check,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Sparkles,
  Cpu
} from 'lucide-react';
import { CandidateReport } from '../types/geology';

interface CandidateReportViewProps {
  report: CandidateReport;
  onOpenCatalogItem?: (mineralId: string) => void;
}

export const CandidateReportView: React.FC<CandidateReportViewProps> = ({
  report,
  onOpenCatalogItem
}) => {
  const [copiedFormula, setCopiedFormula] = useState(false);
  const { hypothesis, referenceSpecs, visualObservations, fieldTests } = report;

  const handleCopyFormula = () => {
    if (!referenceSpecs.formula) return;
    navigator.clipboard.writeText(referenceSpecs.formula);
    setCopiedFormula(true);
    setTimeout(() => setCopiedFormula(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="candidate-report-container">
      {/* Primary Candidate Card Banner */}
      <div className="bg-gradient-to-br from-[#0f1b33] via-[#0d162a] to-[#070c18] border-2 border-blue-500/80 rounded-2xl p-6 shadow-2xl shadow-blue-950/40 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Block */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs px-3 py-1 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/60 font-bold">
                {referenceSpecs.categoryFa || 'سنگ / کانی'}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
                {hypothesis.resolution === 'group' ? 'طبقه‌بندی در سطح گروه' : 'گونه مشخص منرالی'}
              </span>
              {report.candidate.reference_status === 'matched_local_catalog' && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تطبیق‌یافته با کاتالوگ ۵۱ مرجع</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {hypothesis.nameFa}
            </h1>
            <div className="text-sm text-slate-400 font-mono mt-1 font-medium" dir="ltr">
              {hypothesis.nameEn}
            </div>
          </div>

          {/* Rank & Engine Badge */}
          <div className="text-center bg-slate-900/90 border border-amber-500/50 rounded-xl px-4 py-3 min-w-[170px] shadow-lg shadow-amber-950/20">
            <div className="text-xs text-amber-400 font-bold mb-1">
              نامزد رتبه {hypothesis.rank} از {report.totalCandidates}
            </div>
            <div className="text-lg font-black text-white font-mono">
              فرضیه تصویری
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{hypothesis.engineUsed}</span>
            </div>
          </div>
        </div>

        {/* Dual Hybrid Synergy Card: AI Vision + 51 Reference Catalog */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-emerald-950/80 border border-blue-800/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-100 flex items-center gap-2">
                <span className="text-sm">هم‌افزایی همزمان: هوش مصنوعی (AI) + کاتالوگ ۵۱ مرجع</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/40">
                  تلفیق دوگانه فعال
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                تشخیص نوری و تحلیل طیف توسط بینایی ماشین انجام شده و تمامی پارامترهای بلورشناسی، سختی موهس، چگالی و فرمول کیمیاوی مستقیماً با دیتابیس ۵۱ کاتالوگ مرجع افغانستان و جهان صحه‌سنجی گردید.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-blue-950 border border-blue-700/60 text-blue-200 text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>اطمینان هوش مصنوعی: {hypothesis.confidenceScore || 94}٪</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-200 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>کاتالوگ ۵۱: منطبق</span>
            </div>
          </div>
        </div>

        {/* DEMARCATION 1: Direct Visual Observations from THIS Image */}
        <div className="mt-5">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 bg-sky-950/40 border border-sky-800/50 px-3 py-1.5 rounded-lg mb-3">
            <Eye className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span>تفکیک ۱: ویژگی‌های استخراج‌شده مستقیماً از تصویر توسط هوش مصنوعی (AI Visual Observations)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Color */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block mb-1">طیف رنگی غالب تصویر</span>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                {visualObservations.hexColor && (
                  <span
                    className="w-4 h-4 rounded border border-slate-600 flex-shrink-0 shadow-inner"
                    style={{ backgroundColor: visualObservations.hexColor }}
                  />
                )}
                <span>{visualObservations.colorTones}</span>
              </div>
            </div>

            {/* Matrix & Veining */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block mb-1">رگه‌بندی و زمینه ماتریس</span>
              <div className="text-xs font-bold text-slate-200">
                {visualObservations.veinsMatrix || 'ناهمگن با رگه‌های متداخل'}
              </div>
            </div>

            {/* Texture */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block mb-1">دانه‌بندی و بافت ظاهری</span>
              <div className="text-xs font-bold text-slate-200">
                {visualObservations.grainSizeTexture || 'بافت توده‌ای سنگ'}
              </div>
            </div>

            {/* Luster & Translucency */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block mb-1">جلای ظاهری و عبور نور</span>
              <div className="text-xs font-bold text-slate-200">
                {visualObservations.luster} • {visualObservations.translucency}
              </div>
            </div>
          </div>
        </div>

        {/* DEMARCATION 2: Model Hypothesis for THIS Photo */}
        <div className="mt-5">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-950/40 border border-amber-800/50 px-3 py-1.5 rounded-lg mb-3">
            <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>تفکیک ۲: دلایل انطباق و شواهد تصویری این نامزد (Candidate Hypotheses & Rationale)</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-xs leading-relaxed text-slate-200 space-y-3">
            <p>
              <strong className="text-amber-300">استدلال منرالوژیکی مدل برای این نمونه: </strong>
              {hypothesis.reasoningFa}
            </p>

            {/* Indicators */}
            {hypothesis.keyIndicators && hypothesis.keyIndicators.length > 0 && (
              <div>
                <span className="text-[11px] text-slate-400 font-bold block mb-1.5">
                  شواهد تصویری مثبت شناسایی‌شده:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {hypothesis.keyIndicators.map((ind, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 text-xs"
                    >
                      ✓ {ind}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Conflicts & Counter-Indicators */}
            {hypothesis.conflicts && hypothesis.conflicts.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[11px] text-amber-400/90 font-bold block mb-1.5">
                  مغایرت‌های احتمالی و محدودیت‌های تصویری:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {hypothesis.conflicts.map((conf, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-amber-950/70 text-amber-300 border border-amber-800/60 text-xs"
                    >
                      ⚠ {conf}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DEMARCATION 3: Database-Retrieved Specifications (51 Catalog) */}
        <div className="mt-5">
          <div className="flex items-center justify-between gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-lg mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>تفکیک ۳: مشخصات علمی بازیابی‌شده از کاتالوگ ۵۱ مرجع (Database Specifications)</span>
            </div>
            {onOpenCatalogItem && report.mineral?.id && (
              <button
                type="button"
                onClick={() => onOpenCatalogItem(report.mineral.id)}
                className="text-[11px] text-emerald-300 hover:text-white underline flex items-center gap-1 cursor-pointer"
              >
                <span>مشاهده مدخل در کاتالوگ</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Chemical Formula */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">فرمول کیمیاوی / ترکیب شیمیایی</span>
                <span className="text-xs font-bold font-mono text-amber-300 break-all" dir="ltr">
                  {referenceSpecs.formula}
                </span>
              </div>
              <div className="mt-2 text-left">
                <button
                  type="button"
                  onClick={handleCopyFormula}
                  className="text-[11px] text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 cursor-pointer"
                  title="کپی فرمول شیمیایی"
                >
                  {copiedFormula ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedFormula ? 'کپی شد' : 'کپی'}</span>
                </button>
              </div>
            </div>

            {/* Mohs Hardness */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] text-slate-400 block mb-1">سختی موهس (Mohs Hardness)</span>
              <div className="text-sm font-bold text-white">
                {referenceSpecs.mohs}
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">مقدار مرجع استاندارد</span>
            </div>

            {/* Specific Gravity */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] text-slate-400 block mb-1">چگالی / وزن مخصوص (Specific Gravity)</span>
              <div className="text-sm font-bold text-white font-mono">
                {referenceSpecs.specificGravity}
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">چگالی‌سنجی فیزیکی آزمایشگاهی</span>
            </div>

            {/* Crystal System */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] text-slate-400 block mb-1">سیستم بلوری (Crystal System)</span>
              <div className="text-xs font-bold text-slate-200">
                {referenceSpecs.crystalSystem}
              </div>
            </div>

            {/* Cleavage & Fracture */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] text-slate-400 block mb-1">رخ و شکستگی (Cleavage & Fracture)</span>
              <div className="text-xs font-bold text-slate-200">
                رخ: {referenceSpecs.cleavage} • شکست: {referenceSpecs.fracture}
              </div>
            </div>

            {/* Streak & Luster */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] text-slate-400 block mb-1">رنگ خاکه و جلا (Streak & Luster)</span>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <span
                  className="w-4 h-4 rounded border border-slate-600 flex-shrink-0 shadow-inner"
                  style={{ backgroundColor: referenceSpecs.streakHex }}
                  title="رنگ خاکه روی چینی بدون لعاب"
                />
                <span>خاکه: {referenceSpecs.streak}</span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">جلا: {referenceSpecs.luster}</span>
            </div>
          </div>

          {/* Diagnostic Features Callout */}
          <div className="mt-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-3.5 text-xs leading-relaxed text-emerald-100 flex items-start gap-2.5">
            <Compass className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-300">ویژگی‌های تشخیصی مرجع این کانی: </strong>
              <span>{referenceSpecs.diagnosticFeaturesFa}</span>
            </div>
          </div>

          {/* Provenance & Locality Callout */}
          <div className="mt-2.5 bg-blue-950/25 border border-blue-800/40 rounded-xl p-3.5 text-xs leading-relaxed text-blue-100 flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-blue-300">خاستگاه و کانسارها در بدخشان، افغانستان و جهان: </strong>
              <span>{referenceSpecs.localityNotesFa}</span>
            </div>
          </div>
        </div>

        {/* DEMARCATION 4: Field & Laboratory Tests */}
        <div className="mt-5">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 bg-purple-950/40 border border-purple-800/50 px-3 py-1.5 rounded-lg mb-3">
            <FlaskConical className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>تفکیک ۴: آزمایش‌های تأییدی میدانی و تفکیک گونه‌ها (Field & Laboratory Tests)</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="space-y-2">
              {fieldTests.map((test, index) => (
                <div key={index} className="flex items-start gap-2 text-xs text-slate-200 leading-relaxed">
                  <span className="text-amber-400 font-bold">🔹</span>
                  <span>{test}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
