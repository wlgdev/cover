# AGENTS.md

## Обзор проекта

**wlgcover** — SPA-приложение для интерактивного создания обложек видео и стримов. Проект построен на **Svelte** и **Pixi.js 8** для WebGL-рендеринга. Приложение позволяет создавать обложки для трёх платформ: YouTube, Twitch и Telegram-посты.

### Текущее состояние

Проект находится в переходном состоянии между версиями Svelte:

- **Stores** используют классический Svelte 4 API (`writable`, `derived`, `get` из `svelte/store`)
- **Компоненты** используют Svelte 5 runes (`$props()`, `$state()`, `$effect()`, `{#snippet}`)

**Планы по обновлению** (когда будут ресурсы):

- Миграция на Svelte 5 (полный переход на runes)
- Обновление до Vite 7
- Переход на Bun

> Важно: При разработке сохраняйте консистентность кодовой базы. Новые stores пишите в стиле Svelte 4, компоненты — с использованием runes.

## Технологический стек

### Основные технологии

- **Svelte 5** — UI-фреймворк с использованием runes (`$state`, `$derived`, `$effect`, `$props`)
- **Pixi.js 8** — WebGL-рендеринг графики
- **pixi-filters** — набор фильтров для обработки изображений (blur, vignette, gradient и др.)
- **TypeScript** — типизация
- **Vite** — сборщик

### UI-библиотеки

- **@melt-ui/svelte** — headless UI-компоненты
- **bits-ui** — UI-примитивы
- **lucide-svelte** — иконки
- **svelte-awesome-color-picker** — выбор цвета
- **svelte-multiselect** — множественный выбор
- **svelte-loading-spinners** — индикаторы загрузки

### Утилиты

- **color-thief-node** — извлечение палитры цветов из изображений
- **fontfaceobserver** — отслеживание загрузки шрифтов
- **@shevernitskiy/scraperator** — скрапинг данных Twitch (категории игр)

### Плагины Vite

- **vite-plugin-singlefile** — сборка в один HTML-файл
- **vite-plugin-global-const** — глобальные константы (VITE_BUILD)
- **vite-plugin-node-polyfills** — полифилы для Node.js API в браузере

## Архитектура проекта

```
src/
├── app.css                    # Глобальные стили и CSS-переменные
├── App.svelte                 # Корневой компонент
├── Layout.svelte              # Основной layout с выбором шаблона
├── main.ts                    # Точка входа
├── vite-env.d.ts              # Типы Vite
│
├── assets/                    # Встроенные ресурсы (base64)
│   ├── background.ts          # Дефолтный фон для стримов
│   ├── just-chating.ts        # Иконка категории Just Chating
│   └── logo.ts                # Логотип для стримов
│
├── common/                    # Общие утилиты и типы
│   ├── index.ts               # Утилиты (loadImage, countAspectRatio)
│   ├── twitch.ts              # API для поиска категорий Twitch
│   └── types.ts               # Общие типы (AppState, DataState)
│
├── components/                # UI-компоненты
│   ├── Canvas.svelte          # Базовый canvas-компонент с drag/zoom
│   ├── Background.svelte      # Настройки фона
│   ├── Filters.svelte         # Настройки фильтров
│   ├── Categories.svelte      # Отображение категорий
│   ├── CategorySelect.svelte  # Выбор категорий через Twitch API
│   ├── Title.svelte           # Настройки заголовка
│   ├── Logo.svelte            # Настройки логотипа
│   ├── Gradient.svelte        # Настройки градиента
│   ├── Roles.svelte           # Настройки ролей/бейджей
│   ├── StreamTime.svelte      # Настройки времени стрима
│   ├── Modal.svelte           # Модальное окно
│   ├── Input*.svelte          # Инпуты (text, number, color, file)
│   ├── Select.svelte          # Селект
│   ├── Toggle*.svelte         # Переключатели
│   └── ...                    # Другие компоненты
│
├── drawer/                    # Система рендеринга
│   ├── shared.ts              # Общие типы (Filters, Background, Logo, Title, etc.)
│   ├── draw.ts                # Canvas2D рендеринг (устаревший)
│   ├── draw-webgl.ts          # Базовый WebGL-рендерер
│   ├── draw-stream-webgl.ts   # Рендерер для Twitch-обложек
│   ├── draw-video-webgl.ts    # Рендерер для YouTube-обложек
│   ├── draw-post-webgl.ts     # Рендерер для Telegram-постов
│   ├── template-stream.ts     # Шаблоны для стримов
│   └── template-video.ts      # Шаблоны для видео
│
└── modules/                   # Модули для каждого типа обложки
    ├── video/                 # YouTube-обложки
    │   ├── index.ts           # Экспорты
    │   ├── Canvas.svelte      # Canvas-компонент
    │   ├── Settings.svelte    # Панель настроек
    │   └── store.ts           # State-менеджмент
    ├── stream/                # Twitch-обложки
    │   └── ...
    └── post/                  # Telegram-посты
        └── ...
```

