<script lang="ts">
  import Filters from "../../components/Filters.svelte";
  import Logo from "../../components/Logo.svelte";
  import Background from "../../components/Background.svelte";
  import TitleBadge from "../../components/TitleBadge.svelte";
  import {
    appstate,
    datastate,
    background,
    logo,
    custom_logo,
    filter,
    DEFAULTS_POST_FILTERS,
    title_badge,
    DEFAULTS_POST_LOGO,
  } from "./store";
  import CustomLogo from "../../components/CustomLogo.svelte";
  import Footnote from "../../components/Footnote.svelte";
  // import Gradient from "../../components/Gradient.svelte";
</script>

<Background {background} {appstate} {datastate} />
<Logo {logo} {appstate} />
<CustomLogo {logo} {custom_logo} {appstate} default_logo={DEFAULTS_POST_LOGO} />
<Filters {filter} defaults={DEFAULTS_POST_FILTERS} />
<TitleBadge {title_badge} {background} />
<Footnote {title_badge} />
<!-- <Gradient /> -->
