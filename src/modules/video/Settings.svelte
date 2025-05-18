<script lang="ts">
  import Filters from "../../components/Filters.svelte";
  import Logo from "../../components/Logo.svelte";
  import Background from "../../components/Background.svelte";
  import Categories from "../../components/Categories.svelte";
  import Title from "../../components/Title.svelte";
  import Description from "../../components/Description.svelte";
  import {
    appstate,
    datastate,
    background,
    logo,
    filter,
    categories,
    title,
    description,
    DEFAULTS_VIDEO_FILTERS,
  } from "./store";
</script>

<Background {background} {appstate} {datastate} />
<Logo {logo} {appstate} />
<Filters {filter} defaults={DEFAULTS_VIDEO_FILTERS} />
<Categories {categories} />
<Title {title} />
<Description {description} />
