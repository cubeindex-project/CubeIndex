// src/lib/security/passwordStrength.ts
// Small, dependency-free heuristic (scores 0-4)
const COMMON = new Set([
  "password","123456","qwerty","111111","123123","letmein","abc123","iloveyou","admin","welcome"
]);

export type Strength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Very weak" | "Weak" | "Fair" | "Strong" | "Very strong";
  suggestions: string[];
};

export function passwordStrength(pw: string): Strength {
  const suggestions: string[] = [];
  let score = 0 as Strength["score"];

  if (!pw || pw.length < 4) {
    return { score: 0, label: "Very weak", suggestions: ["Use a longer password"] };
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
  if (COMMON.has(pw.toLowerCase())) suggestions.push("Avoid common passwords");
  if (pw.length < 12) suggestions.push("Use 12+ characters");
  if (!hasUpper) suggestions.push("Add an uppercase letter");
  if (!hasLower) suggestions.push("Add a lowercase letter");
  if (!hasDigit) suggestions.push("Add a number");
  if (!hasSymbol) suggestions.push("Add a symbol");

  // Clamp 0-4
  score = Math.max(0, Math.min(4, score)) as Strength["score"];
  const label = ["Very weak", "Weak", "Fair", "Strong", "Very strong"][score];

  return { score, label: label as Strength["label"], suggestions };
}
