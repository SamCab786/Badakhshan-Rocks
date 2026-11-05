import React from 'react';
import { X, Trash2, History, RotateCcw } from 'lucide-react';
import { HistoryItem } from '../types/geology';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onSelectHistoryItem,
  onClearHistory
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0b1222] border-r border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl animate-slide-left">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-sm text-white">
              سوابق اسکن‌های انجام‌شده ({items.length})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950/40 border border-rose-900/60 cursor-pointer"
                title="پاک‌کردن سوابق"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>پاک‌سازی</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {items.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              هنوز هیچ اسکن یا تحلیلی در این مرورگر ثبت نشده است.
            </div>
          ) : (
            items.map((entry) => (
              <div
                key={entry.id}
                onClick={() => {
                  onSelectHistoryItem(entry);
                  onClose();
                }}
                className="p-3 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {entry.thumbnailSrc ? (
                    <img
                      src={entry.thumbnailSrc}
                      alt={entry.primaryNameFa}
                      className="w-11 h-11 rounded-lg object-cover border border-slate-700 flex-shrink-0 bg-black/40"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold flex-shrink-0">
                      🪨
                    </div>
                  )}

                  <div className="truncate">
                    <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                      {entry.primaryNameFa}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate" dir="ltr">
                      {entry.primaryNameEn}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(entry.timestamp).toLocaleTimeString('fa-IR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} • {entry.engine}
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-slate-400 group-hover:text-blue-400">
                  <RotateCcw className="w-4 h-4" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
