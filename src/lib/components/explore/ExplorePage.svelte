<script lang="ts" generics="T, SortFields extends readonly SortFieldOption[]">
  import Pagination from "$lib/components/explore/Pagination.svelte";
  import SearchBar from "$lib/components/explore/SearchBar.svelte";
  import FilterSidebar from "$lib/components/explore/FilterSidebar.svelte";
  import ItemsPerPageSelector from "$lib/components/explore/ItemsPerPageSelector.svelte";
  import SortSelector, {
    type SortDirection,
    type SortFieldOption,
  } from "$lib/components/explore/SortSelector.svelte";
  import Fuse, { type IFuseOptions } from "fuse.js";
  import {
    useQueryStates,
    type UseQueryStatesKeysMap,
    type UseQueryStatesReturn,
  } from "nuqs-svelte";
  import { untrack, type Snippet } from "svelte";
  import NoResultsFound from "./NoResultsFound.svelte";

  interface Props {
    header: Snippet;
    searchPlaceholder?: string;
    itemsPerPageLabel?: string;

    items: T[];
    renderItem: Snippet<[item: T]>;

    action?: Snippet;

    queryStateKeyMap: UseQueryStatesKeysMap;

    fuseOptions: IFuseOptions<T>;

    showFilterDrawer: boolean;
    filterFunc?: (
      items: T[],
      params: UseQueryStatesReturn<UseQueryStatesKeysMap>,
    ) => T[];
    filterContent?: Snippet<
      [params: UseQueryStatesReturn<UseQueryStatesKeysMap>]
    >;

    sortFunc: (
      items: T[],
      sortField: SortFields[number]["value"],
      sortDirection: SortDirection,
    ) => T[];
    sortFields: SortFields;
    defaultSortField: SortFields[number]["value"];

    noResultsTitle: string;
    noResultsMessage: string;
    noResultsIcon: string;
    noResultsAction?: Snippet;
  }

  const {
    header,
    searchPlaceholder = "Search items",
    itemsPerPageLabel = "Items per page",
    items,
    renderItem,
    action,
    queryStateKeyMap,
    fuseOptions,
    showFilterDrawer,
    filterFunc,
    filterContent,
    sortFunc,
    sortFields,
    defaultSortField,
    noResultsTitle,
    noResultsMessage,
    noResultsIcon,
    noResultsAction,
  }: Props = $props();

  const params = $derived(
    useQueryStates(queryStateKeyMap, {
      history: "replace",
      clearOnDefault: false,
    }),
  );

  const filteredItems = $derived.by(() =>
    filterFunc ? filterFunc(items, params) : items,
  );

  const fuse = $derived.by(() => new Fuse(filteredItems, fuseOptions));

  let searchInput = $derived(params.q.current);
  let previousPage = $state(untrack(() => params.page.current));
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    const currentPage = params.page.current;

    if (currentPage !== previousPage) {
      previousPage = currentPage;
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  });

  $effect(() => {
    const nextQuery = searchInput.trim();

    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      if (params.q.current !== nextQuery) {
        params.set({
          q: nextQuery,
          sort: null,
          page: 1,
        });
      }
    }, 250);

    return () => clearTimeout(debounceTimer);
  });

  const query = $derived(params.q.current.trim());

  const searchedItems = $derived.by(() => {
    if (!query) {
      return filteredItems;
    }

    return fuse.search(query).map(({ item }) => item);
  });

  const sortedItems = $derived.by(() => {
    // No explicit sort + query: retain Fuse's relevance ranking.
    if (query && params.sort.current === null) {
      return searchedItems;
    }

    // No explicit sort + no query: use the page's standard default.
    const sortField = params.sort.current ?? defaultSortField;

    return sortFunc(searchedItems, sortField, params.dir.current);
  });

  const paginatedItems = $derived.by(() => {
    const start = (params.page.current - 1) * params.size.current;
    const end = start + params.size.current;
    return sortedItems.slice(start, end);
  });

  const totalPages = $derived(
    Math.max(Math.ceil(sortedItems.length / params.size.current), 1),
  );

  function resetFilters() {
    params.set(null);
  }
</script>

<div class="drawer xl:drawer-open">
  <input id="filter-drawer" class="drawer-toggle" type="checkbox" />

  <div class="drawer-content">
    <section class="min-h-screen px-6 py-16">
      <div class="max-w-7xl mx-auto">
        {@render header()}

        <SearchBar
          bind:searchTerm={searchInput}
          showFilterToggle={showFilterDrawer}
          placeholder={searchPlaceholder}
        />

        <div class="flex flex-col lg:flex-row gap-8">
          <div class="flex-1">
            <div
              class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4"
            >
              <div class="flex flex-wrap items-center gap-4">
                <div
                  onchange={() => {
                    params.set({ page: 1 });
                  }}
                >
                  <ItemsPerPageSelector
                    bind:itemsPerPage={params.size.current}
                    label={itemsPerPageLabel}
                  />
                </div>
                <SortSelector
                  bind:sortField={params.sort.current}
                  bind:sortOrder={params.dir.current}
                  defaultField={defaultSortField}
                  fields={sortFields}
                  label="Sort"
                />
              </div>
              {#if action}
                <div>
                  {@render action()}
                </div>
              {/if}
            </div>

            {#if paginatedItems.length > 0}
              <div class="columns-1 sm:columns-2 md:columns-3 my-10">
                {#each paginatedItems as item, index (index)}
                  <div class="mb-4 break-inside-avoid">
                    {@render renderItem(item)}
                  </div>
                {/each}
              </div>
            {:else}
              <NoResultsFound
                title={noResultsTitle}
                message={noResultsMessage}
                icon={noResultsIcon}
                action={noResultsAction}
                {resetFilters}
              />
            {/if}

            <Pagination bind:currentPage={params.page.current} {totalPages} />
          </div>
        </div>
      </div>
    </section>
  </div>
  {#if showFilterDrawer && filterContent}
    <FilterSidebar {resetFilters}>
      <div
        onchange={() => {
          params.set({ page: 1 });
        }}
      >
        {@render filterContent(params)}
      </div>
    </FilterSidebar>
  {/if}
</div>
