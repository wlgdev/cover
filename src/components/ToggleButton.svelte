<script lang="ts">
  import type { Snippet } from "svelte";
  import { Toggle } from "bits-ui";

  import Tooltip from "./Tooltip.svelte";

  type Props = {
    children: Snippet
    checked: boolean;
    tooltip?: string;
    [key: string]: any;
  };

  let { children, checked = $bindable(false), tooltip, ...rest }: Props = $props();
</script>

<Tooltip tooltip={tooltip}>
  <Toggle.Root bind:pressed={checked} {...rest} >
    {@render children()}
  </Toggle.Root>
</Tooltip>
