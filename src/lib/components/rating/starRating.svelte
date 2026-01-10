<!-- Code copied from : https://github.com/ErnaneJ/svelte-star-rating/blob/master/src/Stars.svelte
 Your npm package didn't work so I copied the code, srry bro 🙏 -->

<script lang="ts">
  import Star from "./Star.svelte";
  let {
    readOnly = false,
    rating = $bindable(0.0),
  }: {
    readOnly: boolean;
    rating: number;
  } = $props();

  let fills: number[] = $state([]);

  $effect(() => {
    const _ = rating;
    fills = Array.from({ length: 5 }, (_, i) =>
      Math.max(0, Math.min(1, rating - i)),
    );
  });
</script>

<section class="gap-2 flex flex-row items-center">
  <div class="relative flex items-center justify-center gap-2">
    <div class="relative flex flex-row items-center gap-2">
      <div class="flex items-center justify-center gap-2">
        {#each fills as fill, id (id)}
          <Star {id} {readOnly} fillPercentage={fill} />
        {/each}
      </div>
      {#if !readOnly}
        <input
          class="opacity-0 cursor-pointer absolute h-full w-full"
          type="range"
          min={readOnly ? rating : 0.5}
          max={readOnly ? rating : 5}
          step={0.5}
          bind:value={rating}
        />
      {/if}
    </div>
  </div>
</section>
