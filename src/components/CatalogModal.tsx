import React, { useState, useMemo } from 'react';
import { X, Search, Filter, Sparkles, BookOpen, ExternalLink, MapPin } from 'lucide-react';
import { GEOLOGY_CATALOG } from '../data/geologyCatalog';
import { MineralSpecimen } from '../types/geology';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSpecimenToTest: (mineral: MineralSpecimen) => void;
  initialSelectedId?: string | null;
}

export const CatalogModal: React.FC<CatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectSpecimenToTest,
  initialSelectedId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeDetailItem, setActiveDetailItem] = useState<MineralSpecimen | null>(null);

  // Sync initial selection
  React.useEffect(() => {
    if (initialSelectedId) {
      const match = GEOLOGY_CATALOG.find((m) => m.id === initialSelectedId);
      if (match) setActiveDetailItem(match);
    }
  }, [initialSelectedId]);

  const filteredCatalog = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return GEOLOGY_CATALOG.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!q) return true;
      return (
        item.name_fa.toLowerCase().includes(q) ||
        item.name_en.toLowerCase().includes(q) ||
        item.formula.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.badakhshan_afghanistan_notes_fa.toLowerCase().includes(q) ||
        item.diagnostic_features_fa.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b1222] border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                پایگاه مرجع ۵۱ گونه و گروه سنگ، کانی و جواهرات
              </h2>
              <p className="text-xs text-slate-400">
                شامل کانسارهای بدخشان، پنجشیر، نورستان، کابل و نمونه‌های کلیدی زمین‌شناسی جهان
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="بستن پنجره کاتالوگ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/30 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو بر اساس نام دری، انگلیسی، فرمول یا معدن (مثال: لاجورد، زمرد، Be3Al2، پنجشیر، سرسنگ)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {[
              { id: 'all', label: 'همه ۵۱ مدخل' },
              { id: 'gemstone', label: 'سنگ‌های قیمتی و جواهرات' },
              { id: 'mineral', label: 'کانی‌های معدنی' },
              { id: 'igneous', label: 'سنگ‌های آذرین' },
              { id: 'metamorphic', label: 'سنگ‌های دگرگونی' },
              { id: 'sedimentary', label: 'سنگ‌های رسوبی' }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
            <span className="mr-auto text-slate-500 text-[11px] self-center">
              نمایش {filteredCatalog.length} از ۵۱ مورد
            </span>
          </div>
        </div>

        {/* Catalog Grid View */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCatalog.map((item) => {
            const isSelected = activeDetailItem?.id === item.id;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-500 shadow-lg'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="font-bold text-sm text-white">{item.name_fa}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                      {item.category_fa.split(' ')[0]}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono mb-2" dir="ltr">
                    {item.name_en}
                  </div>

                  <div className="text-xs font-mono text-amber-300/90 mb-2 break-all bg-black/30 px-2 py-1 rounded border border-slate-800" dir="ltr">
                    {item.formula}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-300 mb-2">
                    <span>
                      سختی: <strong className="text-amber-400">{item.mohs_display}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      چگالی: <strong className="text-white">{item.sg_display}</strong>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {item.badakhshan_afghanistan_notes_fa}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/70 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectSpecimenToTest(item);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>آزمایش تصویر این سنگ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveDetailItem(isSelected ? null : item)}
                    className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    {isSelected ? 'بستن جزئیات' : 'مشاهده بیشتر'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Specimen Full Details Drawer (if open) */}
        {activeDetailItem && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-200 animate-slide-up max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between gap-2 font-bold text-amber-400 mb-1.5">
              <span>جزئیات تخصصی: {activeDetailItem.name_fa} ({activeDetailItem.name_en})</span>
              <button
                type="button"
                onClick={() => setActiveDetailItem(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                بستن
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 leading-relaxed">
              <div>
                <strong>خاستگاه: </strong>{activeDetailItem.badakhshan_afghanistan_notes_fa}
              </div>
              <div>
                <strong>ویژگی‌های تشخیصی: </strong>{activeDetailItem.diagnostic_features_fa}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
