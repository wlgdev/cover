<script lang="ts">
  import { DrawWebGLVideo } from "../../drawer/draw-video-webgl";
  import type { Drawer } from "../../drawer/shared";
  import Canvas from "../../components/Canvas.svelte";
  import { appstate, datastate, background, filter, title, description, logo, categories } from "./store";

  function subscriptions(renderer: DrawWebGLVideo) {
    background.subscribe((background) => {
      renderer.updateBackground(background, $filter);
    });
    filter.subscribe((filter) => {
      renderer.updateBackground($background, filter);
    });
    logo.subscribe((logo) => {
      renderer.updateLogo(logo);
    });
    title.subscribe((title) => {
      renderer.updateText(title, $description);
    });
    description.subscribe((description) => {
      renderer.updateText($title, description);
    });
    categories.subscribe((categories) => {
      renderer.updateCategories(categories);
    });
  }
</script>

<Canvas
  {background}
  {subscriptions}
  {datastate}
  {appstate}
  drawer={DrawWebGLVideo as unknown as Drawer}
  back_buffer={false}
  preload_font="Gilroy"
/>
