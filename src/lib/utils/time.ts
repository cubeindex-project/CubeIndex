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
