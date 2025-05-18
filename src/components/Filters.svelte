<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Filters } from "../drawer/shared";
  import Section from "./Section.svelte";
  import Row from "./Row.svelte";
  import Toggle from "./Toggle.svelte";
  import InputNumber from "./InputNumber.svelte";
  import InputColor from "./InputColor.svelte";
  import ToggleButton from "./ToggleButton.svelte";
  import Tooltip from "./Tooltip.svelte";

  type Props = {
    filter: Writable<Filters>;
    defaults: Filters;
    collapsed?: boolean;
  };

  let { filter, defaults, collapsed = false }: Props = $props();

  const filter_toggles = "flex: 0 0 4.5rem; justify-content: center; font-size: smaller; height: 1.7rem;" as const;

  function filterToDefaults() {
    filter.set(structuredClone(defaults));
  }
</script>

<Section title="Фильтры" {collapsed}>
  <Row>
    <ToggleButton bind:checked={$filter.blur.enabled} style={filter_toggles}>blur</ToggleButton>
    <InputNumber label="value" bind:value={$filter.blur.value} step={0.1} min={0} />
    <div class="reset">
      <Tooltip tooltip="сбросить фильтры">
        <button class="reset_filters" onclick={filterToDefaults}>↺</button>
      </Tooltip>
    </div>
  </Row>

  <Row>
    <ToggleButton bind:checked={$filter.gradient.enabled} style={filter_toggles}>gradient</ToggleButton>
    <InputNumber label="#1" bind:value={$filter.gradient.start.value} step={0.01} min={0} max={1} />
    <InputColor bind:hex={$filter.gradient.start.color} />
    <InputNumber label="#2" bind:value={$filter.gradient.mid.value} step={0.01} min={0} max={1} />
    <InputColor bind:hex={$filter.gradient.mid.color} />
    <InputNumber label="#3" bind:value={$filter.gradient.end.value} step={0.01} min={0} max={1} />
    <InputColor bind:hex={$filter.gradient.end.color} />
  </Row>
  <Row>
    <ToggleButton bind:checked={$filter.tilt_shift.enabled} style={filter_toggles}>tilt-shift</ToggleButton>
    <InputNumber label="X₁" bind:value={$filter.tilt_shift.start.x} />
    <InputNumber label="Y₁" bind:value={$filter.tilt_shift.start.y} />
    <InputNumber label="X₂" bind:value={$filter.tilt_shift.end.x} />
    <InputNumber label="Y₂" bind:value={$filter.tilt_shift.end.y} />
    <InputNumber label="blur" bind:value={$filter.tilt_shift.blur} step={0.1} min={0} />
  </Row>
  <Row>
    <ToggleButton bind:checked={$filter.zoom_blur.enabled} style={filter_toggles}>zoomblur</ToggleButton>
    <InputNumber label="X" bind:value={$filter.zoom_blur.center.x} />
    <InputNumber label="Y" bind:value={$filter.zoom_blur.center.y} />
    <InputNumber label="R" bind:value={$filter.zoom_blur.radius} min={0} />
    <InputNumber label="blur" bind:value={$filter.zoom_blur.value} step={0.01} min={0} />
  </Row>
  <Row>
    <ToggleButton bind:checked={$filter.vignetting.enabled} style={filter_toggles}>vignette</ToggleButton>
    <InputNumber label="value" bind:value={$filter.vignetting.value} step={0.01} min={0} />
    <InputNumber label="α" bind:value={$filter.vignetting.alpha} step={0.01} min={0} max={1} />
    <InputNumber label="blur" bind:value={$filter.vignetting.blur} step={0.01} min={0} />
  </Row>
  <Row>
    <ToggleButton bind:checked={$filter.adjustment.enabled} style={filter_toggles}>adjust</ToggleButton>
    <InputNumber label="gam" bind:value={$filter.adjustment.gamma} step={0.01} min={0} />
    <InputNumber label="con" bind:value={$filter.adjustment.contrast} step={0.01} min={0} />
    <InputNumber label="bri" bind:value={$filter.adjustment.brightness} step={0.01} min={0} />
    <InputNumber label="sat" bind:value={$filter.adjustment.saturation} step={0.01} min={0} />
  </Row>
</Section>

<style>
  .reset {
    margin-left: auto;
  }

  .reset_filters {
    background: var(--bg-light-extra);
    padding: 0.4rem;
    border-radius: 0.3rem;
    border: none;
    color: var(--text-2);
    cursor: pointer;
  }

  .reset_filters:hover {
    background: var(--bg-dark);
  }
</style>
