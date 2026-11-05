import React from 'react';
import { Sparkles } from 'lucide-react';
import { GEOLOGY_CATALOG } from '../data/geologyCatalog';
import { generateSyntheticSpecimen } from '../utils/imageAnalysis';

interface SampleSpecimensProps {
  onSelectSample: (specimenId: string, dataUrl: string) => void;
  disabled?: boolean;
}

const FEATURED_SAMPLES = [
  { id: 'lapis-lazuli', label: 'لاجورد سرسنگ بدخشان', emoji: '🔵' },
  { id: 'emerald', label: 'زمرد پنجشیر', emoji: '🟢' },
  { id: 'spinel', label: 'لعل کوه بدخشان (اسپینل)', emoji: '🔴' },
  { id: 'pyrite', label: 'پیریت مکعبی طلایی', emoji: '🟡' },
  { id: 'malachite', label: 'مالاکیت نواری عینک', emoji: '🌿' },
  { id: 'native-gold', label: 'طلای طبیعی در کوارتز', emoji: '🪙' },
  { id: 'quartz', label: 'کوارتز بلورین شفاف', emoji: '⚪' },
  { id: 'obsidian', label: 'ابسیدین شیشه آتشفشانی', emoji: '🖤' },
  { id: 'granite', label: 'گرانیت پامیر و هندوکش', emoji: '🪨' }
];

export const SampleSpecimens: React.FC<SampleSpecimensProps> = ({
  onSelectSample,
  disabled
}) => {
  const handleClick = (id: string) => {
    if (disabled) return;
    const mineral = GEOLOGY_CATALOG.find((m) => m.id === id);
    if (!mineral) return;

    const dataUrl = generateSyntheticSpecimen(mineral);
    onSelectSample(id, dataUrl);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold mb-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>نمونه‌های نمایشی سریع کاتالوگ (آزمایش بلادرنگ سیستم بدون نیاز به آپلود فایل):</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {FEATURED_SAMPLES.map((sample) => (
          <button
            key={sample.id}
            type="button"
            disabled={disabled}
            onClick={() => handleClick(sample.id)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 text-slate-300 hover:text-white text-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <span>{sample.emoji}</span>
            <span className="font-medium">{sample.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
