<script lang="ts">
  import type { Readable, Writable } from "svelte/store";
  import type { Background } from "./drawer/shared";

  import * as Video from "./modules/video";
  import * as Stream from "./modules/stream";
  import * as Post from "./modules/post";
  import Select from "./components/Select.svelte";
  import Modal from "./components/Modal.svelte";
  import { countAspectRatio } from "./common";
  import { onMount, tick } from "svelte";
  import { Save, FolderOpen, Trash2 } from "./components/icons.svelte";

  import {
    deleteTemplate,
    migrateLegacyTemplates,
    readTemplates,
    saveTemplate,
    TEMPLATE_KINDS,
    type TemplateKind,
  } from "./common/template-storage";

  import Testing from "./components/Testing.svelte";

  let selector = $state(localStorage.getItem("template") ?? "youtube");

  type AnyTemplateSnapshot =
    | Video.VideoTemplateSnapshot
    | Stream.StreamTemplateSnapshot
    | Post.PostTemplateSnapshot;

  let background: Writable<Background>;
  let appstate: Writable<any>;
  let datastate: Readable<any>;

  let current_loaded_src = "";
  let modal: "save" | "load" | "info" | "delete" | null = $state(null);
  let modal_info = $state("");
  let save_name = $state("");
  let save_error = $state("");
  let load_name = $state("");
  let delete_name = $state("");
  let templates_cache = $state<Record<string, AnyTemplateSnapshot>>({});
  let template_entries = $state<{ name: string; categories_label: string }[]>([]);
  let modal_kind = $state<TemplateKind | null>(null);

  let save_name_trimmed = $derived(save_name.trim());
  let save_exists = $derived(Boolean(save_name_trimmed && templates_cache[save_name_trimmed]));

  onMount(() => {
    void migrateLegacyTemplates();
  });

  $effect(() => {
    if (modal === "save" && save_error && save_name_trimmed) {
      save_error = "";
    }
  });

  // @ts-ignore
  window.addEventListener("texture_loaded", (event: CustomEvent) => {
    if (event.detail === current_loaded_src) {
      $appstate.background_loading = false;
      current_loaded_src = "";
    }
  });

  $effect(() => {
    switch (selector) {
      case "youtube":
        background = Video.background;
        datastate = Video.datastate;
        appstate = Video.appstate;
        break;
      case "twitch":
        background = Stream.background;
        datastate = Stream.datastate;
        appstate = Stream.appstate;
        break;
      case "post":
        background = Post.background;
        datastate = Post.datastate;
        appstate = Post.appstate;
      default:
        break;
    }
    localStorage.setItem("template", selector);
    tick();
  });

  function onPaste(event: ClipboardEvent) {
    if ((event?.target as Node)?.nodeName === "INPUT" || (event?.target as Node)?.nodeName === "TEXTAREA") return;
    if (pasteBackground(event.clipboardData?.items)) {
      event.preventDefault();
    }
  }

  function onDrop(event: DragEvent) {
    pasteBackground(event.dataTransfer?.items);
  }

  function pasteBackground(items: DataTransferItemList | undefined): boolean {
    if (!items) return false;

    for (const item of Object.values(items)) {
      if (item.kind !== "file") continue;
      $appstate.background_loading = true;
      const blob = item.getAsFile();
      const reader = new FileReader();

      reader.onload = (event) => {
        const data = event.target?.result as string;
        const type = data.split(",")[0];

        current_loaded_src = data;
        if (type.includes("data:image")) {
          $appstate.background = type;

          if ($background.paste_mode === "fit") {
            $background = {
              ...$background,
              src: data,
              x: 0,
              y: 0,
              w: $datastate.width,
              h: $datastate.height,
            };

            const img = new Image();
            img.src = data;
            img.onload = () => {
              $appstate = {
                ...$appstate,
                background_width: img.width,
                background_height: img.height,
                background_aspect: img.width / img.height,
                // background_loading: false,
              };
            };
          } else if ($background.paste_mode === "aspect") {
            const img = new Image();
            img.src = data;
            img.onload = () => {
              const aspect_data = countAspectRatio($datastate.width, $datastate.height, img.width, img.height);

              $background = {
                ...$background,
                ...aspect_data,
                src: data,
              };

              $appstate = {
                ...$appstate,
                background_width: img.width,
                background_height: img.height,
                background_aspect: img.width / img.height,
                // background_loading: false,
              };
            };
          }

          return true;
        }
      };

      reader.onerror = () => {
        $appstate.background_loading = false;
        modal_info = "Ошибка чтения файла.";
        modal = "info";
      };

      reader.onabort = reader.onerror;

      if (blob) {
        reader.readAsDataURL(blob);
      }
    }
    return false;
  }

  function isTemplateKind(value: string): value is TemplateKind {
    return (TEMPLATE_KINDS as readonly string[]).includes(value);
  }

  function createSnapshot(kind: TemplateKind): AnyTemplateSnapshot {
    switch (kind) {
      case "youtube":
        return Video.createVideoTemplateSnapshot();
      case "twitch":
        return Stream.createStreamTemplateSnapshot();
      case "post":
        return Post.createPostTemplateSnapshot();
    }
  }

  function applySnapshot(kind: TemplateKind, snapshot: AnyTemplateSnapshot) {
    switch (kind) {
      case "youtube":
        Video.applyVideoTemplateSnapshot(snapshot as Video.VideoTemplateSnapshot);
        break;
      case "twitch":
        Stream.applyStreamTemplateSnapshot(snapshot as Stream.StreamTemplateSnapshot);
        break;
      case "post":
        Post.applyPostTemplateSnapshot(snapshot as Post.PostTemplateSnapshot);
        break;
    }
  }

  function buildTemplateEntries(kind: TemplateKind, templates: Record<string, AnyTemplateSnapshot>) {
    return Object.keys(templates)
      .sort((a, b) => a.localeCompare(b, "ru"))
      .map((name) => {
        const template: any = templates[name];
        if (kind === "post") {
          return { name, categories_label: "без категорий" };
        }
        const names = (template?.categories?.names ?? []).filter(Boolean);
        let categories_label = "";
        if (names.length > 0) {
          categories_label = names.join(", ");
        } else if (template?.categories?.src?.length) {
          categories_label = `категорий: ${template.categories.src.length}`;
        } else {
          categories_label = "без категорий";
        }
        return { name, categories_label };
      });
  }

  async function openSaveModal() {
    if (!isTemplateKind(selector)) return;
    modal_kind = selector;
    await migrateLegacyTemplates();
    templates_cache = await readTemplates(modal_kind);
    save_name = "";
    save_error = "";
    modal = "save";
  }

  async function openLoadModal() {
    if (!isTemplateKind(selector)) return;
    modal_kind = selector;
    await migrateLegacyTemplates();
    templates_cache = await readTemplates(modal_kind);
    template_entries = buildTemplateEntries(modal_kind, templates_cache);
    if (template_entries.length === 0) {
      modal_info = "Нет сохраненных шаблонов.";
      modal = "info";
      return;
    }
    load_name = template_entries[0].name;
    modal = "load";
  }

  function openDeleteModal(name: string) {
    delete_name = name;
    modal = "delete";
  }

  function closeModal() {
    modal = null;
    modal_kind = null;
  }

  async function onSaveTemplateConfirm() {
    if (!save_name_trimmed || !modal_kind) {
      save_error = "Введите название шаблона.";
      return;
    }
    await saveTemplate(modal_kind, save_name_trimmed, createSnapshot(modal_kind));
    modal = null;
    modal_kind = null;
  }

  function onLoadTemplateConfirm() {
    if (!load_name || !modal_kind) return;
    const template = templates_cache[load_name];
    if (!template) {
      modal_info = "Шаблон не найден.";
      modal = "info";
      return;
    }
    applySnapshot(modal_kind, template);
    modal = null;
    modal_kind = null;
  }

  async function onDeleteTemplateConfirm() {
    if (!delete_name || !modal_kind) return;
    const templates = await readTemplates(modal_kind);
    if (!templates[delete_name]) {
      modal_info = "Шаблон не найден.";
      modal = "info";
      return;
    }

    await deleteTemplate(modal_kind, delete_name);

    templates_cache = await readTemplates(modal_kind);
    template_entries = buildTemplateEntries(modal_kind, templates_cache);

    if (template_entries.length === 0) {
      modal = null;
      modal_info = "Нет сохраненных шаблонов.";
      modal = "info";
      return;
    }

    if (load_name === delete_name) {
      load_name = template_entries[0].name;
    }

    modal = "load";
  }
