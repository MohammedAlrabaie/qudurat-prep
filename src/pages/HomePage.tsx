import { useLocation } from "wouter";
import { questions } from "@/data/questions";
import { loadStats } from "@/lib/session";
import AppHeader from "@/components/AppHeader";

export default function HomePage() {
  const [, navigate] = useLocation();
  const stats = loadStats();
  const hasHistory = stats.completedQuizzes > 0;
  const wrongCount = stats.wrongAnswerIds.length;
  const avgScore =
    stats.totalAnswered > 0
      ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
      : null;

  const verbalCount = questions.filter((q) => q.category === "لفظي").length;
  const quantCount = questions.filter((q) => q.category === "كمي").length;

  return (
    <div
      className="min-h-screen bg-[#0d0f16] text-white flex flex-col"
      dir="rtl"
    >
      <AppHeader
        subtitle="اختبار القدرات"
        right={
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-white/35 border border-white/10 px-3 py-1.5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            جاهز للتدريب
          </span>
        }
      />

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-6 sm:py-8">
        <div className="w-full max-w-xl space-y-5">
          {/* Hero */}
          <div className="text-center py-1 sm:py-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-4">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              منصة تدريبية لطلاب الثانوية
            </div>
            <h1 className="text-3xl sm:text-4xl font-black mb-2.5 leading-tight">
              ارفع درجتك في{" "}
              <span className="bg-gradient-to-l from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                اختبار القدرات بطريقة أذكى
              </span>
            </h1>
            <p className="text-sm text-white/40 max-w-xs mx-auto leading-relaxed">
              منصة تدريب ذكية لاختبار القدرات، مع تحليل الآداء ومراجعة الأخطاء
              تساعدك بثقة لرفع درجتك.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2.5">
            {hasHistory ? (
              <>
                <StatCard
                  value={stats.completedQuizzes}
                  label="اختبار مكتمل"
                  color="text-violet-400"
                />
                <StatCard
                  value={`${stats.bestPercentage}%`}
                  label="أفضل نتيجة"
                  color="text-emerald-400"
                />
                <StatCard
                  value={avgScore ? `${avgScore}%` : "—"}
                  label="المتوسط"
                  color="text-sky-400"
                />
              </>
            ) : (
              <>
                <StatCard
                  value={questions.length}
                  label="سؤال متاح"
                  color="text-violet-400"
                />
                <StatCard
                  value={verbalCount}
                  label="لفظي"
                  color="text-indigo-400"
                />
                <StatCard value={quantCount} label="كمي" color="text-sky-400" />
              </>
            )}
          </div>

          {/* Primary CTA */}
          <button
            onClick={() => navigate("/setup")}
            className="w-full py-4 rounded-2xl font-black text-lg bg-gradient-to-l from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 shadow-2xl shadow-violet-600/20 hover:shadow-violet-500/30 active:scale-[0.99] flex items-center justify-center gap-3"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 3l14 9-14 9V3z"
              />
            </svg>
            {hasHistory ? "اختبار جديد" : "ابدأ التدريب الآن"}
          </button>

          {/* Wrong answers panel */}
          {wrongCount > 0 && (
            <div className="bg-amber-500/6 border border-amber-500/18 rounded-2xl p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3.5 h-3.5 text-amber-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <p className="font-bold text-amber-300 text-sm">
                    {wrongCount} {wrongCount === 1 ? "سؤال" : "أسئلة"} تحتاج
                    مراجعة
                  </p>
                </div>
                <span className="text-xs text-amber-400/50 bg-amber-500/10 px-2 py-0.5 rounded-lg flex-shrink-0">
                  أخطاء متراكمة
                </span>
              </div>
              <p className="text-xs text-white/35 mb-3.5 leading-relaxed">
                مراجعة الأخطاء هي أسرع طريقة لتحسين نتيجتك. افهم الشرح وحاول مرة
                أخرى.
              </p>
              <div className="flex gap-2.5">
                <button
                  onClick={() => navigate("/review")}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-amber-500/12 border border-amber-500/25 text-amber-300 hover:bg-amber-500/20 transition-all duration-200"
                >
                  مراجعة الأخطاء
                </button>
                <button
                  onClick={() => navigate("/practice?retry=wrong")}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-white/[0.05] border border-white/10 text-white/55 hover:bg-white/[0.08] transition-all duration-200"
                >
                  تدريب الأخطاء
                </button>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              {
                icon: "🎯",
                title: "تغذية راجعة فورية",
                desc: "اعرف نتيجتك بعد كل إجابة مع شرح مفصّل",
              },
              {
                icon: "📊",
                title: "تحليل الأداء",
                desc: "تقرير تفصيلي بعد كل اختبار مع توصية دراسية",
              },
              {
                icon: "🔁",
                title: "مراجعة الأخطاء",
                desc: "أعد التدريب على الأسئلة التي أخطأت فيها",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/12 transition-colors"
              >
                <span className="text-xl mt-0.5 flex-shrink-0">{f.icon}</span>
                <div>
                  <p className="font-bold text-sm text-white/80">{f.title}</p>
                  <p className="text-xs text-white/35 mt-0.5 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/6 px-6 py-3.5 text-center text-xs text-white/15">
        منصة قُدُرات © {new Date().getFullYear()} — للتدريب على اختبار هيئة
        تقويم التعليم
      </footer>
    </div>
  );
}

function StatCard({
  value,
  label,
  color,
}: {
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-3.5 sm:p-4 text-center">
      <p className={`text-xl sm:text-2xl font-black ${color} tabular-nums`}>
        {value}
      </p>
      <p className="text-xs text-white/40 mt-1 leading-tight">{label}</p>
    </div>
  );
}
