import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { loadSession, loadStats, formatTime, getStudyRecommendation } from "@/lib/session";
import AppHeader from "@/components/AppHeader";

function getGrade(pct: number) {
  if (pct >= 90) return { label: "ممتاز", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/25", ring: "#10b981" };
  if (pct >= 75) return { label: "جيد جداً", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/25", ring: "#7c3aed" };
  if (pct >= 60) return { label: "جيد", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/25", ring: "#6366f1" };
  return { label: "يحتاج مراجعة", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/25", ring: "#f59e0b" };
}

function ScoreRing({ pct, color }: { pct: number; color: string }) {
  const [animated, setAnimated] = useState(0);
  const size = 144;
  const r = size * 0.38;
  const c = 2 * Math.PI * r;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(pct), 80);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg className="-rotate-90 w-full h-full" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={size * 0.07} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
          strokeWidth={size * 0.07} strokeLinecap="round"
          strokeDasharray={`${(animated / 100) * c} ${c}`}
          style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white tabular-nums">{pct}%</span>
        <span className="text-[10px] text-white/40 mt-0.5">النسبة</span>
      </div>
    </div>
  );
}

function BarRow({ label, correct, total, colorClass }: { label: string; correct: number; total: number; colorClass: string }) {
  if (total === 0) return null;
  const pct = Math.round((correct / total) * 100);
  const bgClass = colorClass.replace("text-", "bg-");
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold text-white/70">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${colorClass}`}>{pct}%</span>
          <span className="text-xs text-white/30">{correct}/{total}</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-white/8 overflow-hidden">
        <div className={`h-full rounded-full ${bgClass}`} style={{ width: `${pct}%`, transition: "width 1s ease 0.3s" }} />
      </div>
    </div>
  );
}

function DiffStat({ label, correct, total, color }: { label: string; correct: number; total: number; color: string }) {
  if (total === 0) return null;
  const pct = Math.round((correct / total) * 100);
  return (
    <div className="bg-white/[0.04] border border-white/8 rounded-xl p-3 text-center">
      <p className={`text-lg font-black ${color}`}>{pct}%</p>
      <p className="text-xs text-white/40 mt-0.5">{label}</p>
      <p className="text-[10px] text-white/20 mt-0.5">{correct}/{total}</p>
    </div>
  );
}

export default function ResultPage() {
  const [, navigate] = useLocation();
  const session = loadSession();
  const stats = loadStats();

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0d0f16] flex flex-col items-center justify-center gap-4 px-4" dir="rtl">
        <div className="text-5xl mb-2">📋</div>
        <p className="text-white/55 text-base">لا توجد نتيجة محفوظة</p>
        <button onClick={() => navigate("/")} className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition">
          العودة للرئيسية
        </button>
      </div>
    );
  }

  const { score, total, prefs, timeTaken, questionResults } = session;
  const pct = Math.round((score / total) * 100);
  const grade = getGrade(pct);
  const recommendation = getStudyRecommendation(session);

  const verbalR = questionResults.filter((r) => r.category === "لفظي");
  const quantR = questionResults.filter((r) => r.category === "كمي");
  const easyR = questionResults.filter((r) => r.difficulty === "easy");
  const medR = questionResults.filter((r) => r.difficulty === "medium");
  const hardR = questionResults.filter((r) => r.difficulty === "hard");

  const verbalCorrect = verbalR.filter((r) => r.correct).length;
  const quantCorrect = quantR.filter((r) => r.correct).length;

  const weakestCat =
    verbalR.length > 0 && quantR.length > 0
      ? verbalCorrect / verbalR.length < quantCorrect / quantR.length
        ? "اللفظي"
        : "الكمي"
      : null;

  const avgTime =
    questionResults.length > 0
      ? Math.round(questionResults.reduce((s, r) => s + r.timeSpent, 0) / questionResults.length)
      : 0;

  const wrongInSession = questionResults.filter((r) => !r.correct).length;
  const totalWrong = stats.wrongAnswerIds.length;

  const completedDate = new Date(session.completedAt).toLocaleDateString("ar-SA", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#0d0f16] text-white flex flex-col" dir="rtl">
      <AppHeader subtitle="تقرير الأداء" right={
        <span className="hidden sm:block text-xs text-white/30 border border-white/10 px-3 py-1.5 rounded-lg">
          {completedDate}
        </span>
      } />

      <main className="flex-1 px-4 sm:px-6 py-5 sm:py-6 flex flex-col items-center pb-8">
        <div className="w-full max-w-xl space-y-4">

          {/* ── Hero ── */}
          <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-5">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <ScoreRing pct={pct} color={grade.ring} />
              <div className="flex-1 text-center sm:text-right space-y-2">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-bold ${grade.bg} ${grade.color}`}>
                  {grade.label}
                </div>
                <h2 className="text-3xl font-black">{score} / {total}</h2>
                <p className="text-white/40 text-sm">إجابة صحيحة من أصل {total}</p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="text-xs text-white/35 bg-white/5 px-2.5 py-1 rounded-lg">📚 {prefs.category}</span>
                  {timeTaken > 0 && (
                    <span className="text-xs text-white/35 bg-white/5 px-2.5 py-1 rounded-lg">⏱ {formatTime(timeTaken)}</span>
                  )}
                  {avgTime > 0 && (
                    <span className="text-xs text-white/35 bg-white/5 px-2.5 py-1 rounded-lg">⚡ {avgTime}ث/سؤال</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Quick stats ── */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { v: score, label: "صحيح", color: "text-emerald-400" },
              { v: total - score, label: "خاطئ", color: "text-red-400" },
              { v: stats.completedQuizzes, label: "اختبار", color: "text-violet-400" },
            ].map((s) => (
              <div key={s.label} className="bg-white/[0.04] border border-white/10 rounded-2xl p-3.5 text-center">
                <p className={`text-2xl font-black ${s.color}`}>{s.v}</p>
                <p className="text-xs text-white/40 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Performance by section ── */}
          {(verbalR.length > 0 || quantR.length > 0) && (
            <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">الأداء التفصيلي</h3>

              <div className="space-y-3.5">
                {verbalR.length > 0 && <BarRow label="لفظي" correct={verbalCorrect} total={verbalR.length} colorClass="text-indigo-400" />}
                {quantR.length > 0 && <BarRow label="كمي" correct={quantCorrect} total={quantR.length} colorClass="text-sky-400" />}
              </div>

              {(easyR.length > 0 || medR.length > 0 || hardR.length > 0) && (
                <div className="border-t border-white/8 pt-4">
                  <p className="text-xs text-white/35 mb-3 font-semibold">حسب مستوى الصعوبة</p>
                  <div className="grid grid-cols-3 gap-2">
                    <DiffStat label="سهل" correct={easyR.filter(r => r.correct).length} total={easyR.length} color="text-emerald-400" />
                    <DiffStat label="متوسط" correct={medR.filter(r => r.correct).length} total={medR.length} color="text-amber-400" />
                    <DiffStat label="صعب" correct={hardR.filter(r => r.correct).length} total={hardR.length} color="text-red-400" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Weakest section ── */}
          {weakestCat && (
            <div className="bg-amber-500/6 border border-amber-500/20 rounded-2xl p-4 flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-white/75 mb-0.5">
                  القسم الأضعف: <span className="text-amber-400">{weakestCat}</span>
                </p>
                <p className="text-xs text-white/40 leading-relaxed">
                  {weakestCat === "اللفظي"
                    ? "ركّز على مفردات اللغة العربية والأساليب البلاغية والتشبيه والمجاز."
                    : "ركّز على المفاهيم الرياضية الأساسية والمسائل التطبيقية والمتتاليات."}
                </p>
              </div>
            </div>
          )}

          {/* ── Study recommendation ── */}
          <div className={`rounded-2xl p-5 border ${grade.bg}`}>
            <p className="text-xs font-bold text-white/35 mb-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              التوصية الدراسية
            </p>
            <p className={`text-sm leading-relaxed ${grade.color}`}>{recommendation}</p>
          </div>

          {/* ── Wrong answers CTA ── */}
          {wrongInSession > 0 && (
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-white/75">{wrongInSession} إجابة خاطئة في هذا الاختبار</p>
                {totalWrong > wrongInSession && (
                  <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded">{totalWrong} إجمالي</span>
                )}
              </div>
              <p className="text-xs text-white/35 mb-3 leading-relaxed">راجع إجاباتك الخاطئة مع الشرح التفصيلي لتتجنب نفس الأخطاء مستقبلاً.</p>
              <button
                onClick={() => navigate("/review")}
                className="w-full py-2.5 rounded-xl text-sm font-bold bg-violet-500/10 border border-violet-500/25 text-violet-300 hover:bg-violet-500/18 transition-all duration-200"
              >
                مراجعة الإجابات الخاطئة
              </button>
            </div>
          )}

          {/* ── Lifetime stats ── */}
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-white/35 font-semibold">الإجمالي عبر كل الاختبارات</p>
              <p className="text-sm text-white/60 mt-0.5">
                {stats.totalCorrect} صحيح من {stats.totalAnswered} سؤال
                &nbsp;·&nbsp; أفضل نتيجة <span className="text-violet-400 font-bold">{stats.bestPercentage}%</span>
              </p>
            </div>
          </div>

          {/* ── CTA buttons ── */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => navigate("/setup")}
              className="py-4 rounded-2xl font-bold text-sm bg-gradient-to-l from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
              </svg>
              اختبار جديد
            </button>
            <button
              onClick={() => navigate("/")}
              className="py-4 rounded-2xl font-bold text-sm bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] hover:border-white/18 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              الرئيسية
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
