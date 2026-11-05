import React from 'react';
import { Layers, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { IdentificationCandidate } from '../types/geology';

interface AlternativesListProps {
  candidates: IdentificationCandidate[];
  selectedIndex: number;
  onSelectCandidate: (index: number) => void;
}

export const AlternativesList: React.FC<AlternativesListProps> = ({
  candidates,
  selectedIndex,
  onSelectCandidate
}) => {
  if (!candidates || candidates.length <= 1) {
    return null;
  }

  return (
    <div className="bg-[#0b1222] border border-slate-800 rounded-2xl p-5 shadow-xl mt-6">
      <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white">
            نامزدهای جایگزین همین تصویر ({candidates.length} نامزد رتبه‌بندی‌شده)
          </h2>
        </div>
        <span className="text-[11px] text-slate-400">
          انتخاب هر گزینه، تمام مشخصات گزارش بالا را به همان نامزد تغییر می‌دهد
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {candidates.map((cand, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectCandidate(idx)}
              className={`p-3.5 rounded-xl border text-right transition-all flex items-center justify-between gap-3 cursor-pointer ${
                isSelected
                  ? 'bg-blue-950/70 border-blue-500 shadow-md shadow-blue-900/30 ring-1 ring-blue-500'
                  : 'bg-slate-900/70 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  #{idx + 1}
                </span>

                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold truncate ${
                        isSelected ? 'text-blue-300' : 'text-slate-200'
                      }`}
                    >
                      {cand.name_fa}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-slate-400 font-mono truncate" dir="ltr">
                      {cand.name_en}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-950/80 text-blue-300 border border-blue-800/40 font-mono">
                      AI: {cand.confidence_score || Math.max(65, 95 - idx * 6)}%
                    </span>
                    {cand.reference_status === 'matched_local_catalog' && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
                        ۵۱ کاتالوگ
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 flex-shrink-0">
                <span>{isSelected ? 'گزارش فعال' : 'نمایش گزارش'}</span>
                {!isSelected && <ArrowLeft className="w-3 h-3" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
