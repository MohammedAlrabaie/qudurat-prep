import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { questions } from "@/data/questions";
import { Category, Difficulty, QuizPrefs, filterQuestions, loadPrefs } from "@/lib/session";
import AppHeader from "@/components/AppHeader";

type SelectOption<T> = { label: string; value: T; desc?: string };

function OptionGrid<T extends string | number>({
  title,
  icon,
  options,
  value,
  onChange,
  cols = options.length,
}: {
  title: string;
  icon: React.ReactNode;
  options: SelectOption<T>[];
  value: T;
  onChange: (v: T) => void;
  cols?: number;
}) {
  const gridClass =
    cols <= 3 ? "grid-cols-3" :
    cols === 4 ? "grid-cols-2 sm:grid-cols-4" :
    "grid-cols-2";

  return (
    <div>
      <h2 className="text-xs font-bold text-white/45 mb-2.5 flex items-center gap-2 uppercase tracking-wider">
        <span className="text-violet-400">{icon}</span>
        {title}
      </h2>
      <div className={`grid gap-2 ${gridClass}`}>
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={String(opt.value)}
              onClick={() => onChange(opt.value)}
              className={`relative text-center p-3 sm:p-3.5 rounded-xl border-2 transition-all duration-150 active:scale-[0.98] ${
                active
                  ? "border-violet-500/65 bg-violet-500/10 text-white shadow-sm shadow-violet-500/10"
                  : "border-white/10 bg-white/[0.04] text-white/50 hover:border-white/18 hover:text-white/70"
              }`}
            >
              {active && (
                <span className="absolute top-1.5 left-1.5 w-3.5 h-3.5 rounded-full bg-violet-500 flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
              <p className="font-bold text-sm leading-tight">{opt.label}</p>
              {opt.desc && <p className="text-xs mt-0.5 opacity-55 leading-tight">{opt.desc}</p>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const CATEGORIES: SelectOption<Category>[] = [
  { label: "مختلط", value: "مختلط", desc: "لفظي وكمي" },
  { label: "لفظي", value: "لفظي", desc: "مفردات ولغة" },
  { label: "كمي", value: "كمي", desc: "رياضيات" },
];

const DIFFICULTIES: SelectOption<Difficulty>[] = [
  { label: "الكل", value: "all", desc: "جميع المستويات" },
  { label: "سهل", value: "easy", desc: "مستوى أساسي" },
  { label: "متوسط", value: "medium", desc: "مستوى متوسط" },
  { label: "صعب", value: "hard", desc: "مستوى متقدم" },
];

const QUESTION_COUNTS: SelectOption<number>[] = [
  { label: "5", value: 5, desc: "سريع" },
  { label: "10", value: 10, desc: "متوسط" },
  { label: "15", value: 15, desc: "شامل" },
  { label: "الكل", value: 999, desc: "جميع" },
];

const TIMER_OPTIONS: SelectOption<number>[] = [
  { label: "10 دقائق", value: 600 },
  { label: "20 دقيقة", value: 1200 },
  { label: "30 دقيقة", value: 1800 },
  { label: "بدون وقت", value: 0 },
];

const DIFF_ARABIC: Record<Difficulty, string> = {
  all: "جميع المستويات",
  easy: "سهل",
  medium: "متوسط",
  hard: "صعب",
};

const SVGIcons = {
  category: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8m-8 6h16" />
    </svg>
  ),
  difficulty: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  count: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  timer: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default function SetupPage() {
  const [, navigate] = useLocation();
  const savedPrefs = loadPrefs();

  const [category, setCategory] = useState<Category>(savedPrefs.category);
  const [difficulty, setDifficulty] = useState<Difficulty>(savedPrefs.difficulty);
  const [questionCount, setQuestionCount] = useState<number>(savedPrefs.questionCount);
  const [timerSeconds, setTimerSeconds] = useState<number>(savedPrefs.timerSeconds);

  const prefs: QuizPrefs = { category, difficulty, questionCount, timerSeconds };

  // Stable count: no shuffle on render — just count matching pool
  const availableCount = useMemo(() => {
    let pool = [...questions];
    if (category !== "مختلط") pool = pool.filter((q) => q.category === category);
    if (difficulty !== "all") pool = pool.filter((q) => q.difficulty === difficulty);
    return Math.min(questionCount, pool.length);
  }, [category, difficulty, questionCount]);

  const poolEmpty = availableCount === 0;

  const handleStart = () => {
    if (poolEmpty) return;
    const params = new URLSearchParams({
      category,
      difficulty,
      count: String(questionCount),
      timer: String(timerSeconds),
    });
    navigate(`/practice?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#0d0f16] text-white flex flex-col" dir="rtl">
      <AppHeader subtitle="إعداد الاختبار" right={
        <button
          onClick={() => navigate("/")}
          className="text-xs text-white/30 hover:text-white/60 border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/20 transition-all"
        >
          رجوع
        </button>
      } />

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-5 sm:py-7 pb-8">
        <div className="w-full max-w-xl space-y-6">

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white mb-1">إعداد الاختبار</h1>
            <p className="text-sm text-white/40">خصّص اختبارك قبل البدء</p>
          </div>

          <OptionGrid title="نوع الأسئلة" icon={SVGIcons.category} options={CATEGORIES} value={category} onChange={setCategory} />
          <OptionGrid title="مستوى الصعوبة" icon={SVGIcons.difficulty} options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} cols={4} />
          <OptionGrid title="عدد الأسئلة" icon={SVGIcons.count} options={QUESTION_COUNTS} value={questionCount} onChange={setQuestionCount} cols={4} />
          <OptionGrid title="مدة الاختبار" icon={SVGIcons.timer} options={TIMER_OPTIONS} value={timerSeconds} onChange={setTimerSeconds} cols={4} />

          {/* Summary */}
          <div className={`rounded-2xl p-4 border transition-colors ${poolEmpty ? "bg-red-500/6 border-red-500/20" : "bg-white/[0.04] border-white/10"}`}>
            {poolEmpty ? (
              <div className="flex items-center gap-2 text-sm text-red-400">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                لا توجد أسئلة تطابق هذه الإعدادات. جرّب تغيير المستوى أو النوع.
              </div>
            ) : (
              <>
                <p className="text-xs text-white/35 mb-2 font-semibold">ملخص الاختبار</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: `${availableCount} سؤال`, icon: "📝" },
                    { label: category, icon: "📚" },
                    { label: DIFF_ARABIC[difficulty], icon: "⚡" },
                    { label: timerSeconds > 0 ? `${timerSeconds / 60} دقيقة` : "بدون توقيت", icon: "⏱" },
                  ].map((item) => (
                    <span key={item.label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/8 text-xs text-white/60 font-medium">
                      {item.icon} {item.label}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleStart}
            disabled={poolEmpty}
            className="w-full py-4 rounded-2xl font-black text-lg bg-gradient-to-l from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-2xl shadow-violet-600/20 active:scale-[0.99] flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
            </svg>
            ابدأ الاختبار
          </button>
        </div>
      </main>
    </div>
  );
}
