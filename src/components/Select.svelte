<script lang="ts">
  import { createSelect } from "@melt-ui/svelte";
  import { slide } from "svelte/transition";

  import { Youtube, Twitch, Telegram } from "./icons.svelte"

  type Props = {
    options: string[];
    selected: string;
  };

  let { options, selected = $bindable() }: Props = $props();

  const {
    elements: { trigger, menu, option },
    states: { selectedLabel, open },
    helpers: { isSelected },
  } = createSelect<string>({
    forceVisible: true,
    positioning: {
      placement: "bottom",
      fitViewport: true,
      sameWidth: true,
    },
    defaultSelected: { value: selected, label: selected },
    onSelectedChange: ({ curr, next }) => {
      selected = next!.value;
      return next;
    },
  });

  function label(item: string) {
    switch (item) {
      case "youtube":
        return "Youtube";
      case "twitch":
        return "Twitch";
      case "post":
        return "Телеграм";
      default:
        return item;
    }
  }
</script>

{#snippet icon(image: string)}
  {#if image === "youtube"}
    <Youtube />
  {:else if image === "twitch"}
    <Twitch />
  {:else if image === "post"}
    <Telegram />
  {/if}
{/snippet}


<div class="container">
  <button class="" {...$trigger} use:trigger aria-label="Шаблоны">
    {@render icon($selectedLabel)}{label($selectedLabel) || "Выберите шаблон..."}
  </button>
  {#if $open}
    <div class="options" {...$menu} use:menu transition:slide={{ duration: 150 }}>
      {#each options as item}
        <div class="option" {...$option({ value: item, label: item })} use:option>
          {@render icon(item)}
          {label(item)}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style lang="css">
  .container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  button {
    display: flex;
    min-width: 220px;
    align-items: center;
    justify-content:flex-start;
    gap: 0.5rem;
    background-color: var(--bg-light);
    color: var(--text);
    font-family: inherit;
    font-size: 1rem;
    border: 0;
    border-radius: 0.3rem;
    padding: 0.4rem 0.7rem;
    cursor: pointer;
  }

  .options {
    list-style: none;
    top: calc(100% + 5px);
    left: 0;
    width: 100%;
    position: absolute;
    overflow: auto;
    background: var(--bg-light);
    max-height: 30vh;
    overscroll-behavior: none;
    border-radius: 8px;
    padding: 0;
    margin: 0;
    z-index: 100;
  }

  .option {
    padding: 0.2rem 0.6rem;
    cursor: pointer;
    scroll-margin: var(--sms-options-scroll-margin, 100px);
    text-align: left;
    display: flex;
    align-items: center;
    justify-content: start;
    gap: 0.5rem;
    flex-direction: row;
  }

  .option:hover {
    background: var(--bg-light-extra);
  }
</style>
