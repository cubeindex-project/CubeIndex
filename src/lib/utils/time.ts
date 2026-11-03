/** Parses a duration in seconds or minutes:seconds, retaining millisecond precision. */
export function parseTimeInput(input: string): number | null {
  const value = input.trim();
  if (!value) return null;

  const match = /^(?:(\d+):)?(\d+)(?:\.(\d{1,3}))?$/.exec(value);
  if (!match) {
    throw new Error(
      "Use seconds (12.34) or minutes:seconds (1:23.45), with up to 3 decimal places.",
    );
  }

  const [, minutes, seconds = "0", fraction = ""] = match;
  if (minutes !== undefined && Number(seconds) >= 60) {
    throw new Error("Seconds must be less than 60 when using minutes:seconds.");
  }

  const milliseconds =
    Number(minutes ?? 0) * 60_000 +
    Number(seconds) * 1_000 +
    Number(fraction.padEnd(3, "0"));
  if (!Number.isSafeInteger(milliseconds) || milliseconds > 2_147_483_647) {
    throw new Error("Best time cannot exceed 35791:23.647.");
  }
  return milliseconds;
}

/** Formats a duration for editing, using total minutes to preserve longer times. */
export function formatTimeInput(milliseconds: number | null): string {
  if (milliseconds === null) return "";
  const minutes = Math.floor(milliseconds / 60_000);
  const seconds = Math.floor((milliseconds % 60_000) / 1_000);
  const fraction = String(milliseconds % 1_000).padStart(3, "0");
  return `${minutes > 0 ? `${minutes}:` : ""}${minutes > 0 ? String(seconds).padStart(2, "0") : seconds}.${fraction}`;
}

interface Time {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export function millisecondsToTime(milliseconds: number | null): Time {
  if (!milliseconds)
    return { days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };

  const days = Math.floor(milliseconds / 86_400_000);
  let remainingMilliseconds = milliseconds % 86_400_000;

  const hours = Math.floor(remainingMilliseconds / 3_600_000);
  remainingMilliseconds = milliseconds % 3_600_000;

  const minutes = Math.floor(remainingMilliseconds / 60_000);
  remainingMilliseconds = milliseconds % 60_000;

  const seconds = Math.floor(remainingMilliseconds / 1_000);
  const ms = remainingMilliseconds % 1_000;

  return { days, hours, minutes, seconds, milliseconds: ms };
}

export function timeToMilliseconds({
  days,
  hours,
  minutes,
  seconds,
  milliseconds,
}: Time): number {
  return (
    days * 86_400_000 +
    hours * 3_600_000 +
    minutes * 60_000 +
    seconds * 1_000 +
    milliseconds
  );
}

export function formatTime({
  minutes,
  seconds,
  milliseconds,
}: Time): string | null {
  if (minutes === 0 && seconds === 0 && milliseconds === 0) {
    return null;
  }

  const formattedSeconds =
    minutes > 0 ? String(seconds).padStart(2, "0") : String(seconds);
  const formattedMilliseconds = String(milliseconds).padStart(3, "0");

  return minutes > 0
    ? `${minutes}:${formattedSeconds}.${formattedMilliseconds}`
    : `${formattedSeconds}.${formattedMilliseconds}`;
}
