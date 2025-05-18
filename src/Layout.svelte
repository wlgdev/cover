<script lang="ts">
  import type { Readable, Writable } from "svelte/store";
  import type { Background } from "./drawer/shared";

  import * as Video from "./modules/video";
  import * as Stream from "./modules/stream";
  import * as Post from "./modules/post";
  import Select from "./components/Select.svelte";
  import { countAspectRatio } from "./common";
  import { tick } from "svelte";

  import Testing from "./components/Testing.svelte";

  let selector = $state(localStorage.getItem("template") ?? "youtube");

  let background: Writable<Background>;
  let appstate: Writable<any>;
  let datastate: Readable<any>;

  let current_loaded_src = "";

  // @ts-ignore
  window.addEventListener("texture_loaded", (event: CustomEvent) => {
    if (event.detail === current_loaded_src) {
      $appstate.background_loading = false;
      current_loaded_src = "";
    }
  });

  $effect(() => {
    switch (selector) {
      case "youtube":
        background = Video.background;
        datastate = Video.datastate;
        appstate = Video.appstate;
        break;
      case "twitch":
        background = Stream.background;
        datastate = Stream.datastate;
        appstate = Stream.appstate;
        break;
      case "post":
        background = Post.background;
        datastate = Post.datastate;
        appstate = Post.appstate;
      default:
        break;
    }
    localStorage.setItem("template", selector);
    tick();
  });

  function onPaste(event: ClipboardEvent) {
    if ((event?.target as Node)?.nodeName === "INPUT" || (event?.target as Node)?.nodeName === "TEXTAREA") return;
    if (pasteBackground(event.clipboardData?.items)) {
      event.preventDefault();
    }
  }

  function onDrop(event: DragEvent) {
    pasteBackground(event.dataTransfer?.items);
  }

  function pasteBackground(items: DataTransferItemList | undefined): boolean {
    if (!items) return false;

    for (const item of Object.values(items)) {
      if (item.kind !== "file") continue;
      $appstate.background_loading = true;
      const blob = item.getAsFile();
      const reader = new FileReader();

      reader.onload = (event) => {
        const data = event.target?.result as string;
        const type = data.split(",")[0];

        current_loaded_src = data;
        if (type.includes("data:image")) {
          $appstate.background = type;

          if ($background.paste_mode === "fit") {
            $background = {
              ...$background,
              src: data,
              x: 0,
              y: 0,
              w: $datastate.width,
              h: $datastate.height,
            };

            const img = new Image();
            img.src = data;
            img.onload = () => {
              $appstate = {
                ...$appstate,
                background_width: img.width,
                background_height: img.height,
                background_aspect: img.width / img.height,
                // background_loading: false,
              };
            };
          } else if ($background.paste_mode === "aspect") {
            const img = new Image();
            img.src = data;
            img.onload = () => {
              const aspect_data = countAspectRatio($datastate.width, $datastate.height, img.width, img.height);

              $background = {
                ...$background,
                ...aspect_data,
                src: data,
              };

              $appstate = {
                ...$appstate,
                background_width: img.width,
                background_height: img.height,
                background_aspect: img.width / img.height,
                // background_loading: false,
              };
            };
          }

          return true;
        }
      };

      reader.onerror = () => {
        $appstate.background_loading = false;
        alert("Error reading file");
      };

      reader.onabort = reader.onerror;

      if (blob) {
        reader.readAsDataURL(blob);
      }
    }
    return false;
  }
</script>

<!-- svelte-ignore state_referenced_locally -->
<svelte:window on:paste={onPaste} on:dragover|preventDefault on:drop|preventDefault={onDrop} />

<div class="container">
  <main>
    <div class="selector">
      <Select options={["youtube", "twitch", "post"]} bind:selected={selector} />
    </div>
    {#if selector === "youtube"}
      <Video.Canvas />
    {:else if selector === "twitch"}
      <Stream.Canvas />
    {:else if selector === "post"}
      <Post.Canvas />
    {:else if selector === "test"}
      <Testing />
    {:else}
      empty
    {/if}
  </main>
  <aside>
    {#if selector === "youtube"}
      <Video.Settings />
    {:else if selector === "twitch"}
      <Stream.Settings />
    {:else if selector === "post"}
      <Post.Settings />
    {:else}
      empty
    {/if}
  </aside>
</div>

<style>
  :global(body) {
    color: var(--text);
  }

  .container {
    display: flex;
    height: 100vh;
  }

  aside {
    width: 600px;
    background-color: var(--bg-dark);
    overflow-y: auto;
    overflow-x: hidden;
    padding: 1rem;
  }

  main {
    flex: 1;
    padding: 1rem;
    background-color: var(--bg-dark-extra);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    position: relative;
  }

  .selector {
    position: absolute;
    top: 20px;
    left: 50%;
    translate: -50% 0;
    color: var(--text-2);
    font-size: 0.8rem;
    z-index: 10000;
  }
</style>
