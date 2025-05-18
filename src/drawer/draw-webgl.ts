import { Application, Assets, Texture, Graphics, Filter, BlurFilter, Sprite } from "pixi.js";
import { ColorGradientFilter, ZoomBlurFilter, TiltShiftFilter, OldFilmFilter, AdjustmentFilter } from "pixi-filters";
import type { Filters } from "./shared";

type InitOptions<T> = {
  mount_point: HTMLDivElement;
  background: string;
  width: number;
  height: number;
  state: T;
  back_bufer?: boolean;
  texture_fail?: CallableFunction;
  texture_success?: CallableFunction;
};

export class Cache<K, V> {
  private cache: Map<K, V> = new Map();
  private last_failed?: K = undefined;

  constructor(
    private updater: (key: K) => Promise<V>,
    private fail?: CallableFunction,
    private success?: CallableFunction,
  ) {}

  async get(key: K): Promise<V | null> {
    if (this.last_failed === key) return null;

    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    } else {
      try {
        const value = await this.updater(key);
        if (this.success) {
          this.success(key);
        }
        this.cache.set(key, value);
        return value;
      } catch (e) {
        this.last_failed = key;
        if (this.fail) {
          this.fail(key);
        }
        return null;
      }
    }
  }

  get size() {
    return this.cache.size;
  }
}

export abstract class DrawWebGL<T> {
  protected app!: Application;
  protected textures!: Cache<string, Texture>;

  constructor(fail?: CallableFunction, success?: CallableFunction) {
    this.textures = new Cache<string, Texture>(async (key) => await Assets.load(key), fail, success);
  }

  static async create<T, C extends DrawWebGL<T>>(
    this: new (fail?: CallableFunction, success?: CallableFunction) => C,
    params: InitOptions<T>,
  ): Promise<C> {
    const instance = new this(params.texture_fail, params.texture_success);
    await instance.init(params);
    return instance;
  }

  abstract mount(state: T): Promise<void>;
  // abstract update(state: T): Promise<void>;

  protected async init(params: InitOptions<T>) {
    this.app = new Application();
    const [color, alpha] = this.splitRGBA(params.background);
    await this.app.init({
      background: color,
      backgroundAlpha: 0,
      width: params.width,
      height: params.height,
      antialias: false,
      useBackBuffer: params.back_bufer === undefined ? true : params.back_bufer,
    });

    await this.mount(params.state);
    params.mount_point.appendChild(this.app.canvas);
  }

  protected splitRGBA(color: string): [string, number] {
    return [color.slice(0, 7), color.length > 7 ? parseInt(color.slice(7, 9), 16) / 255 : 1];
  }

  protected createRoundedRectMask(width: number, height: number, radius: number): Graphics {
    const mask = new Graphics();
    mask.roundRect(0, 0, width, height, radius);
    mask.fill(0xffffff);
    return mask;
  }

  protected diff<T extends object>(left: T, right: T, path: string[] = []): string[] {
    if (left === undefined || right === undefined) {
      return ["undefined"];
    } else {
      for (const key in left) {
        const k = [...path, key];
        if (typeof left[key] === "object") {
          // @ts-ignore
          const result = this.diff(left[key], right[key], k);
          if (result.length > 0) return result;
        } else {
          if (left[key] != right[key]) return k;
        }
      }
      return [];
    }
  }

  protected nochange<T extends object | undefined>(left: T, right: T): boolean {
    if (left !== undefined && right !== undefined && this.diff(left, right).length === 0) {
      return true;
    } else {
      left = structuredClone(right);
      return false;
    }
  }

  protected buildFilters(settings: Filters, backrgound: Sprite): Filter[] {
    const filters: Filter[] = [];

    if (settings.adjustment.enabled) {
      filters.push(
        new AdjustmentFilter({
          gamma: settings.adjustment.gamma,
          saturation: settings.adjustment.saturation,
          contrast: settings.adjustment.contrast,
          brightness: settings.adjustment.brightness,
        }),
      );
    }

    if (settings.blur.enabled) {
      backrgound.x -= settings.blur.value;
      backrgound.y -= settings.blur.value;
      backrgound.width += 2 * settings.blur.value;
      backrgound.height += 2 * settings.blur.value;

      filters.push(
        new BlurFilter({
          strength: settings.blur.value,
          quality: 15,
        }),
      );
    }

    if (settings.tilt_shift.enabled) {
      filters.push(
        new TiltShiftFilter({
          blur: settings.tilt_shift.blur,
          start: { x: settings.tilt_shift.start.x, y: settings.tilt_shift.start.y },
          end: { x: settings.tilt_shift.end.x, y: settings.tilt_shift.end.y },
        }),
      );
    }

    if (settings.vignetting.enabled) {
      filters.push(
        new OldFilmFilter({
          sepia: 0,
          noise: 0,
          scratch: 0,
          vignetting: settings.vignetting.value,
          vignettingAlpha: settings.vignetting.alpha,
          vignettingBlur: settings.vignetting.blur,
        }),
      );
    }

    if (settings.zoom_blur.enabled) {
      filters.push(
        new ZoomBlurFilter({
          strength: settings.zoom_blur.value,
          center: { x: settings.zoom_blur.center.x, y: settings.zoom_blur.center.y },
          innerRadius: settings.zoom_blur.radius,
        }),
      );
    }

    if (settings.gradient.enabled) {
      const start = this.splitRGBA(settings.gradient.start.color);
      const mid = this.splitRGBA(settings.gradient.mid.color);
      const end = this.splitRGBA(settings.gradient.end.color);

      const stops = [
        {
          color: start[0],
          alpha: start[1],
          offset: settings.gradient.start.value,
        },
        {
          color: mid[0],
          alpha: mid[1],
          offset: settings.gradient.mid.value,
        },
        {
          color: end[0],
          alpha: end[1],
          offset: settings.gradient.end.value,
        },
      ];

      if (stops[0].offset > 0) {
        stops.unshift({
          color: start[0],
          alpha: start[1],
          offset: 0,
        });
      }

      filters.push(
        new ColorGradientFilter({
          type: ColorGradientFilter.LINEAR,
          stops: stops,
          angle: settings.gradient.orientation === "horizontal" ? 90 : 0,
        }),
      );
    }

    return filters;
  }
}
