<script lang="ts">
  import ColorPicker from "svelte-awesome-color-picker";

  type Props = {
    label?: string;
    hex?: string;
    onchange?: CustomEvent;
    oninput?: CustomEvent;
  };

  let { label = "", hex = $bindable(), onchange, oninput }: Props = $props();
  let label_cl = $derived(!label || label === "" ? "hide" : "");
</script>

{#if label}
  <span class={label_cl}>{label}</span>
{/if}
<ColorPicker label="" bind:hex position="responsive" on:input on:change />

<style>
  :root {
    --cp-bg-color: var(--bg-light-extra);
    --cp-border-color: var(--bg-light);
    --cp-text-color: var(--text-2);
    --cp-input-color: var(--bg-dark);
    --cp-button-hover-color: var(--bg-light-extra);
    --focus-color: var(--violet);
    --picker-z-index: 10000;
  }

  span {
    font-size: smaller;
    color: var(--text-2);
    padding: 0;
    margin: 0;
    display: inline-block;
  }

  .hide {
    display: none;
  }
</style>
