import React, { useState, useMemo } from "react";
import { Compass, BookOpen, Scale, Star, Share2 } from "lucide-react";
import Header from "./components/Header";
import AssetsForm from "./components/AssetsForm";
import HeirsForm from "./components/HeirsForm";
import ResultDisplay from "./components/ResultDisplay";
import AiConsultant from "./components/AiConsultant";
import { calculateInheritance, HeirsInput, EstateInput } from "./utils/hanafiInheritance";

export default function App() {
  const [deceasedGender, setDeceasedGender] = useState<"male" | "female">("male");

  // Local state for exact heirs checklist and values
  const [heirs, setHeirs] = useState<HeirsInput>({
    husband: false,
    wivesCount: 0,
    sonsCount: 0,
    daughtersCount: 0,
    father: false,
    mother: false,
    grandfather: false,
    grandmotherPaternal: false,
    grandmotherMaternal: false,
    realBrothersCount: 0,
    realSistersCount: 0,
    paternalBrothersCount: 0,
    paternalSistersCount: 0,
    uterineBrothersCount: 0,
    uterineSistersCount: 0,
    grandsonsCount: 0,
    granddaughtersCount: 0,
    unclesCount: 0
  });

  const [estate, setEstate] = useState<EstateInput>({
    totalAssets: 0,
    funeralExpenses: 0,
    debts: 0,
    willAmount: 0
  });

  // Calculate in real-time on any input state variable change
  const calcResult = useMemo(() => {
    return calculateInheritance(heirs, estate);
  }, [heirs, estate]);

  // Construct short string Urdu summary to feed the AI prompt generator helper
  const summaryExplanationText = useMemo(() => {
    const lines = [
      `میت کا صنف: ${deceasedGender === "male" ? "مرد" : "عورت"}`,
      `کل ترکہ: ${estate.totalAssets}`,
      `تجہیز و تکفین اخراجات: ${estate.funeralExpenses}`,
      `قرضہ جات: ${estate.debts}`,
      `وصیت: ${estate.willAmount}`,
      `قابل تقسیم ترکہ: ${calcResult.netEstate}`,
    ];

    calcResult.heirs.forEach(h => {
      if (h.isExcluded) {
        lines.push(`${h.nameUrdu}: محجوب (محروم) کیونکہ ${h.reasonUrdu}`);
      } else if (h.amount > 0) {
        lines.push(`${h.nameUrdu}: حصہ ${h.baseShareText} (${h.percentage}%) رقم ${h.amount}`);
      }
    });

    return lines.join("\n");
  }, [deceasedGender, heirs, estate, calcResult]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-850 flex flex-col selection:bg-[#8B7355]/20 selection:text-[#8B7355] pb-12 print:bg-white print:text-black">
      
      {/* Visual background atmospheric overlays */}
      <div className="absolute left-1/4 top-0 w-[500px] h-[500px] bg-[#8B7355]/3 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute right-1/4 bottom-10 w-[400px] h-[400px] bg-amber-500/3 rounded-full blur-[100px] pointer-events-none" />

      {/* Primary responsive grid container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative z-10">
        
        {/* Dynamic header summary banner */}
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Block -> Forms and inputs (5 columns wide in large screen) */}
          <div className="lg:col-span-5 space-y-8 print:hidden">
            <AssetsForm 
              value={estate} 
              onChange={setEstate} 
            />

            <HeirsForm 
              value={heirs} 
              onChange={setHeirs} 
              deceasedGender={deceasedGender}
              setDeceasedGender={setDeceasedGender}
            />
          </div>

          {/* Right Block -> Calculations, Results sheet, and AI assistant interface (7 columns wide) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Realtime Interactive Mathematical Table sheet Display */}
            <ResultDisplay result={calcResult} />

            {/* Smart Gemini AI Scholar consult interface block */}
            <div className="print:hidden">
              <AiConsultant 
                calculationResult={calcResult} 
                estateSummaryUrduText={summaryExplanationText}
              />
            </div>

            {/* Jurisprudential End Remarks Card */}
            <div className="p-5 rounded-2xl bg-[#F1EDE6] border border-[#D4CFC7] text-center leading-relaxed font-urdu text-stone-700 shadow-sm text-xs sm:text-sm">
              <p>
                <strong>ضروری شرعی نوٹ:</strong> یہ تقسیم علامہ ابن عابدین شامی رحمہ اللہ اور معتبر کتبِ فتاویٰ حنفیہ کے مصدقہ اصول عول، رد، اور اقربِ حجب کے مسلمہ ضابطوں پر تیار کی گئی ہے۔ تاہم، کسی بھی خاندانی تنازعہ یا پیچیدہ معاملے میں قریبی دارالافتاء سے حتمی تصدیق مستحسن ہے۔
              </p>
            </div>

          </div>

        </div>

      </main>

      {/* Simple visually integrated footer */}
      <footer className="w-full text-center border-t border-[#D4CFC7] py-8 text-stone-500 text-[11px] font-urdu print:hidden flex flex-col items-center justify-center gap-1.5 mt-auto">
        <div className="flex items-center gap-1 text-xs">
          <Scale className="w-4 h-4 text-[#8B7355]" />
          <span className="font-semibold text-stone-850">حنفی میراث کیلکولیٹر © 2026</span>
        </div>
        <p className="opacity-80">علم فرائض و اصول حنفیہ کی ترویج کا ایک علمی و ٹیکنالوجیکل کارنامہ</p>
      </footer>
    </div>
  );
}
