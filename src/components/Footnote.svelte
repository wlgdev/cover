<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { TitleBadge } from "../drawer/draw-post-webgl";
  import Section from "./Section.svelte";
  import Row from "./Row.svelte";
  import InputNumber from "./InputNumber.svelte";
  import Textarea from "./Textarea.svelte";
  import Toggle from "./Toggle.svelte";

  type Props = {
    title_badge: Writable<TitleBadge>;
  };

  let { title_badge }: Props = $props();
</script>

<Section title="Сноска" collapsed>
  <Row>
    <Textarea placeholder="текст сноски..." bind:value={$title_badge.footnote.text} />
  </Row>
  <Row>
    <Toggle label="on" bind:checked={$title_badge.footnote.enabled} />
    <InputNumber label="size" bind:value={$title_badge.footnote.size} />
    <InputNumber label="margin" bind:value={$title_badge.footnote.margin} />
    <InputNumber label="sp" bind:value={$title_badge.footnote.space_width} />
  </Row>
</Section>
