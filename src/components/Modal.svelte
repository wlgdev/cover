<script lang="ts">
  import { createEventDispatcher } from "svelte";

  type Props = {
    open: boolean;
    title?: string;
    close_on_backdrop?: boolean;
  };

  let { open, title = "", close_on_backdrop = true }: Props = $props();

  const dispatch = createEventDispatcher<{ close: void }>();

  function requestClose() {
    dispatch("close");
  }

  function onBackdropClick(event: MouseEvent) {
    if (!close_on_backdrop) return;
    if (event.target !== event.currentTarget) return;
    requestClose();
  }
</script>

{#if open}
  <div class="backdrop" on:click={onBackdropClick}>
    <div class="modal" role="dialog" aria-modal="true" aria-label={title || "dialog"}>
      <div class="header">
        <div class="title">{title}</div>
        <button class="close" type="button" on:click={requestClose} aria-label="Закрыть">X</button>
      </div>
      <div class="body">
        <slot />
      </div>
      <div class="actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(10, 10, 16, 0.7);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100000;
  }

  .modal {
    width: min(560px, 90vw);
    background: var(--bg-dark);
    border: 1px solid var(--border-light);
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .title {
    font-size: 1rem;
    color: var(--text);
    font-family: var(--f1);
  }

  .close {
    background: transparent;
    border: 1px solid var(--border-light);
    color: var(--text-2);
    border-radius: 6px;
    width: 28px;
    height: 28px;
    cursor: pointer;
    line-height: 1;
    font-size: 1rem;
  }

  .close:hover {
    color: var(--text);
    border-color: var(--bg-light-extra);
  }

  .body {
    color: var(--text);
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
</style>
