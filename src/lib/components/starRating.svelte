<script lang="ts">
  let { rating, large } = $props();
  const max = 5;

  let fullStars: number = $state(0);
  let halfStar: boolean = $state(false);
  let emptyStars: number = $state(0);

  $effect(() => {
    fullStars = Math.floor(rating);
    halfStar = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  });
</script>

<div class="rating">
  <div
    class="mask mask-star-2 bg-yellow-300"
    aria-label="1 star"
    aria-current={fullStars === 1 ? "true" : undefined}
  ></div>
  <div
    class="mask mask-star-2 bg-yellow-300"
    aria-label="2 star"
    aria-current={fullStars === 2 ? "true" : undefined}
  ></div>
  <div
    class="mask mask-star-2 bg-yellow-300"
    aria-label="3 star"
    aria-current={fullStars === 3 ? "true" : undefined}
  ></div>
  <div
    class="mask mask-star-2 bg-yellow-300"
    aria-label="4 star"
    aria-current={fullStars === 4 ? "true" : undefined}
  ></div>
  <div
    class="mask mask-star-2 bg-yellow-300"
    aria-label="5 star"
    aria-current={fullStars === 5 ? "true" : undefined}
  ></div>
</div>
