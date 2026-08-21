/**
 * Converts a camelCase or PascalCase key to snake_case.
 * Treats consecutive capitals as a single acronym, so `typeID` becomes `type_id`.
 *
 * @param key - The key to convert.
 * @returns The snake_case key.
 */
export function camelToSnakeCase(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();
}
