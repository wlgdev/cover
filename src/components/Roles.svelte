<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Badges } from "../drawer/shared";

  import Section from "./Section.svelte";
  import Row from "./Row.svelte";
  import Textarea from "./Textarea.svelte";
  import BagdeSettings from "./BagdeSettings.svelte";

  type Props = {
    roles: Writable<Badges>;
  };

  let { roles }: Props = $props();
</script>

<Section title="В ролях">
  <Row>
    <Textarea placeholder="бейджики" bind:value={$roles.text} />
  </Row>
  <BagdeSettings badges={roles} />
</Section>
