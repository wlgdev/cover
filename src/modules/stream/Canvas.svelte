<script lang="ts">
  import { DrawWebGLStream } from "../../drawer/draw-stream-webgl";
  import type { Drawer } from "../../drawer/shared";
  import Canvas from "../../components/Canvas.svelte";
  import { appstate, datastate, background, filter, logo, title, roles, time, stripe, categories } from "./store";

  function subscriptions(renderer: DrawWebGLStream) {
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
      renderer.updateTitle(title);
    });
    categories.subscribe((categories) => {
      renderer.updateCategories(categories, $roles);
    });
    roles.subscribe((roles) => {
      renderer.updateRoles(roles, $categories);
    });
    time.subscribe((time) => {
      renderer.updateTime(time);
    });
    stripe.subscribe((stripe) => {
      renderer.updateStripe(stripe);
    });
  }
</script>

<Canvas
  {background}
  {subscriptions}
  {datastate}
  {appstate}
  drawer={DrawWebGLStream as unknown as Drawer}
  back_buffer={true}
  preload_font="Gilroy"
/>
