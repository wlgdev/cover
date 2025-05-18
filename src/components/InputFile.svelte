<script lang="ts">
  import FolderOpen from "lucide-svelte/icons/folder-open";
  import Tooltip from "./Tooltip.svelte";

  type Props = {
    src?: string;
    accept?: string;
    tooltip?: string;
    onload?: (src: string, file: string) => void;
  };

  let { src = $bindable(), accept, tooltip, onload }: Props = $props();

  function onchange(event: Event) {
    const file = (event.target as HTMLInputElement)?.files![0];
    if (file) {
      const reader = new FileReader();

      reader.onload = async (event) => {
        const data = event.target?.result as string;
        if (src) src = data;
        if (onload) onload(data, file.name);
      };

      reader.readAsDataURL(file);
    }
  }
</script>

<Tooltip {tooltip}>
  <label>
    <FolderOpen size={18} />
    <input type="file" {onchange} {accept} />
  </label>
</Tooltip>

<style>
  label {
    background: var(--bg-light);
    border: 1px solid var(--bg-light);
    border-radius: 0.3rem;
    color: var(--text-2);
    margin-left: auto;
    cursor: pointer;
    padding: 0.2rem 0.2rem 0.13rem 0.2rem;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  label:hover {
    color: var(--text);
    border-color: var(--bg-light-extra);
  }

  input[type="file"] {
    display: none;
  }
</style>
