/**
 * Return the sub-type(s) corresponding to a twisty-puzzle “type”.
 * The mapping is built from the public taxonomy used by the cubing
 * community (Speedsolving Wiki, Ruwix, Cubelelo, etc.).
 *
 * @param {string} type – e.g. "Petaminx", "3x3x3", "2x2x3", "Mirror"
 * @returns {string}  sub-types, or [] if unknown
 */
export function getSubTypes(type: string) {
  if (!type) return "";

  const t = type.trim().toLowerCase();

  /* ---------- 1. MINX (dodecahedrons) ---------- */
  if (t.includes("minx")) return "Minx";

  /* ---------- 2. PYRAMINX (tetrahedrons) ---------- */
  if (t.includes("pyraminx")) return "Pyraminx";

  /* ---------- 3. SQUARE-1 family ---------- */
  if (t.startsWith("square-")) return "Square-1";

  /* ---------- 4. CORNER-TURNING puzzles ---------- */
  if (
    t.includes("skewb") ||
    t.includes("dino") || // Dino Cube
    t.includes("ivy") || // Ivy Cube
    t.includes("redi") // Redi Cube
  ) {
    return "Corner-Turning";
  }

  /* ---------- 5. GEAR puzzles ---------- */
  if (t.includes("gear")) return "Gear";

  /* ---------- 6. CUBES vs CUBOIDS ---------- */
  const m = t.match(/^(\d+)x(\d+)x(\d+)$/);
  if (m) {
    const [, a, b, c] = m.map(Number);
    if (a === b && b === c) return "NxNxN"; // perfect cube
    return "Cuboid"; // at least one unequal edge
  }

  /* ---------- 7. SHAPE-SHIFTING / SHAPE-MODS ---------- */
  if (
    t.includes("mirror") ||
    t.includes("ghost") ||
    t.includes("axis") ||
    t.includes("fisher") ||
    t.includes("windmill") ||
    t.includes("morphix") ||
    t.includes("shape mod")
  ) {
    return "Shape-Shifting";
  }

  /* ---------- 8. FALLBACK ---------- */
  return null;
}