## Ключевые паттерны и приёмы

### 1. State-менеджмент с Svelte stores

Каждый модуль использует Svelte stores для управления состоянием:

```typescript
// store.ts
import { writable, derived } from "svelte/store";

// Отдельные stores для каждой части состояния
export const filter = writable<Filters>(structuredClone(DEFAULTS_VIDEO_FILTERS));
export const background = writable<Background>(structuredClone(DEFAULTS_VIDEO_BACKGROUND));
export const title = writable<Title>(structuredClone(DEFAULTS_VIDEO_TITLE));

// Derived store для объединения состояния
export const datastate = derived(
  [filter, background, title, ...],
  ([$filter, $background, $title, ...]) => ({
    version: 0,
    width: 1273,
    height: 711,
    filter: $filter,
    background: $background,
    title: $title,
    ...
  })
);
```

### 2. Svelte 5 Runes в компонентах

Компоненты используют новый синтаксис Svelte 5:

```svelte
<script lang="ts">
  // Props через $props()
  let { background, appstate, datastate }: Props = $props();

  // Локальное состояние через $state()
  let paste_mode: boolean = $state($background.paste_mode === "fit");

  // Побочные эффекты через $effect()
  $effect(() => {
    if (prev_paste_mode !== $background.paste_mode) {
      // ...
    }
  });

  // Snippets вместо слотов
  {#snippet fit()}
    <Tooltip tooltip="растянуть"><Fit size="1.2rem" /></Tooltip>
  {/snippet}
</script>
```

> Важно: Stores остаются на классическом Svelte 4 API. Не используйте `$state()` для создания новых stores.

### 3. WebGL-рендеринг с Pixi.js

Базовый класс [`DrawWebGL`](src/drawer/draw-webgl.ts) реализует:

- Инициализацию Pixi Application
- Кэширование текстур через класс `Cache<K, V>`
- Построение цепочки фильтров (adjustment, blur, tilt-shift, vignette, zoom-blur, gradient)
- Абстрактный метод `mount()` для инициализации сцены

```typescript
// Создание рендерера
const renderer = await DrawWebGLStream.create({
  mount_point: div_element,
  state: datastate,
  background: "#14151e",
  width: 1273,
  height: 711,
  back_buffer: true,
});
```

### 4. Система фильтров

Фильтры определены в типе [`Filters`](src/drawer/shared.ts:16):

```typescript
type Filters = {
  adjustment: { enabled: boolean; gamma: number; saturation: number; contrast: number; brightness: number; };
  blur: { enabled: boolean; value: number; };
  tilt_shift: { enabled: boolean; blur: number; start: { x: number; y: number; }; end: { x: number; y: number; }; };
  vignetting: { enabled: boolean; value: number; alpha: number; blur: number; };
  zoom_blur: { enabled: boolean; center: { x: number; y: number; }; value: number; radius: number; };
  gradient: { enabled: boolean; orientation: "vertical" | "horizontal"; start: {...}; mid: {...}; end: {...}; };
};
```

### 5. Модульная архитектура

Каждый модуль (video, stream, post) экспортирует:

