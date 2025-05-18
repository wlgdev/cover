import { derived, writable } from "svelte/store";
import { BACKGROUND_STREAM } from "../../assets/background";
import { LOGO_STREAM } from "../../assets/logo";
import { JUST_CHATTING } from "../../assets/just-chating";
import type { DrawWebGLStreamParams, DrawWebGLStream } from "../../drawer/draw-stream-webgl";
import type { Filters, Background, Logo, Title, Categories, Box, Badges } from "../../drawer/shared";
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
  src: BACKGROUND_STREAM,
  x: 0,
  y: 0,
  w: 1273,
  h: 711,
  flip_h: false,
  flip_v: false,
  paste_mode: "aspect",
};

export const DEFAULTS_VIDEO_LOGO: Logo = {
  src: LOGO_STREAM,
  x: 1092,
  y: 60,
  w: 121,
  h: 100,
  blur: 0,
  alpha: 0.6,
};

export const DEFAULTS_VIDEO_TITLE: Title = {
  text: "Стримим\nконтент",
  x: 120,
  y: 219,
  font: {
    face: "Gilroy",
    size: 90,
    weight: "700",
    color: "#ffffff",
    line_height: 109,
  },
  shadow: {
    value: 0,
    color: "#00000088",
  },
};

export const DEFAULTS_VIDEO_CATEGORIES: Categories = {
  src: [JUST_CHATTING],
  x: 452,
  y: 481,
  w: 128,
  h: 170,
  round: 12,
  blur: 0.1,
  margin: 20,
  shadow: {
    value: 2,
    color: "#00000066",
  },
};

export const DEFAULTS_STRIPE: Box = {
  x: 0,
  y: 0,
  w: 60,
  h: 711,
  color: "#9047fe",
};

export const DEFAULTS_ROLES: Badges = {
  text: "WELOVEGAMES\nЧат",
  x: 120,
  y: 481,
  h: 75,
  padding_x: 21,
  padding_y: 20,
  margin_x: 12,
  margin_y: 20,
  round: 12,
  color: "#1414188f",
  backdrop: {
    blur: 12,
    quality: 12,
  },
  font: {
    face: "Gilroy",
    size: 32,
    weight: "500",
    color: "#ffffff",
    line_height: 75,
  },
};

const days: Record<number, string> = {
  0: "Воскресенье",
  1: "Понедельник",
  2: "Вторник",
  3: "Среда",
  4: "Четверг",
  5: "Пятница",
  6: "Суббота",
};

const d = new Date();
d.setHours(d.getHours() + 1);

export const DEFAULTS_TIME: Badges = {
  text: `${days[d.getDay()]},${d.getHours()}:00 МСК`,
  x: 120,
  y: 60,
  h: 75,
  padding_x: 21,
  padding_y: 20,
  margin_x: 12,
  margin_y: 20,
  round: 12,
  color: "#dddddd4d",
  backdrop: {
    blur: 12,
    quality: 12,
  },
  font: {
    face: "Gilroy",
    size: 32,
    weight: "500",
    color: "#ffffff",
    line_height: 75,
  },
};

export const filter = writable<Filters>(structuredClone(DEFAULTS_VIDEO_FILTERS));
export const background = writable<Background>(structuredClone(DEFAULTS_VIDEO_BACKGROUND));
export const logo = writable<Logo>(structuredClone(DEFAULTS_VIDEO_LOGO));
export const title = writable<Title>(structuredClone(DEFAULTS_VIDEO_TITLE));
export const categories = writable<Categories>(structuredClone(DEFAULTS_VIDEO_CATEGORIES));
export const stripe = writable<Box>(structuredClone(DEFAULTS_STRIPE));
export const roles = writable<Badges>(structuredClone(DEFAULTS_ROLES));
export const time = writable<Badges>(structuredClone(DEFAULTS_TIME));

export const datastate = derived(
  [filter, background, logo, title, categories, stripe, roles, time],
  ([$filter, $background, $logo, $title, $categories, $stripe, $roles, $time]): DrawWebGLStreamParams => ({
    version: 0,
    width: 1273,
    height: 711,
    scale: 1,
    debug: false,
    filter: $filter,
    background: $background,
    logo: $logo,
    title: $title,
    categories: $categories,
    stripe: $stripe,
    roles: $roles,
    time: $time,
  }),
);

export const appstate = writable<AppState<DrawWebGLStream>>({
  background: BACKGROUND_STREAM.split(",")[0],
  background_loading: false,
  background_width: 1273,
  background_height: 711,
  background_aspect: 1273 / 711,
  logo: LOGO_STREAM.split(",")[0],
  app: undefined,
});
