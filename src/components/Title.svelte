<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Title } from "../drawer/shared";
  import Section from "./Section.svelte";
  import Row from "./Row.svelte";
  import InputNumber from "./InputNumber.svelte";
  import InputText from "./InputText.svelte";
  import InputColor from "./InputColor.svelte";
  import Textarea from "./Textarea.svelte";

  type Props = {
    title: Writable<Title>;
  };

  let { title }: Props = $props();
</script>

<Section title="Заголовок">
  <Row>
    <Textarea placeholder="заголовок" bind:value={$title.text} tabindex={1} />
  </Row>
  <Row>
    <InputNumber label="X" bind:value={$title.x} />
    <InputNumber label="Y" bind:value={$title.y} />
    <InputNumber label="shadow" bind:value={$title.shadow.value} min={0} />
    <InputColor bind:hex={$title.shadow.color} />
  </Row>
  <Row>
    <InputText placeholder="Arial" label="font" bind:value={$title.font.face} width={100} />
    <InputNumber placeholder="60" label="size" bind:value={$title.font.size} min={0} />
    <InputNumber placeholder="60" label="lh" bind:value={$title.font.line_height} min={0} />
    <InputText placeholder="bold" label="weight" bind:value={$title.font.weight} width={40} />
    <InputColor label="color" bind:hex={$title.font.color} />
  </Row>
</Section>