```typescript
// modules/stream/index.ts
export { default as Settings } from "./Settings.svelte"; // Панель настроек
export { default as Canvas } from "./Canvas.svelte"; // Canvas-компонент
export {
  appstate, // Состояние приложения
  datastate, // Данные для рендеринга
  background, // Store фона
  logo, // Store логотипа
  filter, // Store фильтров
  createStreamTemplateSnapshot, // Сохранение шаблона
  applyStreamTemplateSnapshot, // Загрузка шаблона
  type StreamTemplateSnapshot,
} from "./store";
```

### 6. Система шаблонов

Шаблоны сохраняются в localStorage:

```typescript
// Ключи хранилища
const TEMPLATE_KEYS = {
  youtube: "wlgcover:video-templates",
  twitch: "wlgcover:stream-templates",
  post: "wlgcover:post-templates",
};

// Создание снимка состояния
function createStreamTemplateSnapshot(): StreamTemplateSnapshot {
  return {
    version: 1,
    filter: safeClone(get(filter)),
    background: safeClone(get(background)),
    // ...
  };
}
```

### 7. Drag & Zoom для фона

Компонент [`Canvas.svelte`](src/components/Canvas.svelte) реализует:

- Drag фона мышью
- Zoom колёсиком мыши
- Double-click для сброса позиции
- Визуальные индикаторы границ (красная рамка)

### 8. Paste/Drop изображений

Поддержка вставки изображений:

```typescript
// Вставка из буфера обмена
function onPaste(event: ClipboardEvent) {
  const blob = item.getAsFile();
  const reader = new FileReader();
  reader.onload = (event) => {
    const data = event.target?.result as string; // base64
    $background.src = data;
  };
  reader.readAsDataURL(blob);
}

// Drag & Drop
function onDrop(event: DragEvent) {
  pasteBackground(event.dataTransfer?.items);
}
```

### 9. Интеграция с Twitch API

Поиск категорий игр через scraperator:

```typescript
// common/twitch.ts
export async function search(query: string[], boxart_quality = "285x380"): Promise<CategoryMetadata[][]> {
  const twitch = new Twitch("welovegames");
  const result = await twitch.searchGames(query, boxart_quality);
  return result.map((game) =>
    game.map((item) => ({
      name: item.name,
      cover: item.thumbnail,
      tags: [],
    })),
  );
}
```

### 10. Типы данных для рендеринга

Основные типы в [`drawer/shared.ts`](src/drawer/shared.ts):

- [`Background`](src/drawer/shared.ts:73) — фон (src, позиция, размер, flip)
- [`Logo`](src/drawer/shared.ts:84) — логотип (src, позиция, размер, blur, alpha)
- [`Title`](src/drawer/shared.ts:102) — заголовок (text, позиция, шрифт, тень)
- [`Categories`](src/drawer/shared.ts:119) — категории (src[], имена, позиция, размер, тень)
- [`Badges`](src/drawer/shared.ts:143) — бейджи (text, позиция, шрифт, backdrop blur)
- [`Box`](src/drawer/shared.ts:135) — прямоугольник (позиция, размер, цвет)

## Сборка и запуск

```bash
# Разработка
pnpm dev

# Сборка (один HTML-файл)
pnpm build

# Превью сборки
pnpm preview

# Проверка типов
pnpm check
```

## Деплой

Проект собирается в один HTML-файл (`dist/wlg_cover.html`) с помощью `vite-plugin-singlefile`. Docker-конфигурация использует nginx для раздачи статики.

## Важные замечания

1. **Шрифты**: Проект использует шрифт "Gilroy" — убедитесь, что он загружен перед рендерингом через `FontFaceObserver`.

2. **Base64 ресурсы**: Дефолтные изображения встроены как base64 в файлах `src/assets/*.ts`.

3. **Svelte 5**: Компоненты используют runes (`$state`, `$derived`, `$effect`, `$props`), stores используют классический Svelte 4 API.

4. **Pixi.js 8**: Используется новая версия с изменённым API (например, `Application.init()` вместо конструктора).

5. **Структура модулей**: Каждый тип обложки — отдельный модуль с собственным store, Canvas и Settings.

6. **Фильтры**: Фильтры применяются к контейнеру фона, а не к отдельным элементам.

7. **Кэширование текстур**: Класс `Cache` в `draw-webgl.ts` кэширует загруженные текстуры для оптимизации.
