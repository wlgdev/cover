<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Badges } from "../drawer/shared";

  import Row from "./Row.svelte";
  import InputNumber from "./InputNumber.svelte";
  import InputText from "./InputText.svelte";
  import InputColor from "./InputColor.svelte";

  type Props = {
    badges: Writable<Badges>;
  };

  let { badges }: Props = $props();
</script>

<Row>
  <InputNumber label="X" bind:value={$badges.x} />
  <InputNumber label="Y" bind:value={$badges.y} />
  <InputNumber label="H" bind:value={$badges.h} />
  <InputNumber label="PX" bind:value={$badges.padding_x} />
  <InputNumber label="PY" bind:value={$badges.padding_y} />
  <InputNumber label="MX" bind:value={$badges.margin_x} />
  <InputNumber label="MY" bind:value={$badges.margin_y} />
</Row>
<Row>
  <InputNumber label="round" bind:value={$badges.round} min={0} />
  <InputNumber label="blur" bind:value={$badges.backdrop.blur} min={0} />
  <InputNumber label="backdrop" bind:value={$badges.backdrop.quality} min={1} />
  <InputColor label="bg" bind:hex={$badges.color} />
</Row>
<Row>
  <InputText placeholder="Arial" label="font" bind:value={$badges.font.face} width={100} />
  <InputNumber placeholder="60" label="size" bind:value={$badges.font.size} min={0} />
  <InputNumber placeholder="60" label="lh" bind:value={$badges.font.line_height} min={0} />
  <InputText placeholder="bold" label="weight" bind:value={$badges.font.weight} width={40} />
  <InputColor label="color" bind:hex={$badges.font.color} />
</Row>
