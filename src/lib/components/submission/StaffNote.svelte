<script lang="ts">
  import ExpandableText from "$lib/components/ui/ExpandableText.svelte";

  interface Props {
    staff_note: string;
  }

  const { staff_note }: Props = $props();
</script>

<section class="rounded-xl border border-error/20 bg-error/10 p-4">
  <div class="mb-2 flex items-center gap-2 text-error">
    <i class="fa-solid fa-message" aria-hidden="true"></i>
    <h3 class="text-xs font-semibold uppercase tracking-wide">
      Moderator note
    </h3>
  </div>
  <ExpandableText text={staff_note} threshold={50} />
</section>
