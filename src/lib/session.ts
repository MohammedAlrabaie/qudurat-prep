import type { Question } from "@/data/questions";

export type Category = "كمي" | "لفظي" | "مختلط";
export type Difficulty = "easy" | "medium" | "hard" | "all";

// ─── Quiz Setup ──────────────────────────────────────────────
export interface QuizPrefs {
  category: Category;
  difficulty: Difficulty;
  questionCount: number;
  timerSeconds: number;
}

// ─── Per-question result ─────────────────────────────────────
export interface QuestionResult {
  questionId: number;
  category: string;
  difficulty: string;
  correct: boolean;
  timeSpent: number;
  selectedIndex: number;
}

// ─── Full session result ─────────────────────────────────────
export interface SessionResult {
  score: number;
  total: number;
  prefs: QuizPrefs;
  timeTaken: number;
  questionResults: QuestionResult[];
  completedAt: string;
}

// ─── Global persistent stats ─────────────────────────────────
export interface GlobalStats {
  completedQuizzes: number;
  totalCorrect: number;
  totalAnswered: number;
  bestPercentage: number;
  wrongAnswerIds: number[];
  lastPrefs: QuizPrefs;
}

// ─── Wrong answer detail (for review) ────────────────────────
export interface WrongAnswerDetail {
  questionId: number;
  selectedIndex: number;
  sessionDate: string;
}

// ─── Storage keys ────────────────────────────────────────────
const KEYS = {
  SESSION: "q_session",
  STATS: "q_stats",
  WRONG_DETAILS: "q_wrong_details",
};

// ─── Default values ──────────────────────────────────────────
const DEFAULT_PREFS: QuizPrefs = {
  category: "مختلط",
  difficulty: "all",
  questionCount: 10,
  timerSeconds: 1200,
};

const DEFAULT_STATS: GlobalStats = {
  completedQuizzes: 0,
  totalCorrect: 0,
  totalAnswered: 0,
  bestPercentage: 0,
  wrongAnswerIds: [],
  lastPrefs: DEFAULT_PREFS,
};

// ─── Helpers ─────────────────────────────────────────────────
function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded)
  }
}

// ─── Session ─────────────────────────────────────────────────
export function saveSession(result: SessionResult) {
  writeJSON(KEYS.SESSION, result);
  _updateGlobalStats(result);
}

export function loadSession(): SessionResult | null {
  return readJSON<SessionResult | null>(KEYS.SESSION, null);
}

// ─── Global Stats ────────────────────────────────────────────
export function loadStats(): GlobalStats {
  return readJSON(KEYS.STATS, DEFAULT_STATS);
}

function _updateGlobalStats(session: SessionResult) {
  const stats = loadStats();
  const pct = Math.round((session.score / session.total) * 100);

  const nowWrongIds = session.questionResults.filter((r) => !r.correct).map((r) => r.questionId);
  const nowCorrectIds = new Set(session.questionResults.filter((r) => r.correct).map((r) => r.questionId));

  const mergedWrong = [
    ...new Set([...stats.wrongAnswerIds, ...nowWrongIds].filter((id) => !nowCorrectIds.has(id))),
  ];

  writeJSON(KEYS.STATS, {
    completedQuizzes: stats.completedQuizzes + 1,
    totalCorrect: stats.totalCorrect + session.score,
    totalAnswered: stats.totalAnswered + session.total,
    bestPercentage: Math.max(stats.bestPercentage, pct),
    wrongAnswerIds: mergedWrong,
    lastPrefs: session.prefs,
  } satisfies GlobalStats);
}

// ─── Wrong Answer Details ────────────────────────────────────
export function saveWrongDetails(details: WrongAnswerDetail[]) {
  const existing = loadWrongDetails();
  const map = new Map(existing.map((d) => [d.questionId, d]));
  details.forEach((d) => map.set(d.questionId, d));
  writeJSON(KEYS.WRONG_DETAILS, [...map.values()]);
}

export function loadWrongDetails(): WrongAnswerDetail[] {
  return readJSON(KEYS.WRONG_DETAILS, []);
}

export function removeWrongAnswerById(id: number) {
  const stats = loadStats();
  writeJSON(KEYS.STATS, {
    ...stats,
    wrongAnswerIds: stats.wrongAnswerIds.filter((wid) => wid !== id),
  });

  const details = loadWrongDetails().filter((d) => d.questionId !== id);
  writeJSON(KEYS.WRONG_DETAILS, details);
}

// ─── Prefs ───────────────────────────────────────────────────
export function loadPrefs(): QuizPrefs {
  const stats = loadStats();
  return stats.lastPrefs ?? DEFAULT_PREFS;
}

// ─── Utilities ───────────────────────────────────────────────
export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function filterQuestions(allQuestions: Question[], prefs: QuizPrefs): Question[] {
  let pool = [...allQuestions];
  if (prefs.category !== "مختلط") pool = pool.filter((q) => q.category === prefs.category);
  if (prefs.difficulty !== "all") pool = pool.filter((q) => q.difficulty === prefs.difficulty);
  const shuffled = shuffleArray(pool);
  return shuffled.slice(0, Math.min(prefs.questionCount, shuffled.length));
}

export function getStudyRecommendation(session: SessionResult): string {
  const pct = Math.round((session.score / session.total) * 100);
  const verbalResults = session.questionResults.filter((r) => r.category === "لفظي");
  const quantResults = session.questionResults.filter((r) => r.category === "كمي");
  const verbalPct = verbalResults.length
    ? Math.round((verbalResults.filter((r) => r.correct).length / verbalResults.length) * 100)
    : null;
  const quantPct = quantResults.length
    ? Math.round((quantResults.filter((r) => r.correct).length / quantResults.length) * 100)
    : null;

  if (pct >= 90) {
    return "أداء استثنائي! مستواك ممتاز ويُثبت أنك مستعد بقوة لاختبار القدرات. حافظ على هذا المستوى بالمراجعة الدورية.";
  }
  if (pct >= 75) {
    if (verbalPct !== null && quantPct !== null && verbalPct < quantPct) {
      return `أداؤك جيد جداً. نتيجتك في القسم اللفظي (${verbalPct}%) أضعف نسبياً — ركّز على المفردات والأساليب البلاغية.`;
    }
    if (verbalPct !== null && quantPct !== null && quantPct < verbalPct) {
      return `أداؤك جيد جداً. نتيجتك في القسم الكمي (${quantPct}%) أضعف نسبياً — راجع العمليات الحسابية والمسائل التطبيقية.`;
    }
    return "أداؤك جيد جداً! مراجعة بسيطة للمفاهيم الأساسية في القسم الأضعف ستجعلك جاهزاً بشكل كامل.";
  }
  if (pct >= 60) {
    if (verbalPct !== null && quantPct !== null && verbalPct < quantPct) {
      return `تحتاج مزيداً من التدريب على القسم اللفظي (${verbalPct}%). اقرأ قاموساً للمفردات يومياً وتدرّب على أسئلة الفهم والاستيعاب.`;
    }
    if (verbalPct !== null && quantPct !== null && quantPct < verbalPct) {
      return `تحتاج مزيداً من التدريب على القسم الكمي (${quantPct}%). ادرس المفاهيم الرياضية الأساسية وحل مسائل يومية.`;
    }
    return "أداؤك متوسط. خصّص وقتاً يومياً للتدريب على كلا القسمين مع التركيز على نقاط الضعف.";
  }
  return "لا تيأس! الاستمرارية مفتاح النجاح. راجع الإجابات الخاطئة، افهم الشرح جيداً، ثم أعد المحاولة بتركيز أكبر.";
}
