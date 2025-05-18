<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Box } from "../drawer/shared";
  import Section from "./Section.svelte";
  import Row from "./Row.svelte";
  import InputNumber from "./InputNumber.svelte";
  import InputColor from "./InputColor.svelte";
  import Palette from "./Palette.svelte";

  type Props = {
    stripe: Writable<Box>;
    collapsed: boolean;
  };

  let { stripe, collapsed = false }: Props = $props();
</script>

<Section title="Полоса" {collapsed}>
  <Row>
    <InputNumber label="X" bind:value={$stripe.x} />
    <InputNumber label="Y" bind:value={$stripe.y} />
    <InputNumber label="W" bind:value={$stripe.w} />
    <InputNumber label="H" bind:value={$stripe.h} />
  </Row>
  <Row>
    <InputColor label="color" bind:hex={$stripe.color} />
    <Palette label="palette" options={["#9047fe", "#f05f2d"]} bind:value={$stripe.color} />
  </Row>
</Section>
