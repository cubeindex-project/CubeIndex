<script lang="ts">
  import StarRating from "./starRating.svelte";
  import CubeVersionType from "./cubeVersionType.svelte";
  import AddCube from "./addCube.svelte";

  let { cube, rate, add, details, badges, user_details = [], image } = $props();

  let open = $state(false);

  const user_details_cube = user_details.filter((ud) => ud.cube === cube.slug);
</script>

<div>
  <div
    class="bg-base-200 border border-base-300 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition flex flex-col"
  >
    {#if image}
      <img
        src={cube.image_url}
        alt={cube.name}
        class="w-full h-48 object-cover"
      />
    {/if}
    <div class="p-5 flex-1 flex flex-col">
      <h2 class="text-xl font-bold mb-1">
        {cube.series}
        {cube.model}
        {#if cube.version_type !== "Base"}
          <span class="text-blue-400">{cube.version_name}</span>
        {/if}
        {#if badges}
          <CubeVersionType {cube} moreInfo={false} />
        {/if}
      </h2>
      <p class="text-sm text-gray-400">
        {cube.type} ・ {cube.brand}
      </p>
      <div class="mt-3">
        <StarRating rating={cube.rating} large={false} />
      </div>
      <div class="mt-4 flex gap-2">
        {#if add}
          <button
            class="btn btn-secondary flex-1"
            type="button"
            onclick={() => {
              open = !open;
            }}
            aria-label="Add to Collection"
          >
            <i class="fa-solid fa-plus mr-2"></i>
            Add to Collection
          </button>
        {/if}
        {#if rate}
          <button
            class="btn btn-accent flex-1"
            type="button"
            aria-label="Rate this Cube"
            disabled
          >
            <i class="fa-solid fa-star mr-2"></i>
            Rate this Cube
          </button>
        {/if}
        {#if user_details.length > 0}
          <div>
            {#if user_details_cube[0].condition}
              <p>
                <span class="font-bold">Condition:</span>
                {user_details_cube[0].condition}
              </p>
            {/if}
            {#if user_details_cube[0].status}
              <p>
                <span class="font-bold">Status:</span>
                {user_details_cube[0].status}
              </p>
            {/if}
            {#if user_details_cube[0].quantity}
              <p>
                <span class="font-bold">Quantity:</span>
                {user_details[0].quantity}
              </p>
            {/if}
            {#if user_details_cube[0].notes}
              <p>
                <span class="font-bold">Notes:</span>
                {user_details_cube[0].notes}
              </p>
            {/if}
            {#if user_details_cube[0].acquired_date}
              <p>
                <span class="font-bold">Acquired Date:</span>
                {user_details_cube[0].acquired_date}
              </p>
            {/if}
          </div>
        {/if}
      </div>
      {#if details}
        <a
          href="/explore/cubes/{cube.slug}"
          class="btn btn-primary mt-4"
          aria-label="View Cube Details"
        >
          View Details
          <i class="fa-solid fa-arrow-right"></i>
        </a>
      {/if}
    </div>
  </div>
  <AddCube {open} slug={cube.slug} />
</div>
