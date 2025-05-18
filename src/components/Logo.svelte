<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Logo } from "../drawer/shared";
  import Section from "./Section.svelte";
  import Row from "./Row.svelte";
  import InputNumber from "./InputNumber.svelte";
  import InputText from "./InputText.svelte";

  type Props = {
    logo: Writable<Logo>;
    appstate: Writable<any>;
  };

  let { logo, appstate }: Props = $props();

  function bindLogo(event: Event) {
    $logo.src = (event.target as HTMLInputElement)?.value;
  }
</script>

<Section title="Лого" collapsed>
  <Row>
    <InputText placeholder="ссылка на картинку логотипа" bind:value={$appstate.logo} onchange={bindLogo} />
  </Row>
  <Row>
    <InputNumber label="X" bind:value={$logo.x} />
    <InputNumber label="Y" bind:value={$logo.y} />
    <InputNumber label="W" bind:value={$logo.w} />
    <InputNumber label="H" bind:value={$logo.h} />
    <InputNumber label="blur" bind:value={$logo.blur} step={0.1} min={0} />
    <InputNumber label="α" bind:value={$logo.alpha} step={0.01} min={0} max={1} />
  </Row>
</Section>
