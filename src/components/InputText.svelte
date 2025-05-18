
<script module>
  let input_text_counter = 0;
</script>

<script lang="ts">
  import type { ChangeEventHandler, FormEventHandler } from "svelte/elements";

  type Props = {
    placeholder?: string;
    value?: string;
    label?: string;
    width?: number;
    cl?: string;
    onchange?: ChangeEventHandler<HTMLInputElement>
    oninput?: FormEventHandler<HTMLInputElement>
  };

  let { placeholder, value = $bindable(), label, width, cl = $bindable(), onchange, oninput, ...props }: Props = $props();
  let style = $derived(width ? "width: " + width + "px;" : "");
  let id = "input_text_" + input_text_counter++;
</script>

{#if label}<label for={id}>{label}</label>{/if}
<input {id} class={cl} type="text" bind:value {onchange} {oninput} {placeholder} {style} {...props} />

<style>
  label {
    font-size: smaller;
    color: var(--text-2);
  }
</style>
