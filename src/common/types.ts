import type { DrawParams } from "../drawer/shared";

export type AppState<T> = {
  background: string;
  background_loading: boolean;
  background_width: number;
  background_height: number;
  background_aspect: number;
  logo: string;
  custom_logo?: string;
  app?: T;
};

export type DataState = DrawParams;
