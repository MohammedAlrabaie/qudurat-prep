// Main question bank — re-exports the full typed interface and all questions.
// Add new question sets by importing here and spreading into `questions`.

export type { Category, Difficulty, QuestionType, VerbalType, QuantitativeType, Question } from "./types";
export { getCorrectIndex, TYPE_LABELS } from "./types";

import { verbalQuestions } from "./verbal";
import { quantitativeQuestions } from "./quantitative";

export const questions = [...verbalQuestions, ...quantitativeQuestions];

// ─── Convenience accessors ────────────────────────────────────

export function getById(id: number) {
  return questions.find((q) => q.id === id) ?? null;
}

export function getByCategory(category: "كمي" | "لفظي") {
  return questions.filter((q) => q.category === category);
}

export function getByDifficulty(difficulty: "easy" | "medium" | "hard") {
  return questions.filter((q) => q.difficulty === difficulty);
}

export function getByType(type: import("./types").QuestionType) {
  return questions.filter((q) => q.type === type);
}

// ─── Bank metadata ────────────────────────────────────────────

export const bankStats = {
  total: questions.length,
  verbal: verbalQuestions.length,
  quantitative: quantitativeQuestions.length,
  byDifficulty: {
    easy:   questions.filter((q) => q.difficulty === "easy").length,
    medium: questions.filter((q) => q.difficulty === "medium").length,
    hard:   questions.filter((q) => q.difficulty === "hard").length,
  },
};
