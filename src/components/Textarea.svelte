<script lang="ts">
  type Props = {
    placeholder?: string;
    tabindex?: number;
    value?: string;
    onchange?: (event: Event) => void;
    oninput?: (event: Event) => void;
  };

  let { value = $bindable(""), placeholder, tabindex, onchange, oninput }: Props = $props();
</script>

<textarea bind:value {oninput} {onchange} {placeholder} {tabindex}></textarea>
