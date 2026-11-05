import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export const ScientificDisclaimer: React.FC = () => {
  return (
    <div className="bg-amber-950/20 border border-amber-500/40 rounded-2xl p-4 sm:p-5 mt-6 text-xs text-amber-200/90 leading-relaxed">
      <div className="flex items-center gap-2 font-bold text-amber-300 mb-2">
        <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span>اعتبارسنجی علمی، حدود صلاحیت بینایی ماشین و سلب مسئولیت زمین‌شناسی:</span>
      </div>
      <p>
        رتبه‌بندی نامزدها بر پایهٔ تحلیل بصری احتمالی مدل‌های هوش مصنوعی میان گونه‌ها و گروه‌های معدنی موجود در کاتالوگ ۵۱ مرجع تنظیم شده است.
        رنگ، بافت و رگه‌بندی مستقیماً از تصویر استخراج می‌شوند؛ اما مقادیر سختی موهس، چگالی (وزن مخصوص)، سیستم بلوری و فرمول کیمیاوی مندرج در گزارش، مشخصات مرجع کانی‌شناسی نامزد انتخابی هستند و روی سنگ حاضر اندازه‌گیری آزمایشگاهی نشده‌اند.
        برای قطعیت کامل علمی، انجام آزمایش‌های مکمل متناسب (مانند خراش سنجی، فیلتر چلسی، طیف‌سنجی Raman یا آنالیز پراش پرتو ایکس XRD) الزامی است.
      </p>
    </div>
  );
};
