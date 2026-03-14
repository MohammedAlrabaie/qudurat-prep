// ─── Sections (top-level, DB-ready English values) ────────────
export type Section = "verbal" | "quantitative";

// ─── Categories within each section ───────────────────────────
export type VerbalCategory =
  | "vocabulary"   // مفردات — معاني وتعريفات ومرادفات
  | "antonym"      // مضادات — أضداد الكلمات
  | "analogy"      // تناظر — علاقات بين الكلمات
  | "rhetoric"     // بلاغة — تشبيه واستعارة وكناية ومجاز
  | "completion";  // إكمال — جمل وأمثال وأشعار

export type QuantitativeCategory =
  | "arithmetic"    // حساب — عمليات أساسية ونسب ومئوية وفوائد
  | "algebra"       // جبر — معادلات ومجاهيل وأنظمة
  | "geometry"      // هندسة — مساحة ومحيط وحجم وزوايا
  | "sequences"     // متتاليات — أنماط عددية وهندسية
  | "word-problem"; // مسائل لفظية — تطبيقات رياضية على سياقات

export type QuestionCategory = VerbalCategory | QuantitativeCategory;
export type Difficulty = "easy" | "medium" | "hard";

// ─── Core question interface (ready for DB migration) ──────────
export interface Question {
  id: number;
  section: Section;              // "verbal" | "quantitative"
  category: QuestionCategory;   // subcategory type within section
  subcategory: string;          // human-readable Arabic label (e.g., "الاستعارة المكنية")
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctAnswer: string;        // exact text of the correct option
  explanation: string;
  tags: string[];
}

// ─── Derived helper — compute 0-based index of correct answer ─
export function getCorrectIndex(q: Question): number {
  return q.options.indexOf(q.correctAnswer);
}

// ─── Display labels ────────────────────────────────────────────
export const SECTION_LABELS: Record<Section, string> = {
  verbal:       "لفظي",
  quantitative: "كمي",
};

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  vocabulary:     "مفردات",
  antonym:        "مضادات",
  analogy:        "تناظر",
  rhetoric:       "بلاغة",
  completion:     "إكمال",
  arithmetic:     "حساب",
  algebra:        "جبر",
  geometry:       "هندسة",
  sequences:      "متتاليات",
  "word-problem": "مسائل لفظية",
};
