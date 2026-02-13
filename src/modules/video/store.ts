import { derived, writable, get } from "svelte/store";
import { BACKGROUND_VIDEO } from "../../assets/background";
import { LOGO_VIDEO } from "../../assets/logo";
import { JUST_CHATTING } from "../../assets/just-chating";
import type { DrawWebGLVideoParams, DrawWebGLVideo, Description } from "../../drawer/draw-video-webgl";
import type { Filters, Background, Logo, Title, Categories } from "../../drawer/shared";
import type { AppState } from "../../common/types";

export const DEFAULTS_VIDEO_FILTERS: Filters = {
  adjustment: {
    enabled: false,
    gamma: 1,
    saturation: 1,
    contrast: 1,
    brightness: 1,
  },
  blur: {
    enabled: true,
    value: 0.2,
  },
  tilt_shift: {
    enabled: false,
    blur: 5,
    start: {
      x: 600,
      y: 0,
    },
    end: {
      x: 600,
      y: 720,
    },
  },
  vignetting: {
    enabled: false,
    value: 0.3,
    alpha: 1,
    blur: 0.3,
  },
  zoom_blur: {
    enabled: false,
    center: {
      x: 900,
      y: 360,
    },
    value: 0.03,
    radius: 500,
  },
  gradient: {
    enabled: true,
    orientation: "horizontal",
    start: {
      value: 0,
      color: "#0000008c",
    },
    mid: {
      value: 0.34,
      color: "#00000066",
    },
    end: {
      value: 0.6,
      color: "#00000000",
    },
  },
};

export const DEFAULTS_VIDEO_BACKGROUND: Background = {
  src: BACKGROUND_VIDEO,
  x: 0,
  y: 0,
  w: 1280,
  h: 720,
  flip_h: false,
  flip_v: false,
  paste_mode: "aspect",
};

export const DEFAULTS_VIDEO_LOGO: Logo = {
  src: LOGO_VIDEO,
  x: 1100,
  y: 0,
  w: 180,
  h: 180,
  blur: 0,
  alpha: 1,
};

export const DEFAULTS_VIDEO_TITLE: Title = {
  text: "Заголовок",
  x: 60,
  y: 58,
  font: {
    face: "Gilroy",
    size: 80,
    weight: "700",
    color: "#ffffff",
    line_height: 97,
  },
  shadow: {
    value: 0,
    color: "#00000088",
  },
};

export const DEFAULTS_VIDEO_DESCRIPTION: Description = {
  text: "Очень интересный текст",
  x: 60,
  gap: 7,
  font: {
    face: "Gilroy",
    size: 50,
    weight: "600",
    color: "#ffffff",
    line_height: 60,
  },
  shadow: {
    value: 0,
    color: "#00000088",
  },
};

export const DEFAULTS_VIDEO_CATEGORIES: Categories = {
  src: [JUST_CHATTING],
  names: ["Just Chatting"],
  x: 60,
  y: 432,
  w: 170,
  h: 228,
  round: 12,
  blur: 0.1,
  margin: 32,
  shadow: {
    value: 2,
    color: "#00000066",
  },
};

export const filter = writable<Filters>(structuredClone(DEFAULTS_VIDEO_FILTERS));
export const background = writable<Background>(structuredClone(DEFAULTS_VIDEO_BACKGROUND));
export const logo = writable<Logo>(structuredClone(DEFAULTS_VIDEO_LOGO));
export const title = writable<Title>(structuredClone(DEFAULTS_VIDEO_TITLE));
export const description = writable<Description>(structuredClone(DEFAULTS_VIDEO_DESCRIPTION));
export const categories = writable<Categories>(structuredClone(DEFAULTS_VIDEO_CATEGORIES));

export const datastate = derived(
  [filter, background, logo, title, description, categories],
  ([$filter, $background, $logo, $title, $description, $categories]): DrawWebGLVideoParams => ({
    version: 0,
    width: 1280,
    height: 720,
    scale: 1,
    debug: false,
    filter: $filter,
    background: $background,
    logo: $logo,
    title: $title,
    description: $description,
    categories: $categories,
  }),
);

export const appstate = writable<AppState<DrawWebGLVideo>>({
  background: BACKGROUND_VIDEO.split(",")[0],
  background_loading: false,
  background_width: 1280,
  background_height: 720,
  background_aspect: 1280 / 720,
  logo: LOGO_VIDEO.split(",")[0],
  app: undefined,
});

export type VideoTemplateSnapshot = {
  version: 1;
  filter: Filters;
  background: Background;
  logo: Logo;
  title: Title;
  description: Description;
  categories: Categories;
  app: {
    background: string;
    background_width: number;
    background_height: number;
    background_aspect: number;
    logo: string;
  };
};

const VIDEO_TEMPLATE_VERSION = 1;

function safeClone<T>(value: T): T {
  try {
    return structuredClone(value);
  } catch {
    try {
      return JSON.parse(JSON.stringify(value)) as T;
    } catch {
      return value;
    }
  }
}

export function createVideoTemplateSnapshot(): VideoTemplateSnapshot {
  const app = get(appstate);
  return {
    version: VIDEO_TEMPLATE_VERSION,
    filter: safeClone(get(filter)),
    background: safeClone(get(background)),
    logo: safeClone(get(logo)),
    title: safeClone(get(title)),
    description: safeClone(get(description)),
    categories: safeClone(get(categories)),
    app: {
      background: app.background,
      background_width: app.background_width,
      background_height: app.background_height,
      background_aspect: app.background_aspect,
      logo: app.logo,
    },
  };
}

export function applyVideoTemplateSnapshot(snapshot: VideoTemplateSnapshot) {
  if (!snapshot || snapshot.version !== VIDEO_TEMPLATE_VERSION) return;

  filter.set(safeClone(snapshot.filter));
  background.set(safeClone(snapshot.background));
  logo.set(safeClone(snapshot.logo));
  title.set(safeClone(snapshot.title));
  description.set(safeClone(snapshot.description));
  categories.set(safeClone(snapshot.categories));

  appstate.update((state) => ({
    ...state,
    background: snapshot.app?.background ?? state.background,
    background_width: snapshot.app?.background_width ?? state.background_width,
    background_height: snapshot.app?.background_height ?? state.background_height,
    background_aspect: snapshot.app?.background_aspect ?? state.background_aspect,
    logo: snapshot.app?.logo ?? state.logo,
    background_loading: false,
  }));
}
