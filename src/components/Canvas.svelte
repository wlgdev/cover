<script lang="ts" generics="T extends DrawWebGL<DrawParams>">
  import FontFaceObserver from "fontfaceobserver";
  import { Plane } from "svelte-loading-spinners";
  import type { Readable, Writable } from "svelte/store";
  import { untrack } from "svelte";

  import type { Background, Drawer, DrawParams } from "../drawer/shared";
  import { countAspectRatio } from "../common";
  import type { AppState } from "../common/types";
  import type { DrawWebGL } from "../drawer/draw-webgl";

  type Props = {
    background: Writable<Background>;
    datastate: Readable<DrawParams>;
    appstate: Writable<AppState<Drawer>>;
    drawer: T;
    back_buffer: boolean;
    preload_font?: string;
    subscriptions: (renderer: any) => void;
  };

  let { background, datastate, appstate, drawer, back_buffer, preload_font, subscriptions }: Props = $props();

  let mount_point: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let stage: "DRAG" | "STANDBY" = $state("STANDBY");
  let style = $state("");
  let resolution = $derived(
    `width: ${$datastate.width}px; height: ${$datastate.height}px;${$datastate.scale != 1 ? ` transform: scale(${$datastate.scale});` : ""}`,
  );

  const texture_loaded = (key: string) => window.dispatchEvent(new CustomEvent("texture_loaded", { detail: key }));

  $effect(() => {
    untrack(() => {
      drawer
        // @ts-ignore
        .create({
          mount_point,
          state: $datastate,
          background: "#14151e",
          width: $datastate.width,
          height: $datastate.height,
          back_buffer: back_buffer,
          texture_success: texture_loaded,
          texture_fail: texture_loaded,
        })
        .then(async (renderer: any) => {
          if (preload_font) {
            const font = new FontFaceObserver(preload_font);
            await font.load().catch(() => alert(`Error: font ${preload_font} not loaded`));
          }

          subscriptions(renderer);

          $appstate.app = renderer;
          canvas = mount_point.querySelector("canvas")!;
        });
    });
  });

  $effect(() => {
    const sides: string[] = [];
    if ($background.x > 0) {
      sides.push("-3px 0px 0px 0px var(--red)");
    }
    if ($background.y > 0) {
      sides.push("0px -3px 0px 0px var(--red)");
    }
    if ($background.x + $background.w < $datastate.width) {
      sides.push(`3px 0px 0px 0px var(--red)`);
    }
    if ($background.y + $background.h < $datastate.height) {
      sides.push("0px 3px 0px 0px var(--red)");
    }
    if (sides.length > 0) {
      style = `${resolution} box-shadow: ${sides.join(", ")};`;
    } else {
      style = resolution;
    }
  });

  function onWheel(event: WheelEvent) {
    event.preventDefault();
    const scaleFactor = -event.deltaY * 0.0001; // sensitivity
    const x = canvas.width * scaleFactor;
    const y = x / $appstate.background_aspect;

    $background.w = +($background.w + Math.floor(x * 100) / 100).toFixed(2);
    $background.h = +($background.h + Math.floor(y * 100) / 100).toFixed(2);
    $background.x = +($background.x - Math.floor((x * 100) / 2) / 100).toFixed(2);
    $background.y = +($background.y - Math.floor((y * 100) / 2) / 100).toFixed(2);
  }

  function onMouseDown() {
    if (stage === "STANDBY") {
      stage = "DRAG";
    }
  }

  function onMouseUp() {
    if (stage === "DRAG") {
      stage = "STANDBY";
    }
  }

  function onMouseMove(event: MouseEvent) {
    if (stage !== "DRAG") return;
    $background.x += event.movementX;
    $background.y += event.movementY;
  }

  function onDoubleClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if ($background.paste_mode === "fit") {
      $background.x = 0;
      $background.y = 0;
      $background.w = canvas.width;
      $background.h = canvas.height;
    } else if ($background.paste_mode === "aspect") {
      const aspect_data = countAspectRatio(
        $datastate.width,
        $datastate.height,
        $appstate.background_width,
        $appstate.background_height,
      );

      $background = {
        ...$background,
        ...aspect_data,
      };
    }
  }

  function onSelectStart(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  bind:this={mount_point}
  onwheel={onWheel}
  onmousedown={onMouseDown}
  onmouseup={onMouseUp}
  onmousemove={onMouseMove}
  ondblclick={onDoubleClick}
  onselectstart={onSelectStart}
  {style}
>
  {#if $appstate.background_loading}
    <div class="loading">
      <Plane color="#d42834" />
    </div>
  {/if}
</div>

<style>
  div {
    background-color: var(--bg-medium);
    position: relative;
  }

  .loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--bg-dark-extra);
    opacity: 0.8;
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    font-weight: bold;
    color: var(--text-medium);
  }
</style>
