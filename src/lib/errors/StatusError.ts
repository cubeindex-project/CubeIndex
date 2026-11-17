import type { IntRange } from "type-fest";

export class StatusError extends Error {
  constructor(
    public readonly status: IntRange<400, 600>,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "StatusError";
  }
}
