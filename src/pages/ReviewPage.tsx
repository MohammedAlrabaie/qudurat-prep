import { useState } from "react";
import { useLocation } from "wouter";
import { questions } from "@/data/questions";
import { loadStats, loadWrongDetails, removeWrongAnswerById } from "@/lib/session";
import { getCorrectIndex } from "@/data/questions";
import AppHeader from "@/components/AppHeader";

const OPTION_LABELS = ["أ", "ب", "ج", "د"];

function WrongCard({
  question,
  selectedIndex,
  onDismiss,
}: {
  question: (typeof questions)[0];
  selectedIndex: number;
  onDismiss: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    // Small delay so the user sees the card briefly before it disappears
    setTimeout(onDismiss, 300);
  };

  return (
    <div className={`bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/15 ${
      dismissed ? "opacity-0 scale-98 -mt-2" : ""
    }`}>
      {/* Card header — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-right p-4 sm:p-5 flex items-start justify-between gap-4"
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-1.5 mb-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border flex-shrink-0 ${
              question.category === "كمي"
                ? "bg-sky-500/10 border-sky-500/20 text-sky-400"
                : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
            }`}>
              {question.category}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border flex-shrink-0 ${
              question.difficulty === "easy"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : question.difficulty === "medium"
                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              {question.difficulty === "easy" ? "سهل" : question.difficulty === "medium" ? "متوسط" : "صعب"}
            </span>
            <span className="text-xs text-red-400/70 bg-red-500/8 border border-red-500/18 px-2 py-0.5 rounded-md flex-shrink-0">
              إجابة خاطئة
            </span>
          </div>
          <p className="text-sm font-semibold text-white/80 leading-relaxed line-clamp-2">{question.text}</p>
        </div>
        <svg
          className={`w-5 h-5 text-white/30 flex-shrink-0 mt-0.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-white/8 px-4 sm:px-5 pb-4 sm:pb-5 pt-4 space-y-3">
          {/* Options */}
          <div className="space-y-2">
            {question.options.map((opt, idx) => {
              const correctIdx = getCorrectIndex(question);
              const isCorrect = idx === correctIdx;
              const isWrong = idx === selectedIndex && !isCorrect;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border text-sm ${
                    isCorrect
                      ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-200"
                      : isWrong
                      ? "bg-red-500/10 border-red-500/35 text-red-300"
                      : "bg-white/[0.03] border-white/6 text-white/35"
                  }`}
                >
                  <span className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isCorrect ? "bg-emerald-500/25 text-emerald-200"
                    : isWrong ? "bg-red-500/25 text-red-200"
                    : "bg-white/5 text-white/25"
                  }`}>
                    {OPTION_LABELS[idx]}
                  </span>
                  <span className="flex-1 leading-snug">{opt}</span>
                  {isCorrect && (
                    <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {isWrong && (
                    <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>

          {/* Labels for selected vs correct */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="flex items-center gap-1 text-red-400/70">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              إجابتك: {OPTION_LABELS[selectedIndex]}
            </span>
            <span className="flex items-center gap-1 text-emerald-400/70">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              الصحيحة: {OPTION_LABELS[getCorrectIndex(question)]}
            </span>
          </div>

          {/* Explanation */}
          <div className="bg-indigo-500/8 border border-indigo-500/18 rounded-xl p-3.5 sm:p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-xs font-bold text-indigo-300">الشرح</span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">{question.explanation}</p>
          </div>

          {/* Mark as understood */}
          <button
            onClick={handleDismiss}
            className="w-full py-2.5 rounded-xl text-sm font-bold bg-emerald-500/8 border border-emerald-500/22 text-emerald-400 hover:bg-emerald-500/15 active:scale-99 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            فهمت — إزالة من قائمة الأخطاء
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────
export default function ReviewPage() {
  const [, navigate] = useLocation();

  // Load data on mount — use state so dismissals cause re-renders
  const [wrongIds, setWrongIds] = useState<number[]>(() => loadStats().wrongAnswerIds);
  const wrongDetails = loadWrongDetails();

  const wrongItems = wrongIds
    .map((id) => {
      const q = questions.find((q) => q.id === id);
      const detail = wrongDetails.find((d) => d.questionId === id);
      return q && detail ? { question: q, selectedIndex: detail.selectedIndex } : null;
    })
    .filter(Boolean) as { question: (typeof questions)[0]; selectedIndex: number }[];

  const handleDismiss = (id: number) => {
    removeWrongAnswerById(id);
    setWrongIds((prev) => prev.filter((wid) => wid !== id));
  };

  const verbalWrong = wrongItems.filter((i) => i.question.category === "لفظي").length;
  const quantWrong = wrongItems.filter((i) => i.question.category === "كمي").length;

  const Header = (
    <AppHeader subtitle="مراجعة الأخطاء" right={
      <button
        onClick={() => navigate("/")}
        className="text-xs text-white/30 hover:text-white/60 border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/20 transition-all"
      >
        رجوع
      </button>
    } />
  );

  if (wrongItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0d0f16] flex flex-col" dir="rtl">
        {Header}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mb-2">
            <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-white">لا توجد أخطاء محفوظة</h2>
          <p className="text-white/40 text-sm max-w-xs leading-relaxed">أحسنت! لم يتم تسجيل أي إجابات خاطئة بعد. أجرِ اختباراً وستظهر أخطاؤك هنا.</p>
          <button onClick={() => navigate("/setup")} className="mt-4 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition shadow-lg shadow-violet-600/20">
            ابدأ اختباراً جديداً
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0f16] text-white flex flex-col" dir="rtl">
      {Header}

      <main className="flex-1 px-4 sm:px-6 py-5 sm:py-6 flex flex-col items-center pb-8">
        <div className="w-full max-w-xl space-y-4">

          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-xl font-black text-white">مراجعة الأخطاء</h1>
              <p className="text-xs text-white/40 mt-0.5">
                {wrongItems.length === 1 ? "سؤال واحد" : `${wrongItems.length} أسئلة`} للمراجعة
              </p>
            </div>
            <div className="flex gap-1.5 flex-wrap justify-end">
              {verbalWrong > 0 && (
                <span className="px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 font-semibold">{verbalWrong} لفظي</span>
              )}
              {quantWrong > 0 && (
                <span className="px-2 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs text-sky-400 font-semibold">{quantWrong} كمي</span>
              )}
            </div>
          </div>

          {/* Instruction banner */}
          <div className="bg-violet-500/8 border border-violet-500/18 rounded-xl px-4 py-3 text-xs text-violet-300/70 leading-relaxed">
            اضغط على أي سؤال لرؤية إجابتك مقارنةً بالإجابة الصحيحة والشرح. بعد الفهم، اضغط "فهمت" لإزالته.
          </div>

          {/* Cards */}
          {wrongItems.length > 0 ? (
            <div className="space-y-3">
              {wrongItems.map(({ question, selectedIndex }) => (
                <WrongCard
                  key={question.id}
                  question={question}
                  selectedIndex={selectedIndex}
                  onDismiss={() => handleDismiss(question.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-white/50 font-semibold">راجعت جميع أخطائك!</p>
              <p className="text-white/30 text-sm mt-1">أنت على المسار الصحيح للتحسن.</p>
            </div>
          )}

          {/* Action buttons */}
          {wrongItems.length > 0 && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => navigate("/practice?retry=wrong")}
                className="py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-l from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-violet-600/15"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                تدريب الأخطاء
              </button>
              <button
                onClick={() => navigate("/setup")}
                className="py-3.5 rounded-2xl font-bold text-sm bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/18 transition-all duration-200"
              >
                اختبار جديد
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
