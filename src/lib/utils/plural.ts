export function plural(n: number, s: string) {
  return n === 1 ? s : `${s}s`;
}
