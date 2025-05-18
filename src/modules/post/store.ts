import { derived, writable } from "svelte/store";
import { BACKGROUND_POST } from "../../assets/background";
import { LOGO_POST, LOGO_GAMERS_BASE, LOGO_BOOSTY } from "../../assets/logo";
import type { DrawWebGLPostParams, DrawWebGLPost, TitleBadge } from "../../drawer/draw-post-webgl";
import type { Filters, Background, Logo, CustomLogo } from "../../drawer/shared";
import type { AppState } from "../../common/types";

export const DEFAULTS_POST_FILTERS: Filters = {
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
      x: 0,
      y: 300,
    },
    end: {
      x: 1280,
      y: 960,
    },
  },
  vignetting: {
    enabled: false,
    value: 0.2,
    alpha: 0.75,
    blur: 0.3,
  },
  zoom_blur: {
    enabled: false,
    center: {
      x: 640,
      y: 450,
    },
    value: 0.03,
    radius: 440,
  },
  gradient: {
    enabled: true,
    orientation: "vertical",
    start: {
      value: 0,
      color: "#000000b3",
    },
    mid: {
      value: 0.25,
      color: "#0000008a",
    },
    end: {
      value: 0.5,
      color: "#00000000",
    },
  },
};

export const DEFAULTS_POST_BACKGROUND: Background = {
  src: BACKGROUND_POST,
  x: 0,
  y: 0,
  w: 1280,
  h: 960,
  flip_h: false,
  flip_v: false,
  paste_mode: "aspect",
};

export const DEFAULTS_POST_LOGO: Logo = {
  src: LOGO_POST,
  x: 1030,
  y: 70,
  w: 180,
  h: 146,
  blur: 0.1,
  alpha: 0.3,
};

export const DEFAULTS_POST_CUSTOM_LOGO: CustomLogo = {
  enabled: false,
  src: LOGO_GAMERS_BASE,
  x: 917,
  y: 69,
  w: 292,
  h: 119,
  blur: 0.1,
  alpha: 0.6,
  translate_x: 685,
  translate_y: 69,
  translate_w: 144,
  translate_h: 119,
};

export const DEFAULTS_POST_TITLE_BADGE: TitleBadge = {
  text: "Розыгрыш\n%Розыгрыша",
  x: 640,
  y: 730,
  accent: "#d42834",
  font: {
    face: "U.S. 101",
    size: 82,
    weight: "400",
    color: "#ffffff",
    line_height: 76,
    space_width: 12,
  },
  rect: {
    w: 608,
    h: 219,
    border_width: 9,
    color: "#000000cc",
    padding_x: 20,
    padding_y: 20,
  },
  footnote: {
    enabled: false,
    text: "Для подписчиков boosty TIER 3-6 и %KING %OF %BOOSTY",
    image: LOGO_BOOSTY(),
    size: 32,
    space_width: 5,
    margin: 46,
  },
};

export const filter = writable<Filters>(structuredClone(DEFAULTS_POST_FILTERS));
export const background = writable<Background>(structuredClone(DEFAULTS_POST_BACKGROUND));
export const logo = writable<Logo>(structuredClone(DEFAULTS_POST_LOGO));
export const custom_logo = writable<CustomLogo>(structuredClone(DEFAULTS_POST_CUSTOM_LOGO));
export const title_badge = writable<TitleBadge>(structuredClone(DEFAULTS_POST_TITLE_BADGE));

export const datastate = derived(
  [filter, background, logo, title_badge, custom_logo],
  ([$filter, $background, $logo, $title_badge, $custom_logo]): DrawWebGLPostParams => ({
    version: 0,
    width: 1280,
    height: 960,
    scale: 0.9,
    debug: false,
    filter: $filter,
    background: $background,
    logo: $logo,
    custom_logo: $custom_logo,
    title_badge: $title_badge,
  }),
);

export const appstate = writable<AppState<DrawWebGLPost>>({
  background: BACKGROUND_POST.split(",")[0],
  background_loading: false,
  background_width: 1280,
  background_height: 960,
  background_aspect: 1280 / 960,
  logo: LOGO_POST.split(",")[0],
  custom_logo: LOGO_GAMERS_BASE.split(",")[0],
  app: undefined,
});
