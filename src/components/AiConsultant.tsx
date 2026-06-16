import React, { useState } from "react";
import { Sparkles, Brain, ArrowLeft, Send, Compass, HelpCircle, Copy, CheckCircle2 } from "lucide-react";
import { CalculationResult } from "../utils/hanafiInheritance";

interface AiConsultantProps {
  calculationResult: CalculationResult;
  estateSummaryUrduText: string;
}

export default function AiConsultant({ calculationResult, estateSummaryUrduText }: AiConsultantProps) {
  const [loading, setLoading] = useState(false);
  const [errorWord, setErrorWord] = useState<string | null>(null);
  const [fatwaReport, setFatwaReport] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Custom dialog log for direct interactive messaging with the AI Scholar
  const [chatLog, setChatLog] = useState<Array<{ sender: "user" | "ai"; message: string }>>([]);

  const handleGenerateReport = async () => {
    setLoading(true);
    setErrorWord(null);
    try {
      const response = await fetch("/api/gemini/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estate: {
            totalAssets: calculationResult.totalAssets,
            funeralExpenses: calculationResult.funeralExpenses,
            debts: calculationResult.debts,
            willAmount: calculationResult.willAmount,
            netEstate: calculationResult.netEstate,
          },
          heirs: calculationResult.heirs,
          summaryUrdu: estateSummaryUrduText
        })
      });

      if (!response.ok) {
        throw new Error("رپورٹ حاصل کرنے میں سرور کی طرف سے خلل پیش آیا۔");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setFatwaReport(data.result);
    } catch (err: any) {
      console.error(err);
      setErrorWord(err.message || "آئی سی رابطہ قائم کرنے میں مسئلہ پیش آیا۔ براہ کرم دوبارہ کوشش کریں۔");
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuestion = async (qsText: string) => {
    if (!qsText || !qsText.trim()) return;
    
    const userMsg = qsText.trim();
    setCustomQuestion("");
    setChatLog(prev => [...prev, { sender: "user", message: userMsg }]);
    
    setLoading(true);
    setErrorWord(null);
    try {
      const response = await fetch("/api/gemini/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estate: {
            totalAssets: calculationResult.totalAssets,
            funeralExpenses: calculationResult.funeralExpenses,
            debts: calculationResult.debts,
            willAmount: calculationResult.willAmount,
            netEstate: calculationResult.netEstate,
          },
          heirs: calculationResult.heirs,
          question: userMsg
        })
      });

      if (!response.ok) {
        throw new Error("جواب موصول نہیں ہو سکا۔");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setChatLog(prev => [...prev, { sender: "ai", message: data.result }]);
    } catch (err: any) {
      setChatLog(prev => [...prev, { sender: "ai", message: `معاف کیجیے گا: ${err.message || "تکنیکی خامی پیش آئی"}` }]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!fatwaReport) return;
    navigator.clipboard.writeText(fatwaReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Light-weight beautiful markdown rendering engine directly in UI inside React
  const formatMarkdownToUrdu = (mTxt: string) => {
    const lines = mTxt.split("\n");
    return lines.map((line, idx) => {
      // Heading level 1
      if (line.startsWith("# ")) {
        return <h1 key={idx} className="text-xl sm:text-2xl font-bold font-urdu text-[#8B7355] border-b border-[#E5E1D8] pb-2 mt-6 mb-3">{line.replace("# ", "")}</h1>;
      }
      // Heading level 2
      if (line.startsWith("## ")) {
        return <h2 key={idx} className="text-lg sm:text-xl font-bold font-urdu text-[#8B7355] mt-5 mb-2">{line.replace("## ", "")}</h2>;
      }
      // Heading level 3
      if (line.startsWith("### ")) {
        return <h3 key={idx} className="text-base sm:text-lg font-semibold font-urdu text-stone-800 mt-4 mb-2">{line.replace("### ", "")}</h3>;
      }
      // List item
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <li key={idx} className="list-none pr-4 relative text-xs sm:text-sm text-stone-700 font-urdu my-1 leading-relaxed">
            <span className="absolute right-0 text-[#8B7355]">•</span>
            {parseBoldText(line.substring(2))}
          </li>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      // Paragraph
      return (
        <p key={idx} className="text-xs sm:text-sm text-stone-700 font-urdu leading-relaxed my-2 text-justify">
          {parseBoldText(line)}
        </p>
      );
    });
  };

  // Helper to parse **bold text**
  const parseBoldText = (txt: string) => {
    const parts = txt.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-[#8B7355] font-bold">{part}</strong> : part);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-[#D4CFC7]" id="ai-fatwa-consultation-section">
      
      {/* Visual top bar of Assistant */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E5E1D8]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 sm:p-2.5 bg-[#8B7355]/10 rounded-xl border border-[#8B7355]/20 text-[#8B7355]">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 text-[10px] rounded-full font-bold border border-amber-250">
              جدید علمی رپورٹ انجن
            </span>
            <h2 className="text-xl font-bold font-urdu text-stone-900 mt-0.5">جامعۃ المصطفیٰ نوریہ - تفصیلی شرعی معائنہ</h2>
          </div>
        </div>

        {fatwaReport && (
          <button
            onClick={() => { setFatwaReport(null); setChatLog([]); }}
            className="text-xs text-stone-500 hover:text-stone-850 font-urdu flex items-center gap-1.5 cursor-pointer transition"
          >
            <ArrowLeft className="w-4 h-4 text-[#8B7355]" />
            <span>نئی پورٹ بنائیں</span>
          </button>
        )}
      </div>

      {errorWord && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-urdu mb-5 leading-relaxed">
          {errorWord}
        </div>
      )}

      {/* Main UI view flow triggers */}
      {!fatwaReport && chatLog.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-stone-600 text-sm font-urdu leading-relaxed max-w-lg mx-auto mb-6">
            مفت مشورہ حاصل کریں۔ ہمارا ماڈل آپ کے درج کردہ اثاثہ جات اور ورثاء کے لائیو ڈیٹا کا تجزیہ کرے گا، اور سیکنڈوں میں حوالہ جات کے ساتھ باضابطہ مستند فتویٰ اور تقسیم رپورٹ تیار کرے گا۔
          </p>

          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="relative overflow-hidden group py-3 px-8 bg-[#8B7355] hover:bg-[#705c43] border border-[#705c43] rounded-xl text-white font-bold font-urdu text-sm hover:shadow-md transition-all duration-300 w-full xs:w-auto cursor-pointer flex items-center justify-center gap-2 mx-auto"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                علمی تحقیق اور رپورٹ کی تیاری جاری ہے...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-200 group-hover:rotate-12 transition-transform duration-300" />
                مفصل علمی رپورٹ حاصل کریں
              </span>
            )}
          </button>

          {/* Quick-ask Common General Questions Section */}
          <div className="mt-8 border-t border-[#E5E1D8] pt-6">
            <h3 className="text-xs font-bold text-[#8B7355] font-urdu uppercase tracking-wider mb-4 flex items-center justify-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#8B7355]" />
              اہم عام سوالات پوچھیں (مفت علمی فتویٰ):
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-right">
              {[
                "میت کی بیٹیوں کو عصبہ یعنی بقیہ ترکہ کا حصہ کب ملتا ہے؟",
                "مسئلہ عول اور رد کی تفصیل قرآن و سنت کی روشنی میں کیا ہے؟",
                "فقہ حنفی کے مطابق قرض کی ادائیگی وصیت نافذ کرنے پر مقدم کیوں ہے؟"
              ].map((qs, index) => (
                <button
                  key={index}
                  onClick={() => handleSendQuestion(qs)}
                  disabled={loading}
                  className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D4CFC7] text-stone-850 hover:text-[#8B7355] hover:border-[#8B7355]/40 text-xs text-right font-urdu transition-all duration-200 cursor-pointer hover:bg-[#F1EDE6]/50"
                >
                  {qs}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Report / Chat Results View
        <div className="space-y-6">
          
          {/* If main Sharia report was generated and is present */}
          {fatwaReport && (
            <div className="p-6 bg-[#FAF8F5] rounded-2xl border border-[#D4CFC7] shadow-inner relative print:bg-white print:text-black print:border-none print:shadow-none">
              
              {/* Copy/Print Auxiliary Floaters */}
              <div className="absolute left-4 top-4 flex items-center gap-2 print:hidden select-none">
                <button
                  onClick={copyToClipboard}
                  className="p-2 rounded-lg bg-white border border-[#C4B097] hover:border-[#8B7355] hover:bg-[#FAF8F5] transition text-stone-700 flex items-center gap-1.5 text-xs cursor-pointer"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-[#8B7355]" />}
                  <span>{copied ? "کاپی ہو گیا" : "کاپی کریں"}</span>
                </button>
              </div>

              {/* Sharia text block */}
              <div className="space-y-3 leading-relaxed text-stone-750 max-h-[450px] overflow-y-auto pr-2 print:max-h-full print:overflow-visible">
                {formatMarkdownToUrdu(fatwaReport)}
              </div>
            </div>
          )}

          {/* If there is active direct interactive messaging terminal dialogue */}
          {chatLog.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-[#E5E1D8]">
              <h3 className="text-xs font-bold text-[#8B7355] font-urdu mb-2">مفتی عسکری ڈائیلاگ بورڈ (Live QA):</h3>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {chatLog.map((chat, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3.5 rounded-xl max-w-[85%] text-xs font-urdu leading-relaxed ${
                      chat.sender === "user"
                        ? "bg-amber-50 border border-amber-200 text-stone-850 mr-auto text-left"
                        : "bg-[#FAF8F5] border border-[#E5E1D8] text-stone-750 ml-auto"
                    }`}
                  >
                    <strong className="block text-[10px] text-[#8B7355] mb-1 font-bold">
                      {chat.sender === "user" ? "آپ کا دریافت کردہ سوال:" : "مفتیِ اعظم AI کا شرعی فتویٰ جواب:"}
                    </strong>
                    <div className="whitespace-pre-line">
                      {chat.sender === "ai" ? formatMarkdownToUrdu(chat.message) : chat.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live follow-up question input terminal form field */}
          <div className="pt-4 border-t border-[#E5E1D8] flex items-center gap-2">
            <input
              type="text"
              placeholder="میراث کے حوالے سے کوئی اور سوال پوچھیں..."
              className="flex-1 bg-white border border-[#C4B097] focus:border-[#8B7355] focus:outline-none rounded-xl px-4 py-2.5 text-xs text-stone-900 font-urdu"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendQuestion(customQuestion);
              }}
              disabled={loading}
            />
            <button
              onClick={() => handleSendQuestion(customQuestion)}
              disabled={loading || !customQuestion.trim()}
              className="p-2.5 bg-[#8B7355] text-white font-bold hover:bg-[#705c43] active:scale-95 rounded-xl transition disabled:opacity-50 disabled:scale-100 cursor-pointer"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
