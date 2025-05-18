<script lang="ts">
  import type { ChangeEventHandler, FormEventHandler } from "svelte/elements";

  type Props = {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    placeholder?: string;
    width?: number;
    oninput?: FormEventHandler<HTMLInputElement>;
    onchange?: ChangeEventHandler<HTMLInputElement>;
  };

  let {
    value = $bindable(0),
    min,
    max,
    step = 1,
    width,
    label = "",
    placeholder = "",
    oninput,
    onchange,
  }: Props = $props();
  let style = $derived(width ? "width: " + width + "px;" : "");

  function onwheel(event: WheelEvent) {
    if (event.deltaY * -1 > 0) {
      if (max && value < max) value += step;
    } else {
      if (min && value > min) value -= step;
    }
  }
</script>

<label>
  {label}
  <input type="number" bind:value {min} {max} {step} {placeholder} {oninput} {onchange} {onwheel} {style} />
</label>

<style>
  label {
    font-size: smaller;
    color: var(--text-2);
  }
</style>
