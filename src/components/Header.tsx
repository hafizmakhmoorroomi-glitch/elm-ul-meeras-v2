import React from "react";
import { BookOpen, Compass, Award } from "lucide-react";
import { motion } from "motion/react";

export default function Header() {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full relative overflow-hidden glass-panel rounded-2xl p-6 sm:p-8 mb-8 border border-[#D4CFC7]"
      id="calculator-header"
    >
      {/* Decorative background visual elements */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-[#8B7355]/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute left-10 bottom-0 w-24 h-24 bg-[#8B7355]/5 rounded-full blur-xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-right">
          <div className="p-3 bg-[#8B7355]/10 rounded-xl border border-[#8B7355]/20 text-[#8B7355] shrink-0">
            <Compass className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-[#8B7355]/10 text-[#8B7355] text-xs rounded-full border border-[#8B7355]/20 font-medium font-urdu">
                فقہِ حنفی کے مطابق تقسیمِ ترکہ دائرہ کار
              </span>
              <span className="px-2 py-0.5 bg-amber-100 text-[#8B7355] text-xs rounded-full border border-amber-200 font-medium flex items-center gap-1 font-urdu">
                <Award className="w-3.5 h-3.5" />
                مستند خودکار حسابات
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-urdu text-[#1A1A1A] mt-2 leading-semibold">
              حنفی میراث کیلکولیٹر
            </h1>
            <p className="text-stone-600 text-sm mt-1.5 max-w-xl font-urdu">
              شرعی اصولوں اور مفتیانِ کرام کی ہدایات کے مطابق تجہیز و تکفین، قرضوں اور وصایا کی منہائی کے بعد ورثاء میں تقسیمِ جائیداد کا خودکار حساب۔
            </p>
          </div>
        </div>

        {/* Sharia Rule Quick Steps display */}
        <div className="grid grid-cols-2 xs:grid-cols-4 gap-3 w-full md:w-auto">
          {[
            { step: "1", title: "تجہیز و تکفین", desc: "کفن و دفن اخراجات" },
            { step: "2", title: "قرضہ کی ادائیگی", desc: "میت کے واجب القرض" },
            { step: "3", title: "جائز وصیت", desc: "زیادہ سے زیادہ 1/3" },
            { step: "4", title: "تقسیمِ ترکہ", desc: "اصحاب الفروض اور عصبہ" }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="p-3 rounded-xl bg-[#F1EDE6] border border-[#E5E1D8] text-center flex flex-col items-center justify-between min-w-[100px] hover:shadow-sm transition"
            >
              <span className="w-6 h-6 flex items-center justify-center bg-[#8B7355] text-white text-xs font-semibold rounded-full font-number">
                {item.step}
              </span>
              <h3 className="text-sm font-semibold text-[#1A1A1A] font-urdu mt-1">{item.title}</h3>
              <p className="text-[10px] text-stone-500 mt-0.5 font-urdu">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.header>
  );
}
