<script lang="ts">
  interface Props {
    value: boolean | null;
    label: string;
    onchange?: () => void;
  }

  let {
    value = $bindable<boolean | null>(null),
    label,
    onchange = () => {},
  }: Props = $props();
  let box: HTMLInputElement;

  function cycle(e: MouseEvent) {
    e.preventDefault();

    value = value === null ? true : value ? false : null;

    box.dispatchEvent(new Event("change", { bubbles: true }));
  }

  $effect(() => {
    if (box) {
      box.checked = value === true;
      box.indeterminate = value === false;
      box.setAttribute(
        "aria-checked",
        value === null ? "mixed" : value ? "true" : "false",
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
    {onchange}
  />
  <span>{label}</span>
</label>
