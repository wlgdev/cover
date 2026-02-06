<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Categories } from "../drawer/shared";
  import Section from "./Section.svelte";
  import Row from "./Row.svelte";
  import InputNumber from "./InputNumber.svelte";
  import InputColor from "./InputColor.svelte";
  import CategorySelect from "./CategorySelect.svelte";
  import InputFile from "./InputFile.svelte";
  import { JUST_CHATTING } from "../assets/just-chating";

  type Props = {
    categories: Writable<Categories>;
  };

  let { categories }: Props = $props();

  const selected = [{ name: "Just Chatting", src: JUST_CHATTING, id: 0 }];
  let category_select: { addManualCategory: (src: string, name?: string) => void } | null = null;

  function onManualCategoryInput(src: string) {
    category_select?.addManualCategory(src, "manual");
  }
</script>

<Section title="Категории">
  <Row style="align-items: flex-start;">
    <div class="category-select">
      <CategorySelect bind:this={category_select} {categories} selected={selected} />
    </div>
    <InputFile onload={onManualCategoryInput} accept="image/*" tooltip="загрузить" />
  </Row>
  <Row>
    <InputNumber label="X" bind:value={$categories.x} />
    <InputNumber label="Y" bind:value={$categories.y} />
    <InputNumber label="W" bind:value={$categories.w} />
    <InputNumber label="H" bind:value={$categories.h} />
  </Row>
  <Row>
    <InputNumber label="blur" bind:value={$categories.blur} step={0.1} min={0} />
    <InputNumber label="margin" bind:value={$categories.margin} min={0} />
    <InputNumber label="round" bind:value={$categories.round} min={0} />
    <InputNumber label="shadow" bind:value={$categories.shadow.value} min={0} />
    <InputColor bind:hex={$categories.shadow.color} />
  </Row>
</Section>

<style>
  .category-select {
    flex: 1;
    min-width: 0;
  }
</style>
