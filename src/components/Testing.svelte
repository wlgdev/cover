<script>
  import SmallInput from "./common/SmallInput.svelte";
  import { Fit } from "./icons.svelte";

  let value = $state(20);
  let value2 = $state("second");
</script>

<div>
  <div>start</div>
  <SmallInput type="number" bind:value label_width="20px">X</SmallInput>
  <div>new</div>
  <SmallInput type="text" bind:value={value2} label_width="20px"><Fit /></SmallInput>
</div>
