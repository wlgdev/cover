<script lang="ts">
  import { slide, fade } from "svelte/transition";
  import type { Writable } from "svelte/store";
  import { createTagsInput } from "@melt-ui/svelte";

  import { search } from "../common/twitch";
  import type { Categories } from "../drawer/shared";

  export let categories: Writable<Categories>;
  export let selected: { name: string; src: string; id: number }[] = [];

  let options: { name: string; src: string }[] = [];
  let open_options = false;
  let loading = false;
  let input_value = "";
  let last_query = "";
  let timeout_id: number | null = null;
  let cur_index = 0;
  const throttle_delay = 500;

  const {
    elements: { root, tag, deleteTrigger },
    states: { tags },
  } = createTagsInput({
    defaultTags: [],
    remove: (tag) => {
      removeCategory(tag.id);
      return true;
    },
    add(tag) {
      return { id: (++cur_index).toString(), value: tag };
    },
  });

  if (selected.length > 0) {
    tags.set(
      selected.map((category, index) => {
        cur_index = index;
        return { id: index.toString(), value: category.name };
      }),
    );
  }

  function pickOption(event: MouseEvent) {
    const name = (event.target as HTMLLIElement).dataset.value!;
    const src = (event.target as HTMLLIElement).dataset.src!;
    addCategory(name, src);

    setTimeout(() => {
      open_options = false;
      options = [];
      input_value = "";
      last_query = "";
    }, 50);
  }

  async function load() {
    if (input_value === last_query || input_value === "") return;
    loading = true;
    last_query = input_value;
    const metadata = await search([input_value]);
    options = metadata[0]
      .filter((game: any) => game.name != "Nothing found")
      .filter((game: any) => !$tags.find((tag) => tag.value === game.name))
      .map((game: any) => ({ name: game.name, src: game.cover }));
    loading = false;
    open_options = true;
  }

  async function fetchOptions() {
    if (!input_value || input_value.length < 3) {
      open_options = false;
      return;
    }
    if (timeout_id) clearTimeout(timeout_id);
    timeout_id = setTimeout(async () => await load(), throttle_delay);
  }

  function addCategory(name: string, src: string) {
    selected.push({ name, src, id: ++cur_index });
    categories.set({
      ...$categories,
      src: selected.map((category) => category.src),
      names: selected.map((category) => category.name),
    });
    tags.update((tags) => {
      tags.push({ id: cur_index.toString(), value: name });
      return tags;
    });
  }

  export function addManualCategory(src: string, name: string = "manual") {
    if (!src) return;
    addCategory(name, src);
  }

  function removeCategory(id: string) {
    selected = selected.filter((category) => category.id !== Number(id));
    categories.set({
      ...$categories,
      src: selected.map((category) => category.src),
      names: selected.map((category) => category.name),
    });
  }

  function onFocusOut() {
    setTimeout(() => {
      if (open_options) {
        options = [];
        open_options = false;
        input_value = "";
        last_query = "";
      }
    }, 300);
  }

  $: {
    if (input_value) {
      fetchOptions();
    }
  }
</script>

<div class="container">
  <div {...$root} use:root class="root">
    <div class="tags">
      {#each $tags as t}
        <div {...$tag(t)} use:tag class="tag" transition:fade={{ duration: 150 }}>
          {t.value}
          <button {...$deleteTrigger(t)} use:deleteTrigger class="delete">🗙</button>
        </div>
      {/each}
      <div class="input-container">
        <input
          bind:value={input_value}
          on:change={fetchOptions}
          on:focusout={onFocusOut}
          type="text"
          placeholder="введите категорию..."
          class="input"
        />
        {#if loading}
          <div class="loader"></div>
        {/if}
      </div>
    </div>
    {#if open_options}
      <ul class="options" role="listbox" aria-multiselectable="false" transition:slide={{ duration: 250 }}>
        {#each options as option}
          <!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <li
            class="option"
            on:click={pickOption}
            role="option"
            aria-selected="false"
            data-value={option.name}
            data-src={option.src}
          >
            {option.name}
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

<style>
  div.container {
    position: relative;
    align-items: center;
    display: flex;
    cursor: text;
    box-sizing: border-box;
  }

  div.tags {
    display: flex;
    flex: 1;
    padding: 0;
    margin: 0;
    flex-wrap: wrap;
  }

  div.tag {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 3pt;
    margin: 0.2rem 0.1rem;
    background: var(--bg-light-extra);
    padding: 0.2rem 0.2rem 0.2rem 0.3rem;
    color: var(--text);
    font-size: smaller;
  }

  button.delete {
    cursor: pointer;
    background: none;
    border: none;
    color: var(--text-2);
    display: flex;
    padding: 0;
    padding-bottom: 0.15rem;
    margin-left: 0.2rem;
  }

  button.delete:hover {
    color: var(--text);
  }

  input {
    margin-left: 0.2rem;
    padding-left: 0.3rem;
    min-width: 7rem;
    width: auto;
  }

  ul.options {
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

  li.option {
    padding: 0.2rem 0.6rem;
    cursor: pointer;
    scroll-margin: var(--sms-options-scroll-margin, 100px);
    text-align: left;
    display: block;
    z-index: 200;
  }

  li.option:hover {
    background: var(--bg-light-extra);
  }

  .input-container {
    position: relative;
  }

  .loader {
    position: absolute;
    width: 1rem;
    height: 1rem;
    right: 0.2rem;
    bottom: 0.2rem;
    border-radius: 50%;
    border: 0.3rem solid var(--bg-light);
    border-top-color: var(--violet);

    animation: 2s infinite rotation;
  }
  @keyframes rotation {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
