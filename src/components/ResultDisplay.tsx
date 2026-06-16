import React, { useState } from "react";
import { 
  FileText, Star, AlertCircle, HelpCircle, 
  ChevronDown, ChevronUp, Printer, CheckCircle2, XCircle, Info
} from "lucide-react";
import { CalculationResult, HeirResult } from "../utils/hanafiInheritance";

interface ResultDisplayProps {
  result: CalculationResult;
}

export default function ResultDisplay({ result }: ResultDisplayProps) {
  const [showExplanationId, setShowExplanationId] = useState<string | null>(null);
  const [showShariaGlossary, setShowShariaGlossary] = useState<boolean>(false);

  const toggleExplanation = (id: string) => {
    setShowExplanationId(showExplanationId === id ? null : id);
  };

  const activeHeirs = result.heirs.filter(h => !h.isExcluded && h.amount > 0);
  const excludedHeirs = result.heirs.filter(h => h.isExcluded || h.amount === 0);

  // Print function
  const handlePrint = () => {
    window.print();
  };

  const getRelationTypeBadge = (type: string) => {
    switch (type) {
      case "zawil_furuz":
        return (
          <span className="px-2 py-0.5 bg-[#8B7355]/15 text-[#8B7355] font-urdu text-[11px] font-semibold border border-[#8B7355]/30 rounded-full">
            اصحاب الفروض
          </span>
        );
      case "asabah":
        return (
          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-urdu text-[11px] font-semibold border border-amber-200 rounded-full">
            عصبہ (Residuary)
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-red-50 text-red-700 font-urdu text-[11px] font-semibold border border-red-150 rounded-full">
            محجوب (محروم)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6" id="result-display-section">
      
      {/* 1. Main Sheet Summary Printable Card */}
      <div className="glass-panel rounded-2xl p-6 border border-[#D4CFC7] relative overflow-hidden print:bg-white print:text-black print:border-none print:shadow-none">
        
        {/* Background seal watermarking */}
        <div className="absolute right-[-20px] top-[-20px] w-48 h-48 bg-[#8B7355]/5 rounded-full border border-[#8B7355]/5 flex items-center justify-center rotate-12 print:hidden">
          <Star className="w-16 h-16 text-[#8B7355]/10" />
        </div>

        {/* Header content */}
        <div className="flex justify-between items-start border-b border-[#D4CFC7] pb-4 mb-6 flex-wrap gap-4">
          <div>
            <span className="text-xs text-[#8B7355] font-urdu tracking-wide uppercase font-bold">تصفیہ ترکہ نامہ</span>
            <h2 className="text-2xl font-bold font-urdu text-[#1A1A1A] mt-1"> تقسیمِ جائیداد کی حتمی رپورٹ</h2>
            <p className="text-xs text-stone-500 mt-1 font-urdu">متروکہ جائیداد سے واجبات مائنس کرنے کے بعد شرعی حصوں کی ترتیب۔</p>
          </div>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-white border border-[#C4B097] hover:bg-[#FAF8F5] transition text-stone-850 hover:text-[#8B7355] text-xs font-semibold rounded-xl flex items-center gap-2 print:hidden cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4 text-[#8B7355]" />
            <span>پرنٹ فائنل رپورٹ</span>
          </button>
        </div>

        {/* Financial Flow Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E1D8]">
            <span className="text-xs font-urdu text-stone-650 block">کل متروکہ اثاثے:</span>
            <span className="text-xl font-bold font-number text-stone-900 mt-1 block">{(result.totalAssets).toLocaleString()} PKR</span>
          </div>
          
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-700">
            <span className="text-xs font-urdu text-stone-605 block">منہا واجبات (قرض + تدفین):</span>
            <span className="text-xl font-bold font-number mt-1 block">
              -{(result.funeralExpenses + result.debts).toLocaleString()}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-900">
            <span className="text-xs font-urdu text-amber-800 block">منہا وصیت:</span>
            <span className="text-xl font-bold font-number mt-1 block">
              -{(result.willAmount).toLocaleString()}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#8B7355]/10 border border-[#8B7355]/30 text-[#8B7355]">
            <span className="text-xs font-urdu block font-semibold text-[#8B7355]">قابل تقسیم ترکہ:</span>
            <span className="text-2xl font-bold font-number mt-1 block">
              {(result.netEstate).toLocaleString()} PKR
            </span>
          </div>
        </div>

        {/* Awl/Radd Applied Status */}
        {result.appliedRule && result.appliedRule !== "normal" && (
          <div className={`p-4 rounded-xl border mb-6 flex items-start gap-3 ${
            result.appliedRule === "awl" 
              ? "bg-amber-50/50 border-amber-200 text-amber-960"
              : "bg-[#F1EDE6] border-[#D4CFC7] text-[#1A1A1A]"
          }`}>
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#8B7355]" />
            <div>
              <h4 className="text-sm font-bold font-urdu text-stone-900">
                {result.appliedRule === "awl" ? "عول کا نفاذ کیا گیا ہے (Al-Awl Rule Applied)" : "رد کا نفاذ کیا گیا ہے (Ar-Radd Rule Applied)"}
              </h4>
              <p className="text-xs mt-1 leading-relaxed text-stone-700 font-urdu">
                {result.appliedRule === "awl" 
                  ? `اصحاب الفروض کے مجموعی حصے (${result.baseNumber ? 'مخرج سے' : '1 سے'}) زیادہ ہو رہے تھے، لہذا شرعی اصولِ عول کے تحت حصوں کے مخرج کو بڑھا کر تمام ورثاء کے ذمے متناسب کٹوتی کر دی گئی ہے۔`
                  : "مقررہ ورثاء کا حصہ تقسیم کرنے کے بعد بھی کچھ مال بچ گیا اور کوئی عصبہ (دوسرا قریبی رشتہ دار) موجود نہ تھا، لہذا رد کے تحت بچا ہوا ترکہ زوجین کے علاوہ باقی ذوی الفروض ورثاء میں متناسب دوبارہ تقسیم کر دیا گیا ہے۔"}
              </p>
            </div>
          </div>
        )}

        {/* 2. Active Heirs Distribution Grid */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#8B7355] font-urdu mb-2 flex items-center gap-1.5 pb-1.5 border-b border-[#E5E1D8]">
            <CheckCircle2 className="w-4 h-4 text-[#8B7355]" />
            حیات ورثاء میں حصوں کی تفصیل:
          </h3>

          {activeHeirs.length === 0 ? (
            <div className="text-center p-6 bg-[#FAF8F5] rounded-xl border border-[#E5E1D8]">
              <p className="text-sm font-urdu text-stone-500">کوئی مستحق وارث درج نہیں کیا گیا۔ براہ کرم دائیں کالم میں ورثاء کا انتخاب کریں۔</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeHeirs.map((heir) => {
                const isExpanded = showExplanationId === heir.id;
                return (
                  <div 
                    key={heir.id}
                    className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E1D8] hover:border-[#C4B097] hover:bg-white transition duration-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      
                      {/* Left Block -> Name and Category */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#8B7355]/10 border border-[#8B7355]/20 text-[#8B7355] font-urdu font-bold text-sm">
                          {heir.nameUrdu.substring(0, 2)}
                        </div>
                        <div>
                          <span className="font-bold text-stone-900 font-urdu text-sm block">{heir.nameUrdu}</span>
                          <div className="flex items-center gap-2 mt-1">
                            {getRelationTypeBadge(heir.relationType)}
                            <span className="text-[10px] text-stone-500 font-number">{heir.nameEnglish}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Block -> fraction, percent and cash */}
                      <div className="flex items-center gap-4 text-left font-number">
                        <div>
                          <span className="text-xs text-stone-550 block font-urdu">شرعی حصہ</span>
                          <span className="text-sm font-bold text-[#8B7355] block text-right mt-0.5">{heir.baseShareText}</span>
                        </div>
                        <div className="h-8 w-[1px] bg-stone-200" />
                        <div>
                          <span className="text-xs text-stone-550 block font-urdu">فیصد حصہ</span>
                          <span className="text-sm font-bold text-stone-800 block text-right mt-0.5">{heir.percentage}%</span>
                        </div>
                        <div className="h-8 w-[1px] bg-stone-200" />
                        <div className="bg-[#F1EDE6] px-3 py-1.5 rounded-lg border border-[#D4CFC7] text-right min-w-[100px]">
                          <span className="text-[10px] text-stone-600 block font-urdu">رقم (روپے)</span>
                          <span className="text-sm font-bold text-[#8B7355] block mt-0.5">{(heir.amount).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                        </div>

                        {/* Dropdown triggering btn */}
                        <button
                          onClick={() => toggleExplanation(heir.id)}
                          className="p-1 rounded-lg bg-white border border-[#C4B097] text-[#8B7355] hover:bg-[#FAF8F5] transition cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>

                    </div>

                    {/* Expandable Explanation of Sharia Justification */}
                    {isExpanded && (
                      <div className="mt-4 p-4 bg-[#F1EDE6]/70 rounded-lg border border-[#D4CFC7] text-xs text-stone-700 leading-relaxed font-urdu">
                        <strong className="text-[#8B7355] block mb-1.5 font-bold">شرعی دلیل و فقہی تعبیر:</strong>
                        {heir.reasonUrdu}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Excluded Heirs Section */}
        {excludedHeirs.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#D4CFC7]">
            <h3 className="text-sm font-bold text-red-800 font-urdu mb-3 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-red-700" />
              محروم (محجوب) ہونے والے ورثاء کی تفصیل:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {excludedHeirs.map(heir => (
                <div key={heir.id} className="p-3 bg-red-50/50 border border-red-200 rounded-xl flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-red-600 mt-1.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-red-900 font-urdu">{heir.nameUrdu} <span className="text-[10px] text-red-700">({heir.nameEnglish})</span></h4>
                    <p className="text-[11px] text-stone-700 font-urdu mt-1 leading-relaxed">
                      {heir.reasonUrdu || "بڑے وارث رشتہ دار کی موجودگی کی وجہ سے محروم۔"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* bottom copyright like seal */}
        <div className="mt-8 pt-4 border-t border-stone-200 text-center font-urdu text-[11px] text-stone-500">
          * یہ تقسیم فقہِ حنفی کی مستند کتاب "السراجی فی المیراث" کے معتبر ضابطوں کے تحت اخذ کی گئی ہے۔
        </div>
      </div>

      {/* 4. Sharia Glossary & Explanations UI Panel */}
      <div className="glass-panel rounded-xl p-4 border border-[#D4CFC7]">
        <button
          onClick={() => setShowShariaGlossary(!showShariaGlossary)}
          className="w-full flex items-center justify-between text-left font-bold text-stone-800 font-urdu text-sm cursor-pointer"
        >
          <span className="flex items-center gap-1.5 text-stone-850">
            <Info className="w-4 h-4 text-[#8B7355]" />
            ورثہ، عصبہ، عول اور رد کی شرعی تعریف جانیں۔
          </span>
          {showShariaGlossary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showShariaGlossary && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#E5E1D8]">
            <div className="p-3.5 bg-[#FAF8F5] border border-[#E5E1D8] rounded-xl">
              <h4 className="text-xs font-bold text-[#8B7355] font-urdu mb-1">اصحاب الفروض (Prescribed Heirs)</h4>
              <p className="text-[11px] text-stone-650 font-urdu leading-relaxed">
                وہ ورثاء جن کے حصے قرآن وحدیث میں متعین کر دیے گئے ہیں۔ جیسے زوجین، والدین، بیٹیاں وغیرہ۔ ان کے کل بارہ گروہ ہیں۔ کل جائیداد سب سے پہلے سائل کے واجبات کے بعد انہی میں تقسیم ہوتی ہے۔
              </p>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] border border-[#E5E1D8] rounded-xl">
              <h4 className="text-xs font-bold text-[#8B7355] font-urdu mb-1">عصبات (Residuaries)</h4>
              <p className="text-[11px] text-stone-650 font-urdu leading-relaxed">
                میت کے وہ قریبی رشتہ دار جو اصحاب الفروض کے حصوں کی تقسیم کے بعد بچ جانے والا تمام ترکہ لے لیتے ہیں۔ جیسے بیٹا، پوتا، حقیقی بھائی وغیرہ۔ اگر اصحاب الفروض نہ ہوں تو عصبات بمفرد پورا ترکہ حاصل کرتے ہیں۔
              </p>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] border border-[#E5E1D8] rounded-xl">
              <h4 className="text-xs font-bold text-[#8B7355] font-urdu mb-1">مسئلہ عول (Al-Awl Rule)</h4>
              <p className="text-[11px] text-stone-650 font-urdu leading-relaxed">
                اگر اصحاب الفروض کے حصوں کا مجموعہ مخرج (denominator) سے زیادہ ہو جائے، تو عول کا اصول استعمال ہوتا ہے۔ اس سے مخرج کو بڑھا کر تمام ورثاء کا حصہ بقدرِ نسبت کم کیا جاتا ہے، جس کی ابتدا حضرت عمر فاروقؓ کے دور میں ہوئی۔
              </p>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] border border-[#E5E1D8] rounded-xl">
              <h4 className="text-xs font-bold text-[#8B7355] font-urdu mb-1">مسئلہ رد (Ar-Radd Rule)</h4>
              <p className="text-[11px] text-stone-650 font-urdu leading-relaxed">
                جب اصحاب الفروض اپنے متعین حصے لے لیں اور جائیداد بیچ جائے، لیکن کوئی عصبہ موجود نہ ہو، تو زائد رقم کو ذوی الفروض پر (سوائے زوجین کے بالعموم) دوبارہ ان کے حصے کی نسبت سے واپس لوٹایا جاتا ہے۔
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
