<script lang="ts">
  import { createCollapsible } from "@melt-ui/svelte";
  import { slide } from "svelte/transition";
  import type { Snippet } from 'svelte';

  type Props = {
    title: string;
    collapsed?: boolean;
    children: Snippet;
  };

  let { title, collapsed = false, children }: Props = $props();

  const {
    elements: { root, content, trigger },
    states: { open },
  } = createCollapsible();

  open.set(!collapsed);
</script>

<div {...$root} use:root class="root">
  <div class="header">
    <span class="label" {...$trigger} use:trigger>{title}</span>
    <button {...$trigger} use:trigger>
      <div class="abs-center">
        {#if $open}
          -
        {:else}
          +
        {/if}
      </div>
    </button>
  </div>
  {#if $open}
    <div {...$content} use:content transition:slide>
      <div class="collapsible">
        <div class="item">
          <span>{@render children()}</span>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .root {
    background-color: var(--bg-medium);
    margin-top: 5px;
    margin-bottom: 5px;
    padding: 5px;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 10px 5px 10px;
    font-weight: 600;
  }

  .label {
    font-size: 1.2rem;
    line-height: 1.5rem;
    cursor: pointer;
  }

  button {
    position: relative;
    height: 1.5rem;
    width: 1.5rem;
    place-items: center;
    border-radius: 10px;
    border: 0px;
    background-color: var(--bg-light-extra);
    color: var(--text);
    font-size: 0.875rem;
    line-height: 1.25rem;
    cursor: pointer;
  }

  button:hover {
    opacity: 0.75;
  }

  .item {
    border-top: 1px solid var(--bg-light-extra);
    padding: 10px;
    border-radius: 0.25rem;
    background-color: rgb(var(--color-white) / 1);
    box-shadow:
      0 10px 15px -3px rgb(var(--color-black) / 0.1),
      0 4px 6px -4px rgb(var(--color-black) / 0.1);
  }
</style>
