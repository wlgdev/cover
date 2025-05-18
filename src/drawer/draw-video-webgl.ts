import { Sprite, Container, BlurFilter, HTMLText, CanvasTextMetrics } from "pixi.js";
import { DropShadowFilter } from "pixi-filters";

import { DrawWebGL } from "./draw-webgl";
import type { Background, Logo, Filters, Title, Categories, DrawerParamsBase } from "./shared";

export type Description = {
  text: string;
  x: number;
  gap: number;
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

export type DrawWebGLVideoParams = DrawerParamsBase & {
  background: Background;
  logo: Logo;
  filter: Filters;
  title: Title;
  description: Description;
  categories: Categories;
};

export class DrawWebGLVideo extends DrawWebGL<DrawWebGLVideoParams> {
  private text_group = new Container();
  private title = new HTMLText();
  private description = new HTMLText();
  private background_group = new Container();
  private backrgound = new Sprite();
  private logo_group = new Container();
  private logo = new Sprite();
  private categories_group = new Container();

  private prev_category_round?: number;
  private prev_filters?: Filters;

  async mount(state: DrawWebGLVideoParams) {
    this.prev_category_round = state.categories.round;
    this.backrgound = Sprite.from(state.background.src, true);
    this.logo = Sprite.from(state.logo.src, true);

    this.text_group.addChild(this.title, this.description);
    this.background_group.addChild(this.backrgound);
    this.logo_group.addChild(this.logo);
    this.app.stage.addChild(this.background_group, this.logo_group, this.text_group, this.categories_group);
  }

  public updateText(title: Title, description: Description) {
    this.updateTitle(title, description);
    this.updateDescription(title, description);
  }

  private updateTitle(title: Title, description: Description) {
    this.title.x = title.x;
    this.title.y = title.y;
    this.title.text = title.text;

    const [title_shadow_color, title_shadow_alpha] = this.splitRGBA(title.shadow.color);
    this.title.style = {
      fontFamily: title.font.face,
      fontSize: title.font.size,
      fill: title.font.color,
      fontWeight: title.font.weight as any,
      lineHeight: title.font.line_height,
      dropShadow: {
        color: title_shadow_color,
        blur: title.shadow.value,
        distance: 0,
        alpha: title_shadow_alpha,
      },
    };

    const metrics = CanvasTextMetrics.measureText(this.title.text, this.title.style);
    this.description.y = metrics.height + description.font.line_height + description.gap;
  }

  private updateDescription(title: Title, description: Description) {
    const [description_shadow_color, description_shadow_alpha] = this.splitRGBA(description.shadow.color);
    this.description.text = description.text;
    this.description.x = description.x;
    this.description.style = {
      fontFamily: description.font.face,
      fontSize: description.font.size,
      fill: description.font.color,
      fontWeight: description.font.weight as any,
      lineHeight: description.font.line_height,
      dropShadow: {
        color: description_shadow_color,
        blur: description.shadow.value,
        distance: 0,
        alpha: description_shadow_alpha,
      },
    };

    // CanvasTextMetrics._measurementCache = {};
    const metrics = CanvasTextMetrics.measureText(this.title.text, this.title.style);
    this.description.y = metrics.height + description.font.line_height + description.gap;
  }

  public async updateBackground(background: Background, filter: Filters) {
    const texture = await this.textures.get(background.src);
    if (texture) {
      this.backrgound.texture = texture;
    }

    this.backrgound.x = background.x;
    this.backrgound.y = background.y;
    this.backrgound.width = background.w;
    this.backrgound.height = background.h;

    if (background.flip_h) {
      this.backrgound.scale.x = -Math.abs(this.backrgound.scale.x);
      this.backrgound.x = this.backrgound.x + this.backrgound.width;
    } else {
      this.backrgound.scale.x = Math.abs(this.backrgound.scale.x);
    }

    if (background.flip_v) {
      this.backrgound.scale.y = -Math.abs(this.backrgound.scale.y);
      this.backrgound.y = this.backrgound.y + this.backrgound.height;
    } else {
      this.backrgound.scale.y = Math.abs(this.backrgound.scale.y);
    }

    if (this.prev_filters !== undefined && this.diff(this.prev_filters, filter).length === 0) {
      return;
    }
    this.prev_filters = structuredClone(filter);
    this.background_group.filters = this.buildFilters(filter, this.backrgound);
  }

  public async updateLogo(logo: Logo) {
    this.logo.x = logo.x;
    this.logo.y = logo.y;
    this.logo.width = logo.w;
    this.logo.height = logo.h;
    this.logo.alpha = logo.alpha;
    const texture = await this.textures.get(logo.src);
    if (texture) {
      this.logo.texture = texture;
    }

    this.logo.filters = [
      new BlurFilter({
        strength: logo.blur,
        quality: 15,
      }),
    ];
  }

  public async updateCategories(categories: Categories) {
    if (this.prev_category_round != categories.round) {
      for (const container of this.categories_group.children) {
        const mask = this.createRoundedRectMask(categories.w, categories.h, categories.round);
        container.removeChildAt(1);
        const sprite = container.children[0] as Sprite;
        sprite.mask = mask;
        container.addChild(mask);
      }
      this.prev_category_round = categories.round;
      return;
    }

    this.categories_group.x = categories.x;
    this.categories_group.y = categories.y;
    const [color, alpha] = this.splitRGBA(categories.shadow.color);

    for (const [i, src] of categories.src.entries()) {
      const texture = await this.textures.get(src);
      if (!texture) continue;

      let container: Container;

      if (i < this.categories_group.children.length) {
        container = this.categories_group.getChildAt<Container>(i);
        const sprite = container.getChildAt<Sprite>(0);
        sprite.texture = texture;
      } else {
        container = new Container();

        const mask = this.createRoundedRectMask(categories.w, categories.h, categories.round);
        const sprite = new Sprite({
          width: categories.w,
          height: categories.h,
          texture: texture,
          mask: mask,
        });

        container.addChild(sprite);
        container.addChild(mask);
        this.categories_group.addChild(container);
      }

      container.x = i * (categories.w + categories.margin);
      container.y = 0;
      container.width = categories.w;
      container.height = categories.h;
      container.filters = [
        new BlurFilter({
          strength: categories.blur,
          quality: 15,
        }),
        new DropShadowFilter({
          offset: { x: 0, y: 0 },
          color: parseInt(color.slice(1), 16),
          alpha: alpha,
          blur: categories.shadow.value,
          quality: 15,
        }),
      ];
    }

    while (this.categories_group.children.length > categories.src.length) {
      this.categories_group.removeChildAt(this.categories_group.children.length - 1);
    }
  }
}
