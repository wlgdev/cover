<script lang="ts">
  import Filters from "../../components/Filters.svelte";
  import Logo from "../../components/Logo.svelte";
  import Background from "../../components/Background.svelte";
  import Categories from "../../components/Categories.svelte";
  import Title from "../../components/Title.svelte";
  import {
    appstate,
    datastate,
    background,
    logo,
    filter,
    categories,
    title,
    stripe,
    roles,
    time,
    DEFAULTS_VIDEO_FILTERS,
  } from "./store";
  import Box from "../../components/Box.svelte";
  import Roles from "../../components/Roles.svelte";
  import StreamTime from "../../components/StreamTime.svelte";
</script>

<Background {background} {appstate} {datastate} />
<Logo {logo} {appstate} />
<Box {stripe} collapsed />
<Filters {filter} defaults={DEFAULTS_VIDEO_FILTERS} collapsed />
<StreamTime datetime={time} />
<Title {title} />
<Categories {categories} />
<Roles {roles} />
