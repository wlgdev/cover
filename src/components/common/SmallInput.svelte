<script lang="ts">
  import type { Snippet } from "svelte";
  import Tooltip from "../Tooltip.svelte";

  type Props = {
    value: number | string;
    type: string;
    children?: Snippet;
    max?: number;
    min?: number;
    step?: number;
    tooltip?: string;
    width?: string;
    label_width?: string;
    [key: string]: any;
  };

  let { value = $bindable(), type, children, max, min, step = 1, tooltip, width = "70px", label_width, ...rest }: Props = $props();

  function onwheel(event: WheelEvent) {
    if (typeof value !== "number") return;
    if (event.deltaY * -1 > 0) {
      if (max && value < max) value += step + Number.EPSILON;
    } else {
      if (min && value > min) value -= step + Number.EPSILON;
    }
  }

  let container_style = $derived(type === "text" ? "width: 100%;" : "");
</script>

<Tooltip {tooltip}>
  <div style={container_style}>
    {#if children && label_width}
      <span style="width: {label_width}">
        {@render children()}
      </span>
    {:else if children && label_width === undefined}
      <span>
        {@render children()}
      </span>
    {/if}
    <input {type} bind:value style="width: {width}" onwheel={type === "number" ? onwheel : null} {max} {min} {step} {...rest} />
  </div>
</Tooltip>

<style>
  div {
    display: inline-flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 0.2rem;
    border-radius: 0.3rem;
    background: var(--bg-light);
    border: 1px solid var(--bg-light);
    height: 1.1rem;
  }

  div:hover {
    border: 1px solid var(--bg-light-extra);
  }

  div:focus-within {
    border: 1px solid var(--accent);
  }

  span {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 0.2rem 0 0;
    color: var(--text-2);
    font-size: 0.85rem
  }

  input {
    padding: 0;
    margin: 0;
    border: none;
    outline: none;
    background: none;
    color: var(--text);
    font-size: 0.85rem;
    font-family: var(--f1);
    margin-left: 0.1rem;
    text-align: left;
  }
</style>
