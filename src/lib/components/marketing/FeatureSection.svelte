<script lang="ts">
  /**
   * A full-width marketing feature section with alternating layout.
   *
   * - Mobile-first: stacks vertical; desktop: two-column grid
   * - Uses Tailwind + DaisyUI for consistent styling
   */
  export let title: string;
  export let eyebrow: string | undefined = undefined;
  export let description: string;
  export let highlights: string[] | undefined = undefined;
  export let imageSrc: string;
  export let imageAlt: string;
  /** When true, image appears on the left on large screens */
  export let reverse: boolean = false;
</script>

<section class="w-full bg-base-100">
  <div
    class="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-24 grid gap-10 items-center lg:grid-cols-2"
    class:lg:[@container]={true}
  >
    <div class:order-last={reverse} class="space-y-6">
      {#if eyebrow}
        <p class="text-sm font-semibold tracking-wider text-primary uppercase">
          {eyebrow}
        </p>
      {/if}
      <h2 class="text-3xl sm:text-4xl font-clash font-extrabold leading-tight">
        {title}
      </h2>
      <p class="text-base sm:text-lg text-base-content/80 max-w-prose">
        {description}
      </p>

      {#if highlights && highlights.length}
        <ul class="mt-4 grid gap-3 sm:grid-cols-2">
          {#each highlights as point}
            <li class="flex items-start gap-3">
              <span class="badge badge-primary badge-sm mt-1" aria-hidden="true"></span>
              <span class="text-base-content/90">{point}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <div class:order-first={reverse} class="w-full">
      <figure class="w-full overflow-hidden rounded-2xl border border-base-300 shadow">
        <img
          src={imageSrc}
          alt={imageAlt}
          class="w-full h-auto object-cover"
          loading="lazy"
          decoding="async"
        />
      </figure>
    </div>
  </div>
</section>

<style>
  /* no component-scoped styles; Tailwind/DaisyUI only */
  @supports not (container-type: inline-size) {
    /* nothing critical; graceful degradation */
  }
</style>

