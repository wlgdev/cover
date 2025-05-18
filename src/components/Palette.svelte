<script lang="ts">
  type Props = {
    options: string[];
    label?: string;
    value: string;
  };

  let { options, label, value = $bindable() }: Props = $props();

  function pick(event: MouseEvent) {
    const target = event.target as HTMLDivElement;
    value = target.dataset.value!;
  }
</script>

<div class="container">
  {#if label}
    <div class="label">{label}</div>
  {/if}
  {#each options as option}
    <button class="option" style="background: {option}" aria-label={option} data-value={option} onclick={pick}></button>
  {/each}
</div>

<style>
  .container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.2rem;
  }

  .option {
    width: 24px;
    height: 24px;
    border-radius: 5px;
    cursor: pointer;
    border: none;
  }

  .label {
    font-size: smaller;
    color: var(--text-2);
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 0.5rem;
  }
</style>
