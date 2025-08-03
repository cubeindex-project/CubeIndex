<script lang="ts">
  const { data } = $props();
  const displayName = $derived(
    data?.user?.user_metadata?.full_name ?? data?.user?.email ?? "Cuber"
  );
</script>

<section class="p-8">
  <h1 class="text-3xl font-bold">Welcome back, {displayName}!</h1>
  <p>Check out your collection and recent activity.</p>
</section>
