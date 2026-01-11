// src/lib/security/passwordStrength.ts
// Small, dependency-free heuristic (scores 0-4)
const COMMON = new Set([
  "password","123456","qwerty","111111","123123","letmein","abc123","iloveyou","admin","welcome"
]);

export type StrengthLabel =
  | "very_weak"
  | "weak"
  | "fair"
  | "strong"
  | "very_strong";

export type StrengthSuggestion =
  | "use_longer"
  | "avoid_common"
  | "use_12_plus"
  | "add_uppercase"
  | "add_lowercase"
  | "add_number"
  | "add_symbol";

export type Strength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: StrengthLabel;
  suggestions: StrengthSuggestion[];
};

export function passwordStrength(pw: string): Strength {
  const suggestions: StrengthSuggestion[] = [];
  let score = 0 as Strength["score"];

  if (!pw || pw.length < 4) {
    return {
      score: 0,
      label: "very_weak",
      suggestions: ["use_longer"],
    };
  }

  // Base score from length
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;

  // Character variety
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasDigit = /\d/.test(pw);
  const hasSymbol = /[^A-Za-z0-9]/.test(pw);
  const variety = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;
  if (variety >= 2) score++;
  if (variety >= 3) score++;

  // Penalize common passwords
  if (COMMON.has(pw.toLowerCase())) score = 0;

  // Suggestions
  if (COMMON.has(pw.toLowerCase())) suggestions.push("avoid_common");
  if (pw.length < 12) suggestions.push("use_12_plus");
  if (!hasUpper) suggestions.push("add_uppercase");
  if (!hasLower) suggestions.push("add_lowercase");
  if (!hasDigit) suggestions.push("add_number");
  if (!hasSymbol) suggestions.push("add_symbol");

  // Clamp 0-4
  score = Math.max(0, Math.min(4, score)) as Strength["score"];
  const label = ["very_weak", "weak", "fair", "strong", "very_strong"][score];

  return { score, label, suggestions };
}
