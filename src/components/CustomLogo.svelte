<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { CustomLogo, Logo } from "../drawer/shared";
  import Section from "./Section.svelte";
  import Row from "./Row.svelte";
  import InputNumber from "./InputNumber.svelte";
  import InputText from "./InputText.svelte";
  import Toggle from "./Toggle.svelte";

  type Props = {
    logo: Writable<Logo>;
    custom_logo: Writable<CustomLogo>;
    appstate: Writable<any>;
    default_logo: Logo;
  };

  let { logo, custom_logo, appstate, default_logo }: Props = $props();

  $effect(() => {
    if ($custom_logo.enabled) {
      $logo.x = $custom_logo.translate_x;
      $logo.y = $custom_logo.translate_y;
      $logo.w = $custom_logo.translate_w;
      $logo.h = $custom_logo.translate_h;
      $logo.alpha = $custom_logo.alpha;
    } else {
      $logo.x = default_logo.x;
      $logo.y = default_logo.y;
      $logo.w = default_logo.w;
      $logo.h = default_logo.h;
      $logo.alpha = default_logo.alpha;
    }
  });

  function bindLogo(event: Event) {
    $custom_logo.src = (event.target as HTMLInputElement)?.value;
  }
</script>

<Section title="Ещё лого" collapsed>
  <Row>
    <InputText placeholder="ссылка на картинку логотипа..." bind:value={$appstate.custom_logo} onchange={bindLogo} />
  </Row>
  <Row>
    <Toggle label="on" bind:checked={$custom_logo.enabled} />
    <InputNumber label="X" bind:value={$custom_logo.x} />
    <InputNumber label="Y" bind:value={$custom_logo.y} />
    <InputNumber label="W" bind:value={$custom_logo.w} />
    <InputNumber label="H" bind:value={$custom_logo.h} />
    <InputNumber label="blur" bind:value={$custom_logo.blur} step={0.1} min={0} />
    <InputNumber label="α" bind:value={$custom_logo.alpha} step={0.01} min={0} max={1} />
  </Row>
</Section>
