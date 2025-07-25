<script lang="ts">
  let {
    value = $bindable(),
    label,
  }: { value: boolean | undefined; label: string } = $props();
  let box: HTMLInputElement;

  function cycle() {
    value = value === undefined ? true : value ? false : undefined;
  }

  $effect(() => {
    const _ = value;
    if (box) {
      box.checked = value === true;
      box.indeterminate = value === false;
      box.setAttribute(
        "aria-checked",
        value === undefined ? "mixed" : value ? "true" : "false"
      );
    }
  });
</script>

<label class="flex items-center space-x-2">
  <input
    class="checkbox bg-base-100"
    type="checkbox"
    bind:this={box}
    onclick={cycle}
  />
  <span>{label}</span>
</label>
