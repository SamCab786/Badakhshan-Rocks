import React, { useState } from 'react';
import { Sliders, Magnet, Sparkles, ShieldCheck, ChevronDown, ChevronUp, Beaker } from 'lucide-react';
import { PhysicalFieldTraits } from '../utils/mineralMatcher';

interface PhysicalTraitsToolProps {
  traits: PhysicalFieldTraits;
  onChange: (traits: PhysicalFieldTraits) => void;
  disabled?: boolean;
}

export const PhysicalTraitsTool: React.FC<PhysicalTraitsToolProps> = ({
  traits,
  onChange,
  disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeCount = Object.values(traits).filter(
    (v) => v !== undefined && v !== false && v !== ''
  ).length;

  return (
    <div className="mt-3 bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden transition-all">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer bg-slate-900/40 hover:bg-slate-850"
      >
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>افزودن نشانه‌های فیزیکی و آزمایش‌های دستی برای تضمین ۱۰۰٪ صحت تشخیص (اختیاری)</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px]">
              {activeCount} نشانه فعال
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <span className="text-[11px] font-normal">{isOpen ? 'بستن تنظیمات' : 'باز کردن'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-slate-800 space-y-4 bg-slate-950/60 text-xs text-slate-300 animate-fade-in">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            در علم سنگ‌شناسی، عکس به‌تنهایی ۱۰۰٪ کافی نیست زیرا برخی کانی‌ها ظاهر مشابه دارند (مانند پیریت و طلا، یا لاجورد و آزوریت). با علامت زدن مشاهدات لمسی یا آزمایش‌های ساده زیر، سیستم هویت سنگ را با قطعیت کامل تعیین می‌کند.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Hardness */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
              <label className="block text-[11px] text-amber-400 font-bold mb-1">
                سختی تقریبی سنگ:
              </label>
              <select
                value={traits.estimatedHardness || ''}
                onChange={(e) =>
                  onChange({
                    ...traits,
                    estimatedHardness: (e.target.value as any) || undefined
                  })
                }
                disabled={disabled}
                className="w-full bg-slate-950 border border-slate-700 rounded-md p-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="">نامشخص / آزمایش‌نشده</option>
                <option value="very_soft">بسیار نرم (با ناخن خراش برمی‌دارد — تالک/گچ)</option>
                <option value="soft">نرم (با سکه مس خراش می‌خورد — کلسیت/گالن)</option>
                <option value="medium">متوسط (با چاقو خراشیده می‌شود — مالاکیت/فلوریت)</option>
                <option value="hard">سخت (چاقو را پس می‌زند — فلدسپار/پیریت)</option>
                <option value="very_hard">بسیار سخت (شیشه را می‌خراشد — کوارتز/زمرد/لعل)</option>
              </select>
            </div>

            {/* Magnetism */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
              <label className="block text-[11px] text-blue-400 font-bold mb-1">
                خاصیت مغناطیسی (آهنربا):
              </label>
              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="magnetism"
                    checked={traits.isMagnetic === true}
                    onChange={() => onChange({ ...traits, isMagnetic: true })}
                    disabled={disabled}
                    className="text-blue-600 bg-slate-950"
                  />
                  <span>آهنربا را جذب می‌کند (مگنتیت)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="magnetism"
                    checked={traits.isMagnetic === false}
                    onChange={() => onChange({ ...traits, isMagnetic: false })}
                    disabled={disabled}
                    className="text-blue-600 bg-slate-950"
                  />
                  <span>غیرمغناطیسی</span>
                </label>
              </div>
            </div>

            {/* Streak Color */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
              <label className="block text-[11px] text-emerald-400 font-bold mb-1">
                رنگ خاکه (روی پشت کاشی):
              </label>
              <select
                value={traits.streakColor || ''}
                onChange={(e) =>
                  onChange({
                    ...traits,
                    streakColor: (e.target.value as any) || undefined
                  })
                }
                disabled={disabled}
                className="w-full bg-slate-950 border border-slate-700 rounded-md p-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="">نامشخص / آزمایش‌نشده</option>
                <option value="white">سفید یا بی‌رنگ (کوارتز/کلسیت/بریل)</option>
                <option value="black">سیاه / سبزتیره (پیریت/مگنتیت)</option>
                <option value="red_cherry">قرمز آلبالویی/خونی (هماتیت)</option>
                <option value="yellow_gold">زرد طلایی درخشان (طلای اصل)</option>
                <option value="green">سبز روشن (مالاکیت)</option>
                <option value="blue">آبی (آزوریت/لاجورد)</option>
              </select>
            </div>

            {/* Acid Fizz */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
              <label className="block text-[11px] text-purple-400 font-bold mb-1">
                واکنش جوشش با سرکه یا اسید:
              </label>
              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={traits.acidReaction === true}
                    onChange={(e) =>
                      onChange({
                        ...traits,
                        acidReaction: e.target.checked ? true : undefined
                      })
                    }
                    disabled={disabled}
                    className="text-purple-600 bg-slate-950 rounded"
                  />
                  <span>جوشش با گاز CO₂ (کلسیت/مرمر/مالاکیت)</span>
                </label>
              </div>
            </div>
          </div>

          {activeCount > 0 && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => onChange({})}
                className="text-[11px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
              >
                پاک کردن نشانه‌های دستی
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
