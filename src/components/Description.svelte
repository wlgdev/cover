<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Description } from "../drawer/draw-video-webgl";
  import Section from "./Section.svelte";
  import Row from "./Row.svelte";
  import InputNumber from "./InputNumber.svelte";
  import InputText from "./InputText.svelte";
  import InputColor from "./InputColor.svelte";
  import Textarea from "./Textarea.svelte";

  type Props = {
    description: Writable<Description>;
  };

  let { description }: Props = $props();
</script>

<Section title="Описание">
  <Row>
    <Textarea placeholder="описание" bind:value={$description.text} tabindex={2} />
  </Row>
  <Row>
    <InputNumber label="X" bind:value={$description.x} />
    <InputNumber label="margin" bind:value={$description.gap} />

    <InputNumber label="shadow" bind:value={$description.shadow.value} min={0} />
    <InputColor bind:hex={$description.shadow.color} />
  </Row>
  <Row>
    <InputText placeholder="Arial" label="font" bind:value={$description.font.face} width={100} />
    <InputNumber placeholder="60" label="size" bind:value={$description.font.size} min={0} />
    <InputNumber placeholder="60" label="lh" bind:value={$description.font.line_height} min={0} />
    <InputText placeholder="bold" label="weight" bind:value={$description.font.weight} width={40} />
    <InputColor label="color" bind:hex={$description.font.color} />
  </Row>
</Section>
