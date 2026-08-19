const VALUE_OTHER = "___other" as const;

export function isValueOther(value: unknown): value is typeof VALUE_OTHER {
  return value === VALUE_OTHER;
}
