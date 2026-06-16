import React from "react";
import { UserCheck, Users, Shield, Plus, Minus, Info } from "lucide-react";
import { HeirsInput } from "../utils/hanafiInheritance";

interface HeirsFormProps {
  value: HeirsInput;
  onChange: (value: HeirsInput) => void;
  deceasedGender: "male" | "female";
  setDeceasedGender: (gender: "male" | "female") => void;
}

export default function HeirsForm({ value, onChange, deceasedGender, setDeceasedGender }: HeirsFormProps) {
  
  const handleGenderToggle = (gender: "male" | "female") => {
    setDeceasedGender(gender);
    if (gender === "male") {
      // Men cannot leave behind husbands
      onChange({
        ...value,
        husband: false
      });
    } else {
      // Women cannot leave behind wives
      onChange({
        ...value,
        wivesCount: 0
      });
    }
  };

  const updateField = (key: keyof HeirsInput, val: any) => {
    onChange({
      ...value,
      [key]: val
    });
  };

  const adjustCount = (key: keyof HeirsInput, increment: boolean, limit: number = 20) => {
    const current = (value[key] as number) || 0;
    const nextValue = increment ? Math.min(limit, current + 1) : Math.max(0, current - 1);
    updateField(key, nextValue);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-[#D4CFC7]" id="heirs-form-panel">
      <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-[#D4CFC7]">
        <div className="p-2.5 bg-[#8B7355]/10 text-[#8B7355] rounded-lg border border-[#8B7355]/20">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-urdu text-[#1A1A1A]">مرحلہ 2: متوفی اور ورثاء کی تفصیل</h2>
          <p className="text-xs text-stone-500 font-urdu">مرحوم کا صنف منتخب کریں اور حیات ورثاء کی تعداد درج کریں۔</p>
        </div>
      </div>

      {/* Deceased Gender */}
      <div className="mb-6 bg-[#F1EDE6] p-4 rounded-xl border border-[#D4CFC7]">
        <label className="block text-xs text-stone-800 font-urdu mb-2.5 font-semibold">1۔ مرحوم کا صنف (جنس):</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className={`py-2 px-4 rounded-xl text-sm font-semibold font-urdu border transition-all duration-300 cursor-pointer ${
              deceasedGender === "male"
                ? "bg-gradient-to-br from-[#8B7355] to-[#705c43] border-[#8B7355] text-white shadow-md"
                : "bg-white border-[#C4B097] text-stone-750 hover:bg-[#FAF8F5]"
            }`}
            onClick={() => handleGenderToggle("male")}
          >
            مرد (متوفی)
          </button>
          <button
            type="button"
            className={`py-2 px-4 rounded-xl text-sm font-semibold font-urdu border transition-all duration-300 cursor-pointer ${
              deceasedGender === "female"
                ? "bg-gradient-to-br from-[#8B7355] to-[#705c43] border-[#8B7355] text-white shadow-md"
                : "bg-white border-[#C4B097] text-stone-750 hover:bg-[#FAF8F5]"
            }`}
            onClick={() => handleGenderToggle("female")}
          >
            عورت (متوفیٰ)
          </button>
        </div>
      </div>

      {/* Heirs Sections */}
      <div className="space-y-6">
        
        {/* spouses section */}
        <div>
          <h3 className="text-xs font-bold text-[#8B7355] font-urdu tracking-wider uppercase mb-3 flex items-center gap-1.5 border-b border-[#E5E1D8] pb-1.5">
            <Shield className="w-3.5 h-3.5" />
            زوجین (شریکِ حیات)
          </h3>
          
          {deceasedGender === "female" ? (
            <div className="flex items-center justify-between p-3.5 bg-[#FAF8F5] border border-[#E5E1D8] hover:bg-[#F1EDE6]/50 rounded-xl transition duration-200">
              <span className="text-sm font-urdu text-stone-800 font-medium">شوہر حیات ہے؟</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={value.husband}
                  onChange={(e) => updateField("husband", e.target.checked)}
                />
                <div className="w-11 h-6 bg-stone-200 border border-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-[#C4B097] after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8B7355] peer-checked:after:bg-white" />
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 bg-[#FAF8F5] border border-[#E5E1D8] rounded-xl">
              <div className="flex flex-col">
                <span className="text-sm font-urdu text-stone-800 font-medium">بیوی (شریک حیات کی تعداد)</span>
                <span className="text-[10px] text-stone-500 font-urdu">زیادہ سے زیادہ 4 حیات بیویاں</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => adjustCount("wivesCount", false)}
                  className="p-1 rounded-lg bg-white text-stone-700 border border-[#C4B097] hover:bg-[#F1EDE6] transition"
                  disabled={value.wivesCount === 0}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-number font-bold text-stone-900 text-base w-6 text-center">{value.wivesCount}</span>
                <button
                  type="button"
                  onClick={() => adjustCount("wivesCount", true, 4)}
                  className="p-1 rounded-lg bg-white text-stone-700 border border-[#C4B097] hover:bg-[#F1EDE6] transition"
                  disabled={value.wivesCount === 4}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Descendants (فروع) */}
        <div>
          <h3 className="text-xs font-bold text-[#8B7355] font-urdu tracking-wider uppercase mb-3 flex items-center gap-1.5 border-b border-[#E5E1D8] pb-1.5">
            <Shield className="w-3.5 h-3.5" />
            فروع (اولاد اور ان کی نسل)
          </h3>

          <div className="space-y-3">
            {[
              { label: "بیٹے", key: "sonsCount" as keyof HeirsInput },
              { label: "بیٹیاں", key: "daughtersCount" as keyof HeirsInput },
              { label: "پوتے (بیٹے کا بیٹا)", key: "grandsonsCount" as keyof HeirsInput },
              { label: "پوتیاں (بیٹے کی بیٹی)", key: "granddaughtersCount" as keyof HeirsInput }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 bg-[#FAF8F5] border border-[#E5E1D8] hover:bg-[#F1EDE6]/50 rounded-xl transition duration-200">
                <span className="text-sm font-urdu text-stone-800 font-medium">{item.label}</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => adjustCount(item.key, false)}
                    className="p-1 rounded-lg bg-white text-stone-700 border border-[#C4B097] hover:bg-[#F1EDE6] transition"
                    disabled={(value[item.key] as number) === 0}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-number font-bold text-stone-900 text-base w-6 text-center">{value[item.key] as number}</span>
                  <button
                    type="button"
                    onClick={() => adjustCount(item.key, true)}
                    className="p-1 rounded-lg bg-white text-stone-700 border border-[#C4B097] hover:bg-[#F1EDE6] transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ancestors (اصول) */}
        <div>
          <h3 className="text-xs font-bold text-[#8B7355] font-urdu tracking-wider uppercase mb-3 flex items-center gap-1.5 border-b border-[#E5E1D8] pb-1.5">
            <Shield className="w-3.5 h-3.5" />
            اصول (والدین اور اعلیٰ اجداد)
          </h3>

          <div className="space-y-3">
            {[
              { label: "والد محترم", key: "father" as keyof HeirsInput },
              { label: "والدہ ماجدہ", key: "mother" as keyof HeirsInput },
              { label: "دادا (پدری دادا)", key: "grandfather" as keyof HeirsInput },
              { label: "دادی (باپ کی ماں)", key: "grandmotherPaternal" as keyof HeirsInput },
              { label: "نانی (ماں کی ماں)", key: "grandmotherMaternal" as keyof HeirsInput }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 bg-[#FAF8F5] border border-[#E5E1D8] hover:bg-[#F1EDE6]/50 rounded-xl transition duration-200">
                <span className="text-sm font-urdu text-stone-800 font-medium">{item.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={!!value[item.key]}
                    onChange={(e) => updateField(item.key, e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-stone-200 border border-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-[#C4B097] after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8B7355] peer-checked:after:bg-white" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Siblings (بہن بھائی) */}
        <div>
          <h3 className="text-xs font-bold text-[#8B7355] font-urdu tracking-wider uppercase mb-3 flex items-center gap-1.5 border-b border-[#E5E1D8] pb-1.5">
            <Shield className="w-3.5 h-3.5" />
            حواشی (حقیقی، علاتی اور اخیافی بہن بھائی)
          </h3>

          <div className="space-y-3">
            {[
              { label: "حقیقی بھائی", key: "realBrothersCount" as keyof HeirsInput },
              { label: "حقیقی بہنیں", key: "realSistersCount" as keyof HeirsInput },
              { label: "علاتی بھائی (ماں شریک نہیں لیکن باپ شریک)", key: "paternalBrothersCount" as keyof HeirsInput },
              { label: "علاتی بہنیں (ماں شریک نہیں لیکن باپ شریک)", key: "paternalSistersCount" as keyof HeirsInput },
              { label: "اخیافی بھائی (باپ شریک نہیں لیکن ماں شریک)", key: "uterineBrothersCount" as keyof HeirsInput },
              { label: "اخیافی بہنیں (باپ شریک نہیں لیکن ماں شریک)", key: "uterineSistersCount" as keyof HeirsInput }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 bg-[#FAF8F5] border border-[#E5E1D8] hover:bg-[#F1EDE6]/50 rounded-xl transition duration-200">
                <div className="flex flex-col">
                  <span className="text-sm font-urdu text-stone-800 font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => adjustCount(item.key, false)}
                    className="p-1 rounded-lg bg-white text-stone-700 border border-[#C4B097] hover:bg-[#F1EDE6] transition"
                    disabled={(value[item.key] as number) === 0}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-number font-bold text-stone-900 text-base w-6 text-center">{value[item.key] as number}</span>
                  <button
                    type="button"
                    onClick={() => adjustCount(item.key, true)}
                    className="p-1 rounded-lg bg-white text-stone-700 border border-[#C4B097] hover:bg-[#F1EDE6] transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distant & Others */}
        <div>
          <h3 className="text-xs font-bold text-[#8B7355] font-urdu tracking-wider uppercase mb-3 flex items-center gap-1.5 border-b border-[#E5E1D8] pb-1.5">
            <Shield className="w-3.5 h-3.5" />
            دیگر وارثین عصبہ
          </h3>

          <div className="flex items-center justify-between p-3.5 bg-[#FAF8F5] border border-[#E5E1D8] hover:bg-[#F1EDE6]/50 rounded-xl transition duration-200">
            <div className="flex flex-col">
              <span className="text-sm font-urdu text-stone-800 font-medium">حقیقی چچا (پدرانہ چچا)</span>
              <span className="text-[10px] text-stone-500 font-urdu">والد کا حقیقی بھائی</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => adjustCount("unclesCount", false)}
                className="p-1 rounded-lg bg-white text-stone-700 border border-[#C4B097] hover:bg-[#F1EDE6] transition"
                disabled={value.unclesCount === 0}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-number font-bold text-stone-900 text-base w-6 text-center">{value.unclesCount}</span>
              <button
                type="button"
                onClick={() => adjustCount("unclesCount", true)}
                className="p-1 rounded-lg bg-white text-stone-700 border border-[#C4B097] hover:bg-[#F1EDE6] transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Jurisprudential disclaimer note */}
      <div className="mt-8 p-4 bg-[#F1EDE6] border-r-4 border-r-[#8B7355] border-y-[#D4CFC7] border-l-[#D4CFC7] rounded-lg flex items-start gap-3">
        <Info className="w-4.5 h-4.5 text-[#8B7355] shrink-0 mt-0.5" />
        <p className="text-xs text-stone-700 font-urdu leading-relaxed">
          <strong>یاد دہانی:</strong> فقہ حنفی میں حجب الحرمان (مکمل محرومی) کے اصول انتہائی منظم ہیں۔ مثال کے طور پر، بیٹے کی موجودگی میں تمام بہن بھائی، پوتے پوتیاں، اور چچا محروم ہو جاتے ہیں۔ کیلکولیٹر ان اصولوں کو شرعی طور پر خودکار نافذ کرتا ہے۔
        </p>
      </div>

    </div>
  );
}
