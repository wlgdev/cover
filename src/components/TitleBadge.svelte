<script lang="ts">
  import { getPaletteFromURL } from "color-thief-node";
  import type { Writable } from "svelte/store";
  import type { TitleBadge } from "../drawer/draw-post-webgl";
  import type { Background } from "../drawer/shared";
  import Section from "./Section.svelte";
  import Row from "./Row.svelte";
  import InputNumber from "./InputNumber.svelte";
  import InputText from "./InputText.svelte";
  import InputColor from "./InputColor.svelte";
  import Textarea from "./Textarea.svelte";
  import Palette from "./Palette.svelte";

  type Props = {
    title_badge: Writable<TitleBadge>;
    background: Writable<Background>;
  };

  let { title_badge, background }: Props = $props();

  let prev_bg: string;
  let default_palette = ["#d42834", "#9047fe", "#f27930"];
  let palette = $state(default_palette);

  function rgbToHex([r, g, b]: [number, number, number]): string {
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();

    return `#${hex}`;
  }

  $effect(() => {
    if ($background.src !== prev_bg) {
      prev_bg = $background.src;
      getPaletteFromURL($background.src, 12, 10).then((colors) => {
        palette = [...default_palette, ...colors.map(rgbToHex)];
      });
    }
  });
</script>

<Section title="Плашечка">
  <Row>
    <Textarea placeholder="заголовок..." bind:value={$title_badge.text} tabindex={2} />
  </Row>
  <Row>
    <InputNumber label="center X" bind:value={$title_badge.x} />
    <InputNumber label="center Y" bind:value={$title_badge.y} />
    <InputNumber label="min W" bind:value={$title_badge.rect.w} min={0} />
    <InputNumber label="min H" bind:value={$title_badge.rect.h} min={0} />
  </Row>
  <Row>
    <InputNumber label="border" bind:value={$title_badge.rect.border_width} min={0} />
    <InputNumber label="PX" bind:value={$title_badge.rect.padding_x} min={0} />
    <InputNumber label="PY" bind:value={$title_badge.rect.padding_y} min={0} />
    <InputColor label="bg" bind:hex={$title_badge.rect.color} />
  </Row>
  <Row>
    <InputText placeholder="Arial" label="font" bind:value={$title_badge.font.face} width={90} />
    <InputNumber placeholder="60" label="size" bind:value={$title_badge.font.size} min={0} width={35} />
    <InputNumber placeholder="60" label="lh" bind:value={$title_badge.font.line_height} min={0} width={35} />
    <InputText placeholder="bold" label="weight" bind:value={$title_badge.font.weight} width={30} />
    <InputNumber placeholder="12" label="sp" bind:value={$title_badge.font.space_width} min={0} width={35} />
    <InputColor label="color" bind:hex={$title_badge.font.color} />
  </Row>
  <Row>
    <InputColor label="accent" bind:hex={$title_badge.accent} />
    <Palette label="palette" options={palette} bind:value={$title_badge.accent} />
  </Row>
</Section>
