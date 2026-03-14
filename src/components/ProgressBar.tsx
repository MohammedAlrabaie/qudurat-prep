interface Props {
  current: number;
  total: number;
  answers: Array<boolean | null>;
}

export default function ProgressBar({ current, total, answers }: Props) {
  const correct = answers.filter((a) => a === true).length;
  const incorrect = answers.filter((a) => a === false).length;
  const answered = correct + incorrect;

  const correctPct = (correct / total) * 100;
  const incorrectPct = (incorrect / total) * 100;
  const remainingPct = ((total - answered) / total) * 100;

  return (
    <div className="w-full" role="progressbar" aria-valuenow={answered} aria-valuemin={0} aria-valuemax={total}>
      {/* Segmented fill bar */}
      <div className="flex h-1 w-full overflow-hidden bg-white/5">
        <div className="bg-emerald-500 transition-all duration-500 ease-out" style={{ width: `${correctPct}%` }} />
        <div className="bg-red-500 transition-all duration-500 ease-out" style={{ width: `${incorrectPct}%` }} />
        <div className="bg-white/10 transition-all duration-500 ease-out" style={{ width: `${remainingPct}%` }} />
      </div>

      {/* Question dots — per-question state */}
      <div className="hidden sm:flex items-center justify-center gap-1.5 px-4 pt-2.5 pb-1 flex-wrap max-w-2xl mx-auto">
        {Array.from({ length: total }, (_, i) => {
          const state = answers[i];
          const isCurrent = i + 1 === current;
          return (
            <div
              key={i}
              title={state === true ? "صحيح" : state === false ? "خاطئ" : isCurrent ? "الحالي" : "لم يُجَب"}
              className={`transition-all duration-300 rounded-full ${
                isCurrent
                  ? "w-4 h-2 bg-violet-400 shadow-sm shadow-violet-400/40"
                  : state === true
                  ? "w-2 h-2 bg-emerald-500"
                  : state === false
                  ? "w-2 h-2 bg-red-500"
                  : "w-2 h-2 bg-white/15"
              }`}
            />
          );
        })}
      </div>

      {/* Mobile: compact text indicator */}
      <div className="sm:hidden flex items-center justify-between px-4 pt-2 pb-1 text-xs text-white/35">
        <span>{answered} / {total} أسئلة</span>
        <span className="flex items-center gap-2">
          <span className="text-emerald-400">{correct} ✓</span>
          {incorrect > 0 && <span className="text-red-400">{incorrect} ✗</span>}
        </span>
      </div>
    </div>
  );
}