</script>

<!-- svelte-ignore state_referenced_locally -->
<svelte:window on:paste={onPaste} on:dragover|preventDefault on:drop|preventDefault={onDrop} />

<div class="container">
  <main>
    <div class="selector">
      <Select options={["youtube", "twitch", "post"]} bind:selected={selector} />
      {#if isTemplateKind(selector)}
        <div class="template-actions">
          <button class="action" onclick={openSaveModal} title="Сохранить" aria-label="Сохранить">
            <Save size="1rem" />
          </button>
          <button class="action" onclick={openLoadModal} title="Загрузить" aria-label="Загрузить">
            <FolderOpen size="1rem" />
          </button>
        </div>
      {/if}
    </div>
    {#if selector === "youtube"}
      <Video.Canvas />
    {:else if selector === "twitch"}
      <Stream.Canvas />
    {:else if selector === "post"}
      <Post.Canvas />
    {:else if selector === "test"}
      <Testing />
    {:else}
      empty
    {/if}
  </main>
  <aside>
    {#if selector === "youtube"}
      <Video.Settings />
    {:else if selector === "twitch"}
      <Stream.Settings />
    {:else if selector === "post"}
      <Post.Settings />
    {:else}
      empty
    {/if}
  </aside>
</div>

<Modal open={modal === "save"} title="Сохранить шаблон" on:close={closeModal}>
  <div class="modal-field">
    <input type="text" bind:value={save_name} placeholder="Название шаблона" />
    {#if save_error}
      <div class="modal-error">{save_error}</div>
    {/if}
  </div>
  <div class="modal-hint save-hint">
    {#if save_exists}
      Такой шаблон уже есть. Нажмите «Перезаписать», чтобы заменить его.
    {:else}
      Название должно быть уникальным.
    {/if}
  </div>
  <div slot="actions">
    <button class="modal-action secondary" type="button" onclick={closeModal}>Отмена</button>
    <button class="modal-action" type="button" onclick={onSaveTemplateConfirm}>
      {save_exists ? "Перезаписать" : "Сохранить"}
    </button>
  </div>
</Modal>

<Modal open={modal === "load"} title="Загрузить шаблон" on:close={closeModal}>
  <div class="template-list">
    {#each template_entries as entry}
      <div class="template-row">
        <button
          class="template-item"
          class:active={load_name === entry.name}
          type="button"
          onclick={() => (load_name = entry.name)}
        >
          <span class="template-name">{entry.name}</span>
          <span class="template-categories">({entry.categories_label})</span>
        </button>
        <button
          class="template-delete"
          type="button"
          title="Удалить"
          aria-label="Удалить"
          onclick={() => openDeleteModal(entry.name)}
        >
          <Trash2 size="0.9rem" />
        </button>
      </div>
    {/each}
  </div>
  <div slot="actions">
    <button class="modal-action secondary" type="button" onclick={closeModal}>Отмена</button>
    <button class="modal-action" type="button" onclick={onLoadTemplateConfirm}>Загрузить</button>
  </div>
</Modal>

<Modal open={modal === "info"} title="Сообщение" on:close={closeModal}>
  <div class="modal-hint">{modal_info}</div>
  <div slot="actions">
    <button class="modal-action" type="button" onclick={closeModal}>Ок</button>
  </div>
</Modal>

<Modal open={modal === "delete"} title="Удалить шаблон" on:close={closeModal}>
  <div class="modal-hint">Удалить шаблон «{delete_name}»? Это действие нельзя отменить.</div>
  <div slot="actions">
    <button class="modal-action secondary" type="button" onclick={closeModal}>Отмена</button>
    <button class="modal-action danger" type="button" onclick={onDeleteTemplateConfirm}>Удалить</button>
  </div>
</Modal>

<style>
  :global(body) {
    color: var(--text);
  }

  .container {
    display: flex;
    height: 100vh;
  }

  aside {
    width: 600px;
    background-color: var(--bg-dark);
    overflow-y: auto;
    overflow-x: hidden;
    padding: 1rem;
  }

  main {
    flex: 1;
    padding: 1rem;
    background-color: var(--bg-dark-extra);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    position: relative;
  }

  .selector {
    position: absolute;
    top: 20px;
    left: 50%;
    translate: -50% 0;
    color: var(--text-2);
    font-size: 0.8rem;
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .template-actions {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .template-actions .action {
    background-color: var(--bg-light);
    color: var(--text);
    border: 1px solid var(--border-light);
    border-radius: 0.3rem;
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-family: var(--f1);
    font-size: 0.85rem;
  }

  .template-actions .action:hover {
    background-color: var(--bg-light-extra);
  }

  .modal-field input[type="text"] {
    width: 100%;
  }

  .modal-error {
    margin-top: 0.4rem;
    color: var(--red);
    font-size: 0.85rem;
  }

  .modal-hint {
    color: var(--text-2);
    font-size: 0.85rem;
  }

  .modal-hint.save-hint {
    margin-top: 0.9rem;
    font-style: italic;
  }

  .modal-action {
    background-color: var(--violet);
    color: var(--text);
    border: 1px solid transparent;
    border-radius: 0.4rem;
    padding: 0.4rem 0.9rem;
    cursor: pointer;
    font-family: var(--f1);
  }

  .modal-action.secondary {
    background-color: var(--bg-light);
    border-color: var(--border-light);
  }

  .modal-action:hover {
    background-color: var(--violet-dark);
  }

  .modal-action.secondary:hover {
    background-color: var(--bg-light-extra);
  }

  .modal-action.danger {
    background-color: var(--red-dark);
  }

  .modal-action.danger:hover {
    background-color: var(--red);
  }

  .template-list {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    max-height: 40vh;
    overflow-y: auto;
  }

  .template-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .template-item {
    flex: 1;
    background-color: var(--bg-light);
    border: 1px solid transparent;
    border-radius: 0.5rem;
    padding: 0.5rem 0.7rem;
    cursor: pointer;
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    text-align: left;
    color: var(--text);
    font-family: var(--f1);
  }

  .template-item:hover {
    background-color: var(--bg-light-extra);
  }

  .template-item.active {
    border-color: var(--violet);
    background-color: var(--bg-dark-extra);
  }

  .template-delete {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.4rem;
    border: 1px solid var(--border-light);
    background-color: var(--bg-light);
    color: var(--text-2);
    cursor: pointer;
  }

  .template-delete:hover {
    background-color: var(--bg-light-extra);
    color: var(--text);
  }

  .template-name {
    font-size: 0.95rem;
  }

  .template-categories {
    font-size: 0.75rem;
    color: var(--text-2);
  }
</style>
