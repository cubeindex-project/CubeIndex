interface Time {
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export function millisecondsToTime(milliseconds: number | null): Time {
  if (!milliseconds) return { minutes: 0, seconds: 0, milliseconds: 0 };

  const minutes = Math.floor(milliseconds / 60_000);
  const remainingMilliseconds = milliseconds % 60_000;

  const seconds = Math.floor(remainingMilliseconds / 1_000);
  const ms = remainingMilliseconds % 1_000;

  return { minutes, seconds, milliseconds: ms };
}

export function timeToMilliseconds({
  minutes,
  seconds,
  milliseconds,
}: Time): number {
  return minutes * 60_000 + seconds * 1_000 + milliseconds;
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
