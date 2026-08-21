import type { NumericRange } from "@sveltejs/kit";

export class StatusError extends Error {
  constructor(
    public readonly status: NumericRange<400, 599>,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "StatusError";
  }
}
