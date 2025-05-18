<script lang="ts">
  import type { Snippet } from "svelte";
  import { createToggleGroup } from "@melt-ui/svelte";

  type Props = {
    options: string[];
    selected: string;
    children: Snippet[];
  };

  let { options, selected = $bindable(), children }: Props = $props();

  const {
    elements: { root, item },
  } = createToggleGroup({
    type: "single",
    loop: true,
    rovingFocus: true,
    defaultValue: selected,
    onValueChange: ({ curr, next }) => {
      if (!next) {
        return curr;
      } else {
        selected = next as string;
        return next;
      }
    },
  });
</script>

<div {...$root} use:root class="container">
  {#each options as option, index}
    <button class="toggle-item" {...$item(option)} use:item>
      {@render children[index]()}
    </button>
  {/each}
</div>

<style>
  .container {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-light);
    border: 1px solid var(--bg-light);
    border-radius: 0.3rem;
  }

  .container:hover {
    border: 1px solid var(--bg-light-extra);
  }


  button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 1rem;
    width: fit-content;
    /* height: 2rem; */
    padding: 0.1rem 0.3rem 0.1rem 0.3rem;
    border-radius: 0.4rem;
    border: 2px solid var(--bg-light);
    color: var(--text);
    cursor: pointer;
    font-family: var(--f1);
    font-size: 1rem;
  }

  button:hover {
    background-color: var(--bg-dark);
  }

  button[data-state="on"] {
    background-color: var(--bg-dark-extra);
  }

  button[data-state="off"] {
    background-color: var(--bg-light);

  }

  .toggle-item {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
