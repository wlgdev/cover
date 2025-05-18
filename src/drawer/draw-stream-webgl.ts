import { Sprite, Text, Container, BlurFilter, Filter, Graphics, CanvasTextMetrics, Rectangle, HTMLText } from "pixi.js";
import {
  DropShadowFilter,
  ColorGradientFilter,
  ZoomBlurFilter,
  TiltShiftFilter,
  OldFilmFilter,
  AdjustmentFilter,
  BackdropBlurFilter,
} from "pixi-filters";

import { DrawWebGL } from "./draw-webgl";
import type { Background, Logo, Filters, Title, Categories, Box, Badges, DrawerParamsBase } from "./shared";

export type DrawWebGLStreamParams = DrawerParamsBase & {
  background: Background;
  logo: Logo;
  filter: Filters;
  title: Title;
  categories: Categories;
  stripe: Box;
  roles: Badges;
  time: Badges;
};

export class DrawWebGLStream extends DrawWebGL<DrawWebGLStreamParams> {
  private text_group = new Container();
  private title = new HTMLText();
  private background_group = new Container();
  private backrgound = new Sprite();
  private logo_group = new Container();
  private logo = new Sprite();
  private stripe = new Graphics();
  private categories_group = new Container();
  private categories_block = new Container();
  private categories_title = new HTMLText({
    text: "В планах",
    x: 0,
    y: -44,
    style: {
      fontFamily: "Gilroy",
      fontSize: 24,
      fill: "#ffffff",
      fontWeight: "500",
      lineHeight: 20,
    },
  });
  private roles_block = new Container();
  private roles_group = new Container();
  private roles_title = new HTMLText({
    text: "В ролях",
    x: 0,
    y: -44,
    style: {
      fontFamily: "Gilroy",
      fontSize: 24,
      fill: "#ffffff",
      fontWeight: "500",
      lineHeight: 20,
    },
  });
  private time_group = new Container();

  private prev_filters?: Filters;
  private prev_category_round?: number;

  async mount(state: DrawWebGLStreamParams) {
    this.prev_category_round = state.categories.round;
    this.backrgound = Sprite.from(state.background.src);
    this.logo = Sprite.from(state.logo.src);

    this.text_group.addChild(this.title);
    this.background_group.addChild(this.backrgound);
    this.logo_group.addChild(this.logo);
    this.categories_block.addChild(this.categories_title, this.categories_group);
    this.roles_block.addChild(this.roles_title, this.roles_group);

    this.app.stage.addChild(
      this.background_group,
      this.logo_group,
      this.stripe,
      this.categories_block,
      this.text_group,
      this.roles_block,
      this.time_group,
    );
  }

  public updateTitle(title: Title) {
    this.title.text = title.text;
    const lines = this.title.text.split("\n").length;
    this.title.y = title.y - (lines - 1) * Math.floor(title.font.line_height / 2);
    this.title.x = title.x;

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

  public updateStripe(stripe: Box) {
    this.stripe.clear();
    this.stripe.rect(stripe.x, stripe.y, stripe.w, stripe.h);
    this.stripe.fill(stripe.color);
  }

  public async updateCategories(categories: Categories, roles: Badges) {
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

    if (categories.src.length === 0) {
      this.categories_title.renderable = false;
    } else {
      this.categories_title.renderable = true;
    }

    this.categories_block.x = categories.x;
    this.categories_block.y = categories.y;

    const { maxX } = this.roles_block.getBounds();
    if (maxX > categories.x - roles.margin_x * 2) {
      this.categories_block.x = maxX + roles.margin_x * 2;
    }

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

  public updateRoles(roles: Badges, categories: Categories) {
    if (roles.text.length === 0) {
      this.roles_title.renderable = false;
      this.categories_block.x = categories.x;
    } else {
      this.roles_title.renderable = true;
    }

    this.updateBadges(roles, this.roles_group, this.roles_block);

    const { maxX } = this.roles_block.getBounds();
    if (maxX > categories.x - roles.margin_x * 2) {
      this.categories_block.x = maxX + roles.margin_x * 2;
    }
  }

  public updateTime(time: Badges) {
    this.updateBadges(time, this.time_group);
  }

  private updateBadges(badges: Badges, group: Container, block?: Container) {
    function drawBadge(x: number, y: number, text: string) {
      const text_el = new HTMLText({
        text,
        x: badges.padding_x - 1, // y ???
        style: {
          fontFamily: badges.font.face,
          fontSize: badges.font.size,
          fill: badges.font.color,
          fontWeight: badges.font.weight as any,
          lineHeight: badges.font.line_height,
        },
      });

      const metrics = CanvasTextMetrics.measureText(text, text_el.style);
      const width = metrics.width + badges.padding_x * 2 - 1;
      text_el.y = Math.ceil(badges.h / 2 - metrics.height / 2);

      const rect = new Graphics().roundRect(0, 0, width, badges.h, badges.round).fill(badges.color);
      rect.filters = [new BlurFilter({ strength: 0.4, quality: 10 })];
      rect.filterArea = new Rectangle(0, 0, width - 1, badges.h);

      const container = new Container({
        x: x,
        y: y,
        width: width,
        height: badges.h,
        children: [rect, text_el],
      });

      return { container, width };
    }

    group.removeChildren();

    if (block) {
      block.x = badges.x;
      block.y = badges.y;
    } else {
      group.x = badges.x;
      group.y = badges.y;
    }

    if (badges.text.length === 0) {
      return;
    }

    let x = 0;
    let y = 0;
    const lines = badges.text.split("\n");

    const backdrop = new BackdropBlurFilter({ strength: badges.backdrop.blur, quality: badges.backdrop.quality });

    for (let line = 0; line < lines.length; line++) {
      const words = lines[line].split(",");
      for (let word = 0; word < words.length; word++) {
        const { container, width } = drawBadge(x, y, words[word].trim());
        container.filters = [backdrop];
        container.filterArea = new Rectangle(
          -backdrop.strength,
          -backdrop.strength,
          container.width + backdrop.strength * 2,
          container.height + backdrop.strength * 2,
        );

        group.addChild(container);
        x += badges.margin_x + width;
      }

      y += badges.margin_y + badges.h;
      x = 0;
    }
  }
}
