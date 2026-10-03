<script lang="ts">
  import type { Tables } from "$lib/types/database.types";
  import type { EventPhase } from "$lib/utils/eventPhase";
  import { formatDate } from "$lib/utils/formatDate";
  import { millisecondsToTime } from "$lib/utils/time";

  interface Props {
    countdownLabel: string;
    event: Pick<Tables<"awards_event">, "start_at" | "end_at">;
    eventPhase: EventPhase;
    variant?: "compact" | "featured";
  }

  const {
    countdownLabel,
    event,
    eventPhase,
    variant = "compact",
  }: Props = $props();

  let nowMs = $state(Date.now());
  $effect(() => {
    const id = setInterval(() => {
      nowMs = Date.now();
    }, 1000);
    return () => clearInterval(id);
  });

  function formatCountdown(targetMs: number | null) {
    if (!targetMs) return "0s";

    const diffMs = targetMs - nowMs;

    if (!Number.isFinite(diffMs) || diffMs <= 0) return "0s";
    const { days, hours, minutes, seconds } = millisecondsToTime(diffMs);
    const parts = [
      days > 0 ? `${days}d` : null,
      `${hours}h`,
      `${minutes}m`,
      `${seconds}s`,
    ].filter(Boolean);
    return parts.join(" ");
  }

  const startTime = $derived(new Date(event.start_at));
  const endTime = $derived(new Date(event.end_at));

  const startCountdownLabel = $derived(formatCountdown(startTime.getTime()));
  const endCountdownLabel = $derived(formatCountdown(endTime.getTime()));
</script>

<div
  class={variant === "featured"
    ? "mx-auto flex max-w-sm flex-col items-center gap-2 rounded-2xl border border-base-200 bg-base-200/50 px-6 py-5 shadow-sm"
    : "rounded-2xl border border-base-300 bg-base-100 px-4 py-3 text-right shadow-sm"}
>
  <p class="text-xs text-base-content/60">{countdownLabel}</p>
  <p
    class={variant === "featured"
      ? "text-2xl font-semibold"
      : "text-lg font-semibold"}
  >
    {eventPhase === "live"
      ? endCountdownLabel
      : eventPhase === "upcoming"
        ? startCountdownLabel
        : ""}
  </p>
  <span class="text-sm text-base-content/60">
    {eventPhase === "live"
      ? formatDate(endTime)
      : eventPhase === "upcoming"
        ? formatDate(startTime)
        : ""}
  </span>
</div>
