<script lang="ts">
  import { onMount } from "svelte";
  import ColorPicker from "svelte-awesome-color-picker";
  import InputColor from "./InputColor.svelte";

  let thumb_position = $state([0, 100, 150]);
  let thums_colors = $state(["#d42834", "#9047fe", "#f27930"]);
  let isDragging = false;
  let current_index = -1;

  function onmousedown(event: MouseEvent) {
    if (!event.target) return;
    // @ts-ignore
    current_index = Number(event.target.dataset.index);
    isDragging = true;
    event.preventDefault();
  }

  function onmouseup() {
    isDragging = false;
    current_index = -1;
  }

  function onmousemove(event: MouseEvent) {
    if (!isDragging || current_index === -1) return;

    let delta = thumb_position[current_index] + event.movementX;

    if (delta < 0) {
      thumb_position[current_index] = 0;
    } else if (delta > 400) {
      thumb_position[current_index] = 400;
    } else {
      thumb_position[current_index] = delta;
    }
  }

  function onclick(event: MouseEvent) {
    console.log("CLICK");
    event.stopImmediatePropagation();
  }

  onMount(() => {
    window.addEventListener("mousemove", onmousemove);
    window.addEventListener("mouseup", onmouseup);

    return () => {
      window.removeEventListener("mousemove", onmousemove);
      window.removeEventListener("mouseup", onmouseup);
    };
  });
</script>

<div class="container">
  <span class="range"></span>
  {#each thumb_position as position, i}
    <!-- svelte-ignore a11y_no_static_element_interactions -->

    <span class="thumb" {onmousedown} data-index={i} data-value={position} style="left: {position}px;">
      <div class="color">
        <InputColor bind:hex={thums_colors[i]} />
      </div>
      <span class="value">{position}</span>
    </span>
  {/each}
</div>

<style>
  .container {
    position: relative;
    width: 100%;
    display: flex;
  }

  .range {
    position: absolute;
    height: 3px;
    width: 100%;
    background: var(--bg-light);
  }

  .thumb {
    position: absolute;
    width: 10px;
    height: 10px;
    background: var(--bg-light-extra);
    border-radius: 50%;
    cursor: grab;
    /* top: -4px; */
    translate: -50% -50%;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .thumb:hover .color {
    visibility: visible;
  }

  .value {
    position: absolute;
    translate: 0 80%;
    font-size: smaller;
    cursor: default;
    color: var(--text-2);
  }

  .color {
    visibility: hidden;
    position: absolute;
    cursor: pointer;
    width: 2rem;
    height: 2rem;
    translate: 0 -70%;
    /* background: #fff; */
  }
</style>
