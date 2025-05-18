<script lang="ts">
  import { DrawWebGLPost } from "../../drawer/draw-post-webgl";
  import type { Drawer } from "../../drawer/shared";
  import Canvas from "../../components/Canvas.svelte";
  import { appstate, datastate, background, filter, logo, custom_logo, title_badge } from "./store";


  function subscriptions(renderer: DrawWebGLPost) {
    background.subscribe((background) => {
      renderer.updateBackground(background, $filter);
    });
    filter.subscribe((filter) => {
      renderer.updateBackground($background, filter);
    });
    logo.subscribe((logo) => {
      renderer.updateLogo(logo);
    });
    custom_logo.subscribe((custom_logo) => {
      renderer.updateCustomLogo(custom_logo, $logo);
    });
    title_badge.subscribe((title_badge) => {
      renderer.updateTitleBadge(title_badge);
    });
  }
</script>

<Canvas
  {background}
  {subscriptions}
  {datastate}
  {appstate}
  drawer={DrawWebGLPost as unknown as Drawer}
  back_buffer={true}
  preload_font="U.S. 101"
/>
