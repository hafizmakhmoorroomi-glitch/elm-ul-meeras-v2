import React, { useState, useEffect } from "react";
import { Coins, HelpCircle, AlertCircle, Sparkles } from "lucide-react";
import { EstateInput } from "../utils/hanafiInheritance";

interface AssetsFormProps {
  value: EstateInput;
  onChange: (value: EstateInput) => void;
}

export default function AssetsForm({ value, onChange }: AssetsFormProps) {
  // Break down assets into subcategories for a much better user experience
  const [cash, setCash] = useState<number>(0);
  const [land, setLand] = useState<number>(0);
  const [house, setHouse] = useState<number>(0);
  const [shop, setShop] = useState<number>(0);
  const [gold, setGold] = useState<number>(0);
  const [silver, setSilver] = useState<number>(0);
  const [other, setOther] = useState<number>(0);

  // When subcategories change, update the parent estate inputs
  useEffect(() => {
    const sum = cash + land + house + shop + gold + silver + other;
    if (sum !== value.totalAssets) {
      onChange({
        ...value,
        totalAssets: sum
      });
    }
  }, [cash, land, house, shop, gold, silver, other]);

  const handleObligationsChange = (key: keyof EstateInput, amt: number) => {
    onChange({
      ...value,
      [key]: amt
    });
  };

  // Compute stats
  const totalAssetsSum = cash + land + house + shop + gold + silver + other;
  const netBeforeWill = Math.max(0, totalAssetsSum - value.funeralExpenses - value.debts);
  const maxWillLimit = netBeforeWill / 3;
  const isWillExceeded = value.willAmount > maxWillLimit;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-[#D4CFC7]" id="assets-form-panel">
      <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-[#D4CFC7]">
        <div className="p-2.5 bg-[#8B7355]/10 text-[#8B7355] rounded-lg border border-[#8B7355]/20">
          <Coins className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-urdu text-[#1A1A1A]">مرحلہ 1: ترکہ اور واجب الادا امور</h2>
          <p className="text-xs text-stone-500 font-urdu">مرحوم کی کل جائیداد اور منہا کیے جانے والے اخراجات درج کریں۔</p>
        </div>
      </div>

      {/* Subcategory Asset Splitting */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-[#8B7355] font-urdu mb-3 flex items-center gap-1.5 border-b border-[#E5E1D8] pb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#8B7355]" />
          مجموعی جائیداد کی تفصیلات (مالِ متروکہ)
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-stone-700 font-urdu mb-1">نقد رقم / بینک اکاؤنٹ</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              className="w-full bg-[#FAF8F5] border border-[#C4B097] focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]/30 focus:outline-none rounded-xl px-4 py-2 text-[#1A1A1A] font-number text-sm transition"
              value={cash || ""}
              onChange={(e) => setCash(Math.max(0, parseFloat(e.target.value) || 0))}
            />
          </div>

          <div>
            <label className="block text-xs text-stone-700 font-urdu mb-1">زمین کی مالیت</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              className="w-full bg-[#FAF8F5] border border-[#C4B097] focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]/30 focus:outline-none rounded-xl px-4 py-2 text-[#1A1A1A] font-number text-sm transition"
              value={land || ""}
              onChange={(e) => setLand(Math.max(0, parseFloat(e.target.value) || 0))}
            />
          </div>

          <div>
            <label className="block text-xs text-stone-700 font-urdu mb-1">مکان / فلیٹ کی مالیت</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              className="w-full bg-[#FAF8F5] border border-[#C4B097] focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]/30 focus:outline-none rounded-xl px-4 py-2 text-[#1A1A1A] font-number text-sm transition"
              value={house || ""}
              onChange={(e) => setHouse(Math.max(0, parseFloat(e.target.value) || 0))}
            />
          </div>

          <div>
            <label className="block text-xs text-stone-700 font-urdu mb-1">دکان / تجارتی اثاثے</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              className="w-full bg-[#FAF8F5] border border-[#C4B097] focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]/30 focus:outline-none rounded-xl px-4 py-2 text-[#1A1A1A] font-number text-sm transition"
              value={shop || ""}
              onChange={(e) => setShop(Math.max(0, parseFloat(e.target.value) || 0))}
            />
          </div>

          <div>
            <label className="block text-xs text-stone-700 font-urdu mb-1">سونا (مالیت)</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              className="w-full bg-[#FAF8F5] border border-[#C4B097] focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]/30 focus:outline-none rounded-xl px-4 py-2 text-[#1A1A1A] font-number text-sm transition"
              value={gold || ""}
              onChange={(e) => setGold(Math.max(0, parseFloat(e.target.value) || 0))}
            />
          </div>

          <div>
            <label className="block text-xs text-stone-700 font-urdu mb-1">چاندی (مالیت)</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              className="w-full bg-[#FAF8F5] border border-[#C4B097] focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]/30 focus:outline-none rounded-xl px-4 py-2 text-[#1A1A1A] font-number text-sm transition"
              value={silver || ""}
              onChange={(e) => setSilver(Math.max(0, parseFloat(e.target.value) || 0))}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs text-stone-700 font-urdu mb-1">دیگر اثاثے (مثلاً گاڑی، حصص وغیرہ)</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              className="w-full bg-[#FAF8F5] border border-[#C4B097] focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]/30 focus:outline-none rounded-xl px-4 py-2 text-[#1A1A1A] font-number text-sm transition"
              value={other || ""}
              onChange={(e) => setOther(Math.max(0, parseFloat(e.target.value) || 0))}
            />
          </div>
        </div>
      </div>

      <div className="p-3.5 bg-[#F1EDE6] rounded-xl mb-6 border border-[#D4CFC7] flex justify-between items-center shadow-sm">
        <span className="text-sm font-semibold font-urdu text-stone-800">کل جائیداد کی مالیت:</span>
        <span className="text-xl font-bold font-number text-[#8B7355]">{(totalAssetsSum).toLocaleString()} PKR</span>
      </div>

      {/* Obligations & Deductions */}
      <div className="space-y-4 pt-4 border-t border-[#E5E1D8]">
        <h3 className="text-sm font-bold text-[#8B7355] font-urdu mb-3">واجب الادا امور (حقوقِ اربعہ منہائی)</h3>

        <div>
          <label className="block text-xs text-stone-700 font-urdu mb-1 flex items-center justify-between">
            <span>1۔ تجہیز و تکفین کے اخراجات</span>
            <span className="text-[10px] text-stone-500 font-urdu">کفن، دفن، قبر وغیرہ</span>
          </label>
          <input
            type="number"
            min="0"
            placeholder="0"
            className="w-full bg-[#FAF8F5] border border-[#C4B097] focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]/30 focus:outline-none rounded-xl px-4 py-2 text-[#1A1A1A] font-number text-sm transition"
            value={value.funeralExpenses || ""}
            onChange={(e) => handleObligationsChange("funeralExpenses", Math.max(0, parseFloat(e.target.value) || 0))}
          />
        </div>

        <div>
          <label className="block text-xs text-stone-700 font-urdu mb-1 flex items-center justify-between">
            <span>2۔ میت کے قرضے</span>
            <span className="text-[10px] text-stone-500 font-urdu">مہر، بینک قرضہ، خاندانی قرض</span>
          </label>
          <input
            type="number"
            min="0"
            placeholder="0"
            className="w-full bg-[#FAF8F5] border border-[#C4B097] focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]/30 focus:outline-none rounded-xl px-4 py-2 text-[#1A1A1A] font-number text-sm transition"
            value={value.debts || ""}
            onChange={(e) => handleObligationsChange("debts", Math.max(0, parseFloat(e.target.value) || 0))}
          />
        </div>

        <div>
          <label className="block text-xs text-stone-700 font-urdu mb-1 flex items-center justify-between">
            <span>3۔ جائز وصیت کی رقم (زیادہ سے زیادہ 1/3)</span>
            <span className="text-[10px] text-[#8B7355] font-urdu">غیر وارث کے لیے وصیت</span>
          </label>
          <input
            type="number"
            min="0"
            placeholder="0"
            className="w-full bg-[#FAF8F5] border border-[#C4B097] focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]/30 focus:outline-none rounded-xl px-4 py-2 text-[#1A1A1A] font-number text-sm transition"
            value={value.willAmount || ""}
            onChange={(e) => handleObligationsChange("willAmount", Math.max(0, parseFloat(e.target.value) || 0))}
          />
          
          {/* Will constraint info feedback */}
          {totalAssetsSum > 0 && (
            <div className="mt-2.5 text-[11px] leading-relaxed flex items-start gap-1.5 p-3 bg-[#F1EDE6] border border-[#D4CFC7] rounded-lg">
              <HelpCircle className="w-4.5 h-4.5 text-[#8B7355] shrink-0 mt-0.5" />
              <p className="text-stone-700 font-urdu">
                شریعت میں وصیت صرف غیر وارث کے لیے اور کفن دفن و قرضوں کی ادائیگی کے بعد بچنے والے مال کے زیادہ سے زیادہ <strong>ایک تہائی (1/3)</strong> یعنی <span className="font-number">{(maxWillLimit).toLocaleString(undefined, {maximumFractionDigits:0})}</span> تک ہی نافذ ہوتی ہے۔ اگر آپ اس سے زیادہ لکھیں گے، تو یہ خودکار طور پر ایک تہائی کے اندر محدود کر دی جائے گی۔
              </p>
            </div>
          )}

          {isWillExceeded && (
            <div className="mt-2 text-xs leading-relaxed flex items-start gap-1.5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="font-urdu">
                <strong>انتباہ:</strong> آپ کی وصیت کی رقم شرعی حد (محروم جائیداد کا 1/3) سے بڑھ گئی ہے۔ کیلکولیٹر خود بخود اسے جائز حد <span className="font-number font-bold">{(maxWillLimit).toLocaleString(undefined, {maximumFractionDigits:0})}</span> پر لاگو کرے گا۔
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
