<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Badges } from "../drawer/shared";

  import Section from "./Section.svelte";
  import Row from "./Row.svelte";
  import InputText from "./InputText.svelte";
  import BagdeSettings from "./BagdeSettings.svelte";

  type Props = {
    datetime: Writable<Badges>;
  };

  let { datetime = $bindable() }: Props = $props();

  const dt = $datetime.text.split(",");
  let day = $state(dt[0].trim());
  let time = $state(dt[1].trim());

  $effect(() => {
    $datetime.text = `${day},${time}`;
  });
</script>

<Section title="Время">
  <Row>
    <InputText placeholder="день..." bind:value={day} width={120} />
    <InputText placeholder="время..." bind:value={time} width={120} />
  </Row>
  <BagdeSettings badges={datetime} />
</Section>
