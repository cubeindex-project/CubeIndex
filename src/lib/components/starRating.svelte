<script lang="ts">
  let { rating, large } = $props();
  const max = 5;

  let fullStars: number = $state(0);
  let halfStar: boolean = $state(false);
  let emptyStars: number = $state(0);

  $effect(() => {
    fullStars = Math.floor(rating);
    halfStar = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
    emptyStars = max - fullStars - (halfStar ? 1 : 0);
  });
</script>

<div class="flex items-center space-x-1">
  {#each Array(fullStars) as _, i}
    <i class="fa-solid fa-star {large === true ? 'fa-2x' : ''} text-yellow-300"></i>
  {/each}
  {#if halfStar}
    <i
      class="fa-solid fa-star-half-stroke {large === 2
        ? 'fa-2x'
        : ''} text-yellow-300"
    ></i>
  {/if}
  {#each Array(emptyStars) as _, i}
    <i class="fa-regular fa-star {large === true ? 'fa-2x' : ''} text-yellow-300"
    ></i>
  {/each}
  <!-- <span class="ml-2 text-3xl text-white">{rating.toFixed(2)}</span> -->
</div>
