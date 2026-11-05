import React, { useRef, useState } from 'react';
import { Upload, Camera, Image as ImageIcon, RefreshCw, Loader2, Cpu, CheckCircle2 } from 'lucide-react';

interface UploadZoneProps {
  imageSrc: string | null;
  onImageSelected: (dataUrl: string, file?: File) => void;
  onAnalyze: (options: { reviewPass: boolean; modelPreference: string }) => void;
  onReset: () => void;
  isAnalyzing: boolean;
  statusMessage: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  imageSrc,
  onImageSelected,
  onAnalyze,
  onReset,
  isAnalyzing,
  statusMessage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [reviewPass, setReviewPass] = useState(true);
  const [modelPreference, setModelPreference] = useState('gemini-3.8-flash');

  const handleFile = (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('لطفاً فرمت‌های مجاز تصویری (JPEG, PNG, WebP) را انتخاب فرمایید.');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      alert('حجم فایل نباید بیش از ۱۲ مگابایت باشد.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onImageSelected(dataUrl, file);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-[#0b1222] border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      {/* Hidden native inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* Main Upload Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !imageSrc && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          isDragOver
            ? 'border-blue-500 bg-blue-500/10'
            : imageSrc
            ? 'border-slate-700 bg-slate-900/50'
            : 'border-slate-700/80 hover:border-blue-500/60 bg-slate-900/30 hover:bg-slate-900/60 cursor-pointer'
        }`}
      >
        {!imageSrc ? (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-900/60 to-indigo-900/40 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
              <Upload className="w-8 h-8 animate-bounce" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white mb-1">
                تصویر سنگ یا کانی را اینجا قرار دهید یا انتخاب کنید
              </h2>
              <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
                عکس باکیفیت و واضحی از نمونه سنگ وارد کنید. هوش مصنوعی شواهد بلورین، رنگ، بافت و رگه‌ها را تحلیل و با کاتالوگ ۵۱ مرجع تطبیق می‌دهد.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                <span>انتخاب عکس سنگ</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>عکس با کمره</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="relative group max-w-xs w-full">
              <img
                src={imageSrc}
                alt="نمونه سنگ انتخاب‌شده"
                className="w-full max-h-64 object-contain rounded-xl border border-slate-700 shadow-xl bg-black/40"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
                >
                  تغییر عکس
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReset();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold"
                >
                  حذف
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>تغییر تصویر</span>
              </button>
              <button
                type="button"
                onClick={onReset}
                disabled={isAnalyzing}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 text-xs font-semibold border border-slate-700 cursor-pointer"
              >
                پاک کردن
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Control & Engine Settings */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        {/* Settings: Model selection & review pass */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <label htmlFor="modelPreference" className="text-slate-400">موتور بینایی:</label>
            <select
              id="modelPreference"
              value={modelPreference}
              onChange={(e) => setModelPreference(e.target.value)}
              disabled={isAnalyzing}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="gemini-3.8-flash">Gemini 3.8 Flash (پیشنهادی - فوق‌سریع)</option>
              <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
              <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={reviewPass}
              onChange={(e) => setReviewPass(e.target.checked)}
              disabled={isAnalyzing}
              className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
            />
            <span className="text-slate-300">بازبینی موشکافانه دومرحله‌ای (Critique Pass)</span>
          </label>
        </div>

        {/* Action Button */}
        <div>
          <button
            type="button"
            onClick={() => onAnalyze({ reviewPass, modelPreference })}
            disabled={!imageSrc || isAnalyzing}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all ${
              !imageSrc || isAnalyzing
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30 cursor-pointer active:scale-95'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>در حال تحلیل...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>تحلیل هوشمند تصویر</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress & Status Bar */}
      {statusMessage && (
        <div className="mt-3 py-2 px-3 rounded-lg bg-blue-950/40 border border-blue-900/60 text-xs text-blue-200 flex items-center gap-2 animate-fade-in">
          {isAnalyzing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400 flex-shrink-0" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
          )}
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
};
