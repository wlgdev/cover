import type { DrawWebGLPost, DrawWebGLPostParams } from "./draw-post-webgl";
import type { DrawWebGLStream, DrawWebGLStreamParams } from "./draw-stream-webgl";
import type { DrawWebGLVideo, DrawWebGLVideoParams } from "./draw-video-webgl";

export type DrawParams = DrawWebGLVideoParams | DrawWebGLStreamParams | DrawWebGLPostParams;
export type Drawer = DrawWebGLVideo | DrawWebGLStream | DrawWebGLPost;

export type DrawerParamsBase = {
  version: number;
  width: number;
  height: number;
  scale: number;
  debug: boolean;
};

export type Filters = {
  adjustment: {
    enabled: boolean;
    gamma: number;
    saturation: number;
    contrast: number;
    brightness: number;
  };
  blur: {
    enabled: boolean;
    value: number;
  };
  tilt_shift: {
    enabled: boolean;
    blur: number;
    start: {
      x: number;
      y: number;
    };
    end: {
      x: number;
      y: number;
    };
  };
  vignetting: {
    enabled: boolean;
    value: number;
    alpha: number;
    blur: number;
  };
  zoom_blur: {
    enabled: boolean;
    center: {
      x: number;
      y: number;
    };
    value: number;
    radius: number;
  };
  gradient: {
    enabled: boolean;
    orientation: "vertical" | "horizontal";
    start: {
      value: number;
      color: string;
    };
    mid: {
      value: number;
      color: string;
    };
    end: {
      value: number;
      color: string;
    };
  };
};

export type Background = {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  flip_h: boolean;
  flip_v: boolean;
  paste_mode: "fit" | "aspect";
};

export type Logo = {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  blur: number;
  alpha: number;
};

export type CustomLogo = Logo & {
  enabled: boolean;
  translate_x: number;
  translate_y: number;
  translate_w: number;
  translate_h: number;
};

export type Title = {
  text: string;
  x: number;
  y: number;
  font: {
    face: string;
    size: number;
    weight: string;
    color: string;
    line_height: number;
  };
  shadow: {
    value: number;
    color: string;
  };
};

export type Categories = {
  src: string[];
  x: number;
  y: number;
  w: number;
  h: number;
  margin: number;
  round: number;
  blur: number;
  shadow: {
    value: number;
    color: string;
  };
};

export type Box = {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
};

export type Badges = {
  text: string;
  x: number;
  y: number;
  h: number;
  padding_x: number;
  padding_y: number;
  margin_x: number;
  margin_y: number;
  round: number;
  color: string;
  backdrop: {
    blur: number;
    quality: number;
  };
  font: {
    face: string;
    size: number;
    weight: string;
    color: string;
    line_height: number;
  };
};
