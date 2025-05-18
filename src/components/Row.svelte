<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet
    [key: string]: any;
  };

  let { children, ...rest }: Props = $props();
</script>

<div class="row" {...rest}>
  {@render children()}
</div>

<style>
  .row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.6rem;
  }
</style>
