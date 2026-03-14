import { useState, useRef, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { questions } from "@/data/questions";
import QuestionCard from "@/components/QuestionCard";
import ProgressBar from "@/components/ProgressBar";
import Timer from "@/components/Timer";
import AppHeader from "@/components/AppHeader";
import {
  Category, Difficulty, QuizPrefs, QuestionResult,
  saveSession, saveWrongDetails, filterQuestions, shuffleArray, loadStats,
} from "@/lib/session";
import { getCorrectIndex } from "@/data/questions";

// ─── Exit confirmation modal ──────────────────────────────────
function ExitModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
      <div className="bg-[#181b25] border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-base font-black text-white text-center mb-1">إنهاء الاختبار؟</h2>
        <p className="text-sm text-white/45 text-center mb-5 leading-relaxed">
          لن يتم حفظ تقدمك الحالي إذا غادرت الآن.
        </p>
        <div className="flex gap-2.5">
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl text-sm font-bold bg-red-500/12 border border-red-500/25 text-red-300 hover:bg-red-500/20 transition-all"
          >
            نعم، إنهاء
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm font-bold bg-white/[0.06] border border-white/10 text-white/70 hover:bg-white/10 transition-all"
          >
            تابع الاختبار
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function PracticePage() {
  const [location, navigate] = useLocation();
  const [showExitModal, setShowExitModal] = useState(false);

  const prefs = useMemo<QuizPrefs>(() => {
    const sp = new URLSearchParams(location.split("?")[1] || "");
    if (sp.get("retry") === "wrong") {
      const stats = loadStats();
      return { category: "مختلط", difficulty: "all", questionCount: stats.wrongAnswerIds.length || 999, timerSeconds: 0 };
    }
    return {
      category: (decodeURIComponent(sp.get("category") || "مختلط")) as Category,
      difficulty: (sp.get("difficulty") || "all") as Difficulty,
      questionCount: parseInt(sp.get("count") || "10"),
      timerSeconds: parseInt(sp.get("timer") || "0"),
    };
  }, [location]);

  const sessionQuestions = useMemo(() => {
    const sp = new URLSearchParams(location.split("?")[1] || "");
    if (sp.get("retry") === "wrong") {
      const stats = loadStats();
      const wrongIds = new Set(stats.wrongAnswerIds);
      return shuffleArray(questions.filter((q) => wrongIds.has(q.id)));
    }
    return filterQuestions(questions, prefs);
  }, [prefs, location]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [timerExpired, setTimerExpired] = useState(false);

  const questionStartTime = useRef(Date.now());
  const timerRemainingRef = useRef(prefs.timerSeconds);
  const resultsRef = useRef<QuestionResult[]>([]);

  const current = sessionQuestions[currentIndex];
  const isLast = currentIndex === sessionQuestions.length - 1;

  // Keep a ref in sync with results state so timer callback always sees fresh data
  const syncResults = (r: QuestionResult[]) => {
    resultsRef.current = r;
    setResults(r);
  };

  // Build per-question answer flags for ProgressBar
  const answerFlags: Array<boolean | null> = sessionQuestions.map((q, i) => {
    if (i >= results.length) return null;
    return results[i].correct;
  });

  const finishSession = useCallback((finalResults: QuestionResult[]) => {
    const finalScore = finalResults.filter((r) => r.correct).length;
    const timeTaken = prefs.timerSeconds > 0
      ? prefs.timerSeconds - timerRemainingRef.current
      : Math.round(finalResults.reduce((s, r) => s + r.timeSpent, 0));

    saveSession({
      score: finalScore,
      total: sessionQuestions.length,
      prefs,
      timeTaken,
      questionResults: finalResults,
      completedAt: new Date().toISOString(),
    });

    saveWrongDetails(
      finalResults.filter((r) => !r.correct).map((r) => ({
        questionId: r.questionId,
        selectedIndex: r.selectedIndex,
        sessionDate: new Date().toISOString(),
      }))
    );

    navigate("/result");
  }, [prefs, sessionQuestions.length, navigate]);

  const handleTimerExpire = useCallback(() => {
    setTimerExpired(true);
    finishSession(resultsRef.current);
  }, [finishSession]);

  const handleTick = useCallback((r: number) => {
    timerRemainingRef.current = r;
  }, []);

  const handleSelect = useCallback((index: number) => {
    if (!submitted) setSelectedOption(index);
  }, [submitted]);

  const handleSubmit = useCallback(() => {
    if (selectedOption === null) return;
    const timeSpent = Math.round((Date.now() - questionStartTime.current) / 1000);
    const correct = selectedOption === getCorrectIndex(current);
    const newResult: QuestionResult = {
      questionId: current.id,
      category: current.category,
      difficulty: current.difficulty,
      correct,
      timeSpent,
      selectedIndex: selectedOption,
    };
    syncResults([...resultsRef.current, newResult]);
    setSubmitted(true);
  }, [selectedOption, current]);

  const handleNext = useCallback(() => {
    if (isLast) {
      finishSession(resultsRef.current);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setSubmitted(false);
      questionStartTime.current = Date.now();
    }
  }, [isLast, finishSession]);

  if (!current) {
    return (
      <div className="min-h-screen bg-[#0d0f16] flex flex-col items-center justify-center gap-4 px-4" dir="rtl">
        <div className="text-5xl mb-2">🔍</div>
        <p className="text-white/60 text-center">لا توجد أسئلة تطابق الإعدادات المختارة</p>
        <button onClick={() => navigate("/setup")} className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition">
          تعديل الإعدادات
        </button>
      </div>
    );
  }

  const correctCount = results.filter((r) => r.correct).length;
  const incorrectCount = results.filter((r) => !r.correct).length;

  return (
    <div className="min-h-screen bg-[#0d0f16] text-white flex flex-col" dir="rtl">
      {showExitModal && (
        <ExitModal
          onCancel={() => setShowExitModal(false)}
          onConfirm={() => navigate("/")}
        />
      )}

      <AppHeader
        subtitle={prefs.category}
        right={
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live score */}
            <div className="flex items-center gap-1.5 text-sm">
              <span className="flex items-center gap-1 text-emerald-400 font-bold tabular-nums">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {correctCount}
              </span>
              <span className="text-white/15">·</span>
              <span className="flex items-center gap-1 text-red-400 font-bold tabular-nums">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                {incorrectCount}
              </span>
            </div>
            {prefs.timerSeconds > 0 && (
              <Timer
                totalSeconds={prefs.timerSeconds}
                onExpire={handleTimerExpire}
                onTick={handleTick}
                paused={timerExpired}
              />
            )}
            <button
              onClick={() => setShowExitModal(true)}
              className="text-xs text-white/25 hover:text-white/55 border border-white/10 px-2.5 py-1.5 rounded-lg hover:border-white/20 transition-all"
            >
              إنهاء
            </button>
          </div>
        }
      />

      <ProgressBar
        current={currentIndex + 1}
        total={sessionQuestions.length}
        answers={answerFlags}
      />

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-4 sm:py-5">
        <QuestionCard
          question={current}
          selectedOption={selectedOption}
          submitted={submitted}
          onSelect={handleSelect}
          onSubmit={handleSubmit}
          onNext={handleNext}
          questionNumber={currentIndex + 1}
          totalQuestions={sessionQuestions.length}
          isLast={isLast}
        />

        <div className="max-w-2xl w-full mt-4 sm:mt-5">
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-l from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200 shadow-xl shadow-violet-600/20"
            >
              تحقق من الإجابة
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-l from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 shadow-xl shadow-violet-600/20 flex items-center justify-center gap-2"
            >
              {isLast ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  عرض النتائج
                </>
              ) : (
                <>
                  السؤال التالي
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>

        {!submitted && (
          <p className="mt-3 text-xs text-white/20 text-center">
            السؤال {currentIndex + 1} من {sessionQuestions.length} &nbsp;·&nbsp; اختر إجابة ثم اضغط للتحقق
          </p>
        )}
      </main>
    </div>
  );
}
