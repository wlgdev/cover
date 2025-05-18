<script lang="ts">
  import type { Writable, Readable } from "svelte/store";
  import type { Background } from "../drawer/shared";
  import Section from "./Section.svelte";
  import Row from "./Row.svelte";
  import InputNumber from "./InputNumber.svelte";
  import InputText from "./InputText.svelte";
  import InputFile from "./InputFile.svelte";
  import { countAspectRatio } from "../common";
  import { untrack } from "svelte";
  import ToggleGroup from "./ToggleGroup.svelte";
  import Tooltip from "./Tooltip.svelte";
  import ToggleButton from "./ToggleButton.svelte";
  import { Fit, FlipHorizontal, FlipVertical, KeepAspect } from "./icons.svelte";
  import SmallInput from "./common/SmallInput.svelte";


  type Props = {
    background: Writable<Background>;
    appstate: Writable<any>;
    datastate: Readable<any>;
  };

  let { background, appstate, datastate }: Props = $props();

  let paste_mode: boolean = $state($background.paste_mode === "fit" ? true : false);
  let prev_paste_mode = $background.paste_mode;

  let current_loaded_src = "";

  // @ts-ignore
  window.addEventListener("texture_loaded", (event: CustomEvent) => {
    if (event.detail === current_loaded_src) {
      $appstate.background_loading = false;
      current_loaded_src = "";
    }
  });

  function bindBackground(event: Event) {
    $background.src = (event.target as HTMLInputElement)?.value;
  }

  function onBackgroundInput(src: string, file: string) {
    current_loaded_src = src;
    $appstate.background_loading = true;

    if ($background.paste_mode === "fit") {
      $background = {
        ...$background,
        src: src,
        x: 0,
        y: 0,
        w: $datastate.width,
        h: $datastate.height,
      };

      const img = new Image();
      img.src = src;
      img.onload = () => {
        $appstate = {
          ...$appstate,
          background_width: img.width,
          background_height: img.height,
          background_aspect: img.width / img.height,
          background: file,
        };
      };
    } else if ($background.paste_mode === "aspect") {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const aspect_data = countAspectRatio($datastate.width, $datastate.height, img.width, img.height);

        $background = {
          ...$background,
          ...aspect_data,
          src: src,
        };

        $appstate = {
          ...$appstate,
          background_width: img.width,
          background_height: img.height,
          background_aspect: img.width / img.height,
          background: file,
        };
      };
    }
  }

  $effect(() => {
    if (prev_paste_mode !== $background.paste_mode) {
      untrack(() => {
        $appstate.background_loading = true;
        prev_paste_mode = $background.paste_mode;

        onBackgroundInput($background.src, $appstate.background);
        $appstate.background_loading = false;
      });
    }
  });
</script>

{#snippet fit()}
	<Tooltip tooltip="растянуть"><Fit size="1.2rem" /></Tooltip>
{/snippet}

{#snippet aspect()}
  <Tooltip tooltip="сохранить пропорции"><KeepAspect size="1.2rem" /></Tooltip>
{/snippet}


<Section title="Фон" collapsed>
  <Row style={"margin-bottom: 0.5rem;"}>
    <InputText placeholder="ссылка на картинку фона" onchange={bindBackground} bind:value={$appstate.background} />
    <!-- <SmallInput type="text" placeholder="ссылка на картинку фона" onchange={bindBackground} bind:value={$appstate.background} label_width="20px" width="100%">src</SmallInput> -->
    <InputFile onload={onBackgroundInput} accept="image/*" tooltip="загрузить" />
  </Row>
  <Row>
    <!-- <InputNumber label="X" bind:value={$background.x} />
    <InputNumber label="Y" bind:value={$background.y} />
    <InputNumber label="W" bind:value={$background.w} />
    <InputNumber label="H" bind:value={$background.h} /> -->
    <SmallInput type="number" bind:value={$background.x} width="52px" label_width="20px">X</SmallInput>
    <SmallInput type="number" bind:value={$background.y} width="52px" label_width="20px">Y</SmallInput>
    <SmallInput type="number" bind:value={$background.w} width="52px" label_width="20px">W</SmallInput>
    <SmallInput type="number" bind:value={$background.h} width="52px" label_width="20px">H</SmallInput>

    <div class="spacer"></div>
    <ToggleButton bind:checked={$background.flip_h} tooltip="отразить горизонтально"><FlipHorizontal size="1.2rem" /></ToggleButton>
    <ToggleButton bind:checked={$background.flip_v} tooltip="отразить вертикально"><FlipVertical size="1.2rem" /></ToggleButton>
    <ToggleGroup options={["fit", "aspect"]} bind:selected={$background.paste_mode} children={[fit, aspect]}></ToggleGroup>
  </Row>
</Section>

<style>
  .spacer {
    height: 100%;
    width: 2rem;
  }
</style>
