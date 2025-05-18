<script lang="ts">
  import Layout from "./Layout.svelte";

  let build = import.meta.env.VITE_BUILD;
</script>

<div id="build">build {build}</div>
<Layout />

<style>
  #build {
    position: fixed;
    top: 20;
    left: 20;
    color: var(--text-2);
    font-size: 0.8rem;
    z-index: 10000;
  }
</style>
