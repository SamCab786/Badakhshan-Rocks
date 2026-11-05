import React from 'react';
import { Gem, BookOpen, History, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenCatalog: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  engineName: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCatalog,
  onOpenHistory,
  historyCount,
  engineName
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#090e1a]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 flex-shrink-0">
            <Gem className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">
                MAIMI GEO ATLAS
              </span>
              <span className="hidden sm:inline-flex text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800/60 font-semibold">
                V6.2 PRO
              </span>
            </div>
            <div className="text-xs text-slate-400">
              سامانه هوشمند شناسایی ۵۱ گروه سنگ، کانی و جواهرات بدخشان و جهان
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Engine Status Badge */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-semibold text-sky-300">
              هوش مصنوعی {engineName} + کاتالوگ ۵۱ مرجع
            </span>
          </div>

          {/* Catalog Modal Button */}
          <button
            type="button"
            onClick={onOpenCatalog}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-all hover:border-blue-500/50 shadow-sm cursor-pointer"
            aria-label="مشاهده دیتابیس ۵۱ مدخل کاتالوگ"
          >
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>کاتالوگ ۵۱ مرجع</span>
          </button>

          {/* History Button */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-all hover:border-amber-500/50 shadow-sm cursor-pointer relative"
            aria-label="مشاهده سوابق اسکن"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">سوابق</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black font-bold text-[10px] font-mono">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
