import { useEffect, useState } from "react";
import { Question, getCorrectIndex, TYPE_LABELS } from "@/data/questions";

interface Props {
  question: Question;
  selectedOption: number | null;
  submitted: boolean;
  onSelect: (index: number) => void;
  onSubmit: () => void;
  onNext: () => void;
  questionNumber: number;
  totalQuestions: number;
  isLast: boolean;
}

const OPTION_LABELS = ["أ", "ب", "ج", "د"];
const KEYBOARD_MAP: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3, a: 0, b: 1, c: 2, d: 3 };

export default function QuestionCard({
  question, selectedOption, submitted, onSelect, onSubmit, onNext,
  questionNumber, totalQuestions, isLast,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, [question.id]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      if (!submitted && key in KEYBOARD_MAP) {
        onSelect(KEYBOARD_MAP[key]);
      } else if ((key === "enter" || key === " ") && !submitted && selectedOption !== null) {
        e.preventDefault();
        onSubmit();
      } else if ((key === "enter" || key === " ") && submitted) {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [submitted, selectedOption, onSelect, onSubmit, onNext]);

  const correctIndex = getCorrectIndex(question);

  const isCorrect = submitted && selectedOption === correctIndex;
  const isWrong = submitted && selectedOption !== null && selectedOption !== correctIndex;

  const getOptionState = (index: number) => {
    if (!submitted) return selectedOption === index ? "selected" : "idle";
    if (index === correctIndex) return "correct";
    if (index === selectedOption && index !== correctIndex) return "incorrect";
    return "dimmed";
  };

  const optionStyles: Record<string, string> = {
    idle: "bg-white/[0.04] border-white/10 text-white/80 hover:bg-white/[0.08] hover:border-white/22 cursor-pointer active:scale-[0.99]",
    selected: "bg-violet-500/15 border-violet-500/60 text-white shadow-sm shadow-violet-500/15",
    correct: "bg-emerald-500/12 border-emerald-500/50 text-emerald-100 shadow-sm shadow-emerald-500/10",
    incorrect: "bg-red-500/12 border-red-500/45 text-red-200",
    dimmed: "bg-white/[0.025] border-white/6 text-white/30",
  };

  const labelStyles: Record<string, string> = {
    idle: "bg-white/8 text-white/45",
    selected: "bg-violet-500/35 text-violet-200",
    correct: "bg-emerald-500/35 text-emerald-200",
    incorrect: "bg-red-500/35 text-red-200",
    dimmed: "bg-white/4 text-white/18",
  };

  const categoryColor = question.category === "كمي"
    ? "bg-sky-500/10 border-sky-500/20 text-sky-400"
    : "bg-violet-500/10 border-violet-500/20 text-violet-400";

  const diffLabel = question.difficulty === "easy" ? "سهل" : question.difficulty === "medium" ? "متوسط" : "صعب";
  const diffColor = question.difficulty === "easy"
    ? "text-emerald-400 bg-emerald-500/8 border-emerald-500/18"
    : question.difficulty === "medium"
    ? "text-amber-400 bg-amber-500/8 border-amber-500/18"
    : "text-red-400 bg-red-500/8 border-red-500/18";

  const categoryIcon = question.category === "كمي" ? (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ) : (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );

  return (
    <div className={`max-w-2xl w-full transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* Meta row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${categoryColor}`}>
            {categoryIcon}
            {question.category}
          </span>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-semibold ${diffColor}`}>
            {diffLabel}
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-lg border text-xs text-white/30 border-white/8 bg-white/[0.03]">
            {TYPE_LABELS[question.type]}
          </span>
        </div>
        <span className="text-xs text-white/30 font-medium tabular-nums">
          {questionNumber} / {totalQuestions}
        </span>
      </div>

      {/* Question box */}
      <div className={`border rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-3 transition-colors duration-500 ${
        submitted && isCorrect ? "bg-emerald-500/5 border-emerald-500/20"
        : submitted && isWrong ? "bg-red-500/5 border-red-500/20"
        : "bg-white/[0.04] border-white/10"
      }`}>
        {submitted && (
          <div className={`flex items-center gap-2 mb-3 text-sm font-bold ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
            {isCorrect ? (
              <>
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
                إجابة صحيحة!
              </>
            ) : (
              <>
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </div>
                إجابة خاطئة
              </>
            )}
          </div>
        )}
        <p className="text-lg sm:text-xl font-semibold leading-relaxed text-white">{question.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-2.5" role="radiogroup" aria-label="خيارات الإجابة">
        {question.options.map((option, index) => {
          const state = getOptionState(index);
          return (
            <button
              key={index}
              onClick={() => !submitted && onSelect(index)}
              disabled={submitted}
              aria-pressed={selectedOption === index}
              className={`w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 min-h-[52px] rounded-xl sm:rounded-2xl border transition-all duration-200 text-right ${optionStyles[state]} ${submitted ? "cursor-default" : ""}`}
            >
              <span className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-sm transition-colors ${labelStyles[state]}`}>
                {OPTION_LABELS[index]}
              </span>
              <span className="flex-1 text-sm sm:text-base leading-snug text-right">{option}</span>
              <span className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5">
                {submitted && index === correctIndex && (
                  <svg className="w-full h-full text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                )}
                {submitted && index === selectedOption && index !== correctIndex && (
                  <svg className="w-full h-full text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {submitted && (
        <div className="mt-4 bg-indigo-500/8 border border-indigo-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="font-bold text-indigo-300 text-sm">الشرح</span>
          </div>
          <p className="text-white/65 text-sm leading-relaxed">{question.explanation}</p>
        </div>
      )}

      {/* Keyboard hint — only on non-touch desktop */}
      {!submitted && (
        <p className="hidden sm:block mt-3 text-center text-xs text-white/20">
          اضغط ١—٤ لاختيار الإجابة &nbsp;·&nbsp; Enter للتأكيد
        </p>
      )}
    </div>
  );
}
