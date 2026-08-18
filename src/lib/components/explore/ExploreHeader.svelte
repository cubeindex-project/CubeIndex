<script lang="ts">
  interface Props {
    title: string;
    subtitle: string;
  }

  const { title, subtitle }: Props = $props();
</script>

<header class="flex flex-col gap-6 text-center mb-12 w-full">
  <h1 class="text-4xl font-clash font-bold">{title}</h1>
  <p>{subtitle}</p>
</header>
