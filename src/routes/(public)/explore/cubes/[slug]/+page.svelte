<script lang="ts">
  import FeatureDisabled from "$lib/components/featureDisabled.svelte";
  import StarRating from "$lib/components/starRating.svelte";
  import CubeVersionType from "$lib/components/cubeVersionType.svelte";
  import AddCube from "$lib/components/addCube.svelte";
    import { formatDate } from "$lib/components/formatDate.svelte";

  let { data } = $props();
  let {
    cube,
    relatedCube,
    cubeTrims,
    sameSeries,
    vendor_links,
    profiles,
    user_ratings,
    cubesAvailability,
    databaseAvailability,
    cubeUserCount,
  } = $derived(data);

  let openAddCard = $state(false);

  function idOfUser(user: string) {
    const profile = profiles?.find(
      (p: { username: string }) => p.username === user
    );
    return profile ? `/user/${profile.id}` : "#";
  }
</script>

{#if databaseAvailability && cubesAvailability}
    <section class="min-h-screen px-6 py-16">
        <div class="max-w-4xl mx-auto">
            <div class="my-6 flex flex-col sm:flex-row items-center gap-6">
                <img
                    src={cube.image_url}
                    alt="{cube.series} {cube.model} {cube.version_name}"
                    class="rounded-2xl bg-base-200 p-4 my-4 border border-base-300 object-contain w-full max-w-md max-h-96"
                />
            </div>
            <h1 class="text-4xl font-bold mb-4 flex items-center gap-3">
                <span class="font-clash">
                    {cube.series}
                    {cube.model}
                    {#if cube.version_type !== "Base"}
                        <span class="text-secondary">{cube.version_name}</span>
                    {/if}
                    <CubeVersionType version_type={cube.version_type} moreInfo={true} />
                </span>
            </h1>

      <!-- Highlighted Rating -->
      <div
        class="flex flex-col items-center justify-center sm:items-start mb-5 sm:mt-0"
      >
        <StarRating rating={cube.rating} large={true} />
      </div>

      <div
        class="mb-4 p-4 bg-base-200 rounded-xl border border-base-300 shadow-sm"
      >
        <p class="leading-relaxed">
          Description:
          <span class="block mt-2">
            The <span class="font-bold text-primary"
              >{`${cube.series} ${cube.model} ${cube.version_type !== "Base" ? cube.version_name : ""}`}</span
            >
            is a
            <span class="font-bold text-primary">{cube.type}</span>
            twisty puzzle released on
            <span class="font-bold text-primary"
              >{formatDate(cube.release_date)}</span
            >. It is
            <span class="font-bold text-primary"
              >{cube.magnetic ? "magnetic" : "non-magnetic"}</span
            >,
            <span class="font-bold text-primary"
              >{cube.smart ? "smart" : "non-smart"}</span
            >, and
            <span class="font-bold text-primary"
              >{cube.wca_legal ? "WCA-legal" : "not WCA-legal"}</span
            >. Currently, it is
            <span class="font-bold text-primary"
              >{cube.discontinued ? "discontinued" : "available"}</span
            >, has a community rating of
            <span class="font-bold text-primary">{cube.rating}/5</span>, and is
            <span class="font-bold text-primary"
              >{cube.modded ? "modded" : "original"}</span
            >.
          </span>
        </p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 mb-4">
        <div
          class="bg-base-200 rounded-xl p-4 flex flex-col gap-2 border border-base-300"
        >
          <div class="flex items-center justify-between">
            <span>Brand:</span>
            <span class="font-medium">{cube.brand}</span>
          </div>
          <div class="flex items-center justify-between">
            <span>Type:</span>
            <span class="font-medium">{cube.type}</span>
          </div>
          <div class="flex items-center justify-between">
            <span>Weight:</span>
            <span class="font-medium">{cube.weight} g</span>
          </div>
          <div class="flex items-center justify-between">
            <span>Surface Finish:</span>
            <span class="font-medium">{cube.surface_finish}</span>
          </div>
          <div class="flex items-center justify-between">
            <span>Release Date:</span>
            <span class="font-medium">{formatDate(cube.release_date)}</span>
          </div>
        </div>
        <div
          class="bg-base-200 rounded-xl p-4 flex flex-col gap-2 border border-base-300"
        >
          <div class="flex items-center justify-between">
            <span>Smart:</span>
            <span class="text-xl">{cube.smart ? "✅" : "❌"}</span>
          </div>
          <div class="flex items-center justify-between">
            <span>Magnetic:</span>
            <span class="text-xl">{cube.magnetic ? "✅" : "❌"}</span>
          </div>
          <div class="flex items-center justify-between">
            <span>Modded:</span>
            <span class="text-xl">{cube.modded ? "✅" : "❌"}</span>
          </div>
          <div class="flex items-center justify-between">
            <span>WCA Legal:</span>
            <span class="text-xl">{cube.wca_legal ? "✅" : "❌"}</span>
          </div>
          <div class="flex items-center justify-between">
            <span>Maglev:</span>
            <span class="text-xl">{cube.maglev ? "✅" : "❌"}</span>
          </div>
        </div>
      </div>
      {#if vendor_links && vendor_links.length > 0}
        <div class="my-8">
          <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
            <i class="fa-solid fa-cart-shopping"></i>
            Available at:
          </h2>
          <div class="flex flex-wrap gap-3">
            {#each vendor_links as shop}
              <a
                href={shop.url}
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-outline {shop.available
                  ? 'btn-primary'
                  : 'btn-error'}"
              >
                {#if shop.available}
                  <i class="fa-solid fa-check"></i>
                {:else}
                  <i class="fa-solid fa-xmark"></i>
                {/if}
                {shop.vendor_name} ・ ≃ {shop.price} $
              </a>
            {/each}
          </div>
        </div>
      {/if}

      <div class="my-8">
        <div class="bg-base-200 rounded-xl p-4 border border-base-300">
          <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
            <i class="fa-regular fa-clock"></i>
            Database Info:
          </h2>
          <div class="flex flex-col sm:flex-row gap-6">
            <div class="flex items-center gap-2">
              <span>ID:</span>{cube.id}
            </div>
            <div class="flex items-center gap-2">
              <span>Added:</span>
              <span class="font-medium">
                {formatDate(cube.created_at)}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span>Last Updated:</span>
              <span class="font-medium">
                {formatDate(cube.updated_at)}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span>Submitted by:</span>
              <a
                class="font-medium underline"
                href={idOfUser(cube.submitted_by)}
              >
                {cube.submitted_by || "Unknown"}
              </a>
            </div>
          </div>
        </div>
      </div>
      {#if cube.version_type === "Base" && cubeTrims && cubeTrims.length > 0}
        <div class="mb-8">
          <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
            <i class="fa-solid fa-palette"></i>
            Select Trim:
          </h2>
          <div class="flex gap-4">
            {#each cubeTrims ?? [] as trim}
              <a
                class="flex flex-col items-center border rounded-xl px-4 py-2 transition duration-200 focus:outline-none border-base-300 bg-base-200 hover:bg-base-300"
                href="/explore/cubes/{trim.slug}"
              >
                <img
                  src={trim.image_url}
                  alt={trim.version_name}
                  class="h-16 object-contain mb-2 rounded"
                />
                <span class="font-medium">{trim.version_name}</span>
              </a>
            {/each}
          </div>
        </div>
      {/if}
      {#if cube.version_type !== "Base" || cube.modded === true}
        <div class="mb-8">
          <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
            <i class="fa-solid fa-palette"></i>
            Related To:
          </h2>
          <div class="flex gap-4">
            <a
              class="flex flex-col items-center border rounded-xl px-4 py-2 transition duration-200 focus:outline-none border-base-300 bg-base-200 hover:bg-base-300"
              href="/explore/cubes/{relatedCube.slug}"
            >
              <img
                src={relatedCube.image_url}
                alt={relatedCube.version_name}
                class="h-16 object-contain mb-2 rounded"
              />
              <span class="font-medium"
                >{relatedCube.series}
                {relatedCube.model}</span
              >
            </a>
          </div>
        </div>
      {/if}
      {#if sameSeries && sameSeries.length > 0 && sameSeries[0]?.series !== ""}
        <div class="mb-8">
          <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
            <i class="fa-solid fa-layer-group"></i>
            In the Same Series:
          </h2>
          <div class="flex flex-wrap gap-4">
            {#each sameSeries as seriesCube}
              <a
                class="flex flex-col items-center border rounded-xl px-4 py-2 transition duration-200 focus:outline-none border-base-300 bg-base-200 hover:bg-base-300 w-36"
                href="/explore/cubes/{seriesCube.slug}"
              >
                <img
                  src={seriesCube.image_url}
                  alt={seriesCube.version_name}
                  class="h-24 object-contain mb-2 rounded"
                />
                <span class="font-medium text-center">
                  {seriesCube.series}
                  {seriesCube.model}
                </span>
              </a>
            {/each}
          </div>
        </div>
      {/if}
      <div class="mb-8">
        <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
          <i class="fa-solid fa-star"></i>
          User Ratings
        </h2>
        {#if user_ratings && user_ratings.length > 0}
          <div class="flex flex-col gap-4">
            {#each user_ratings as rating}
              <div
                class="bg-base-200 rounded-xl p-4 border border-base-300 shadow-sm"
              >
                <div class="flex items-center gap-3 mb-2">
                  <StarRating rating={cube.rating} large={false} />
                  <span class="text-sm">
                    by <a href={idOfUser(rating.username)} class="underline"
                      >{rating.username}</a
                    >
                  </span>
                  <span class="text-xs ml-auto"
                    >{formatDate(rating.created_at)}</span
                  >
                </div>
                {#if rating.comment}
                  <div>
                    {rating.comment}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {:else}
          <div>No user ratings yet. Be the first to rate this cube!</div>
        {/if}
      </div>
      <div class="mt-4">
        <a
          href="/discord"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-error"
        >
          🚩 Report incorrect/missing data
        </a>
      </div>

      <a href="/explore/cubes" class="btn btn-lg btn-primary mt-6">
        ← Back to Explore
      </a>
    </div>
  </section>
{:else if !cubesAvailability}
  <FeatureDisabled featureName="The cubes explore page is" />
{:else if !databaseAvailability}
  <FeatureDisabled featureName="The database is" />
{/if}

{#if openAddCard}
  <AddCube
    onCancel={() => {
      openAddCard = !openAddCard;
    }}
    {cube}
  />
{/if}
