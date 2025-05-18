<script lang="ts">
  import type { Snippet } from "svelte";
  import { fade } from 'svelte/transition';
  import { createTooltip } from "@melt-ui/svelte";

  type Props = {
    children: Snippet;
    tooltip?: string;
    [key: string]: any;
  };

  let { children, tooltip}: Props = $props();

  const {
    elements: { trigger, content, arrow },
    states: { open },
  } = createTooltip({
    positioning: {
      placement: "top",
    },
    openDelay: 500,
    closeDelay: 0,
    closeOnPointerDown: false,
    forceVisible: true,
  });
</script>

{#if tooltip}
  <div {...$trigger} use:trigger class="content">
    {@render children()}
  </div>

  {#if $open}
    <div
      {...$content} use:content
      transition:fade={{ duration: 100 }}
      class="tooltip"
    >
      <div {...$arrow} use:arrow></div>
      <p class="tooltip-text">{tooltip}</p>
    </div>
  {/if}
{:else}
  {@render children()}
{/if}




<style>

  .content {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tooltip {
    background-color: var(--bg-dark-extra);
    border: 1px solid var(--bg-light);
    border-radius: 0.3rem;
    padding: 0.3rem 0.5rem 0.3rem 0.5rem;
    display: flex;
    z-index: 10;
    font-size: smaller;
    color: var(--text-2);
  }

  .tooltip-text {
    margin: 0;
    padding: 0;
  }
</style>