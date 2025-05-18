import { Sprite, Text, Container, BlurFilter, Graphics, CanvasTextMetrics, type TextStyleOptions } from "pixi.js";
import { DrawWebGL } from "./draw-webgl";
import type { Background, Logo, CustomLogo, Filters, DrawerParamsBase } from "./shared";
import { LOGO_BOOSTY } from "../assets/logo";

export type TitleBadge = {
  text: string;
  x: number;
  y: number;
  accent: string;
  font: {
    face: string;
    size: number;
    weight: string;
    color: string;
    line_height: number;
    space_width: number;
  };
  rect: {
    w: number;
    h: number;
    border_width: number;
    color: string;
    padding_x: number;
    padding_y: number;
  };
  footnote: {
    enabled: boolean;
    text: string;
    image: string;
    size: number;
    space_width: number;
    margin: number;
  };
};

export type DrawWebGLPostParams = DrawerParamsBase & {
  background: Background;
  logo: Logo;
  custom_logo: CustomLogo;
  filter: Filters;
  title_badge: TitleBadge;
};

export class DrawWebGLPost extends DrawWebGL<DrawWebGLPostParams> {
  private background_group = new Container();
  private backrgound = new Sprite();
  private logo_group = new Container({ renderable: false });
  private logo = new Sprite();
  private custom_logo_group = new Container({ renderable: false });
  private custom_logo = new Sprite();
  private custom_logo_x = new Text({
    text: "x",
    x: 0,
    y: 0,
    style: {
      fontFamily: "Gilroy",
      fontSize: 72,
      fill: "#ffffff",
      fontWeight: "700",
      lineHeight: 20,
    },
  });
  private title_badge_group = new Container();
  private boosty_logo = new Sprite();

  private prev_filters?: Filters;
  private prev_title_badge?: TitleBadge;

  async mount(state: DrawWebGLPostParams) {
    this.backrgound = Sprite.from(state.background.src, true);
    this.logo = Sprite.from(state.logo.src, true);
    this.custom_logo = Sprite.from(state.custom_logo.src, true);
    this.boosty_logo = Sprite.from(LOGO_BOOSTY(state.title_badge.accent), true);
    this.boosty_logo.filters = [new BlurFilter({ strength: 0.2, quality: 5 })];
    this.custom_logo_group.renderable = false;

    this.title_badge_group.x = 0;
    this.title_badge_group.y = 0;
    this.title_badge_group.width = state.width;
    this.title_badge_group.height = state.height;

    this.background_group.addChild(this.backrgound);
    this.logo_group.addChild(this.logo);
    this.custom_logo_group.addChild(this.custom_logo, this.custom_logo_x);
    this.app.stage.addChild(this.background_group, this.logo_group, this.custom_logo_group, this.title_badge_group);
  }

  async update(state: DrawWebGLPostParams) {
    // this.updateBackground(state);
    // this.updateLogo(state);
    // this.updateCustomLogo(state);
    // this.updateTitleBadge(state);
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
    this.logo_group.renderable = true;
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

  public async updateCustomLogo(custom_logo: CustomLogo, logo: Logo) {
    if (!custom_logo.enabled) {
      this.custom_logo_group.renderable = false;
      return;
    }
    this.custom_logo_group.renderable = true;

    this.custom_logo.x = custom_logo.x;
    this.custom_logo.y = custom_logo.y;
    this.custom_logo.width = custom_logo.w;
    this.custom_logo.height = custom_logo.h;
    this.custom_logo.alpha = custom_logo.alpha;
    const texture = await this.textures.get(custom_logo.src);
    if (texture) {
      this.custom_logo.texture = texture;
    }

    this.custom_logo.filters = [
      new BlurFilter({
        strength: custom_logo.blur,
        quality: 15,
      }),
    ];

    const metrics = CanvasTextMetrics.measureText(this.custom_logo_x.text, this.custom_logo_x.style);
    this.custom_logo_x.x = (logo.x + logo.w + custom_logo.x) / 2 - metrics.width / 2;
    this.custom_logo_x.y = (custom_logo.y + custom_logo.h) / 2 - metrics.height / 4;
    this.custom_logo_x.alpha = custom_logo.alpha;
  }

  public async updateTitleBadge(title_badge: TitleBadge) {
    this.title_badge_group.removeChildren();

    const boosty_texture = await this.textures.get(LOGO_BOOSTY(title_badge.accent));
    if (boosty_texture) {
      this.boosty_logo.texture = boosty_texture;
    }

    function drawBox(x: number, y: number, w: number, h: number) {
      const title_badge_rect = new Graphics().rect(x, y, w, h).fill(title_badge.rect.color);

      const frame = new Graphics()
        .rect(
          x - title_badge.rect.border_width,
          y - title_badge.rect.border_width,
          w + title_badge.rect.border_width * 2,
          title_badge.rect.border_width,
        )
        .rect(
          x - title_badge.rect.border_width,
          y + h,
          w + title_badge.rect.border_width * 2,
          title_badge.rect.border_width,
        )
        .rect(
          x - title_badge.rect.border_width,
          y - title_badge.rect.border_width,
          title_badge.rect.border_width,
          h + title_badge.rect.border_width * 2,
        )
        .rect(
          x + w,
          y - title_badge.rect.border_width,
          title_badge.rect.border_width,
          h + title_badge.rect.border_width * 2,
        )
        // .rect(x + w / 2 - 1, y, 2, h) // debug cross
        // .rect(x, y + h / 2 - 1, w, 2)
        .fill(title_badge.accent);

      function drawV(x: number, y: number, angle = 1) {
        return new Graphics()
          .moveTo(x, y)
          .lineTo(x + 30 * angle, y - 30)
          .lineTo(x + 38 * angle, y - 22)
          .lineTo(x + 16 * angle, y)
          .lineTo(x + 38 * angle, y + 22)
          .lineTo(x + 30 * angle, y + 30)
          .lineTo(x, y)
          .fill(title_badge.accent);
      }

      const box = new Container();

      const offset_x = 73;
      const offset_y = 23;
      const delta_x = 25;

      box.addChild(
        title_badge_rect,
        frame,
        drawV(x - offset_x, y + offset_y),
        drawV(x - (offset_x + delta_x), y + offset_y),
        drawV(x + w + offset_x, y + h - offset_y, -1),
        drawV(x + w + (offset_x + delta_x), y + h - offset_y, -1),
      );

      box.filters = [new BlurFilter({ strength: 0.4, quality: 5 })];

      return box;
    }

    const drawText = (text: string, x: number, y: number, size: number, line_height: number, space_width: number) => {
      const lines = text.split("\n");
      const container = new Container();
      const style: TextStyleOptions = {
        fontFamily: title_badge.font.face,
        fontSize: size,
        fill: title_badge.font.color,
        fontWeight: title_badge.font.weight as any,
        lineHeight: line_height,
      };

      let max_width = 0;

      for (let i = 0; i < lines.length; i++) {
        const line_text = lines[i];
        const line = new Container();
        const line_metrics = [];
        let line_width = 0;

        for (let word_text of line_text.split(" ")) {
          let accent = false;

          if (word_text.toLocaleLowerCase() === "boosty") {
            this.boosty_logo.width = line_height * 3.5;
            this.boosty_logo.height = line_height + 5;
            this.boosty_logo.y = -1;
            line_metrics.push({ width: this.boosty_logo.width, height: this.boosty_logo.height });
            line_width += this.boosty_logo.width + space_width;
            line.addChild(this.boosty_logo);
            continue;
          }

          if (word_text.startsWith("%")) {
            accent = true;
            word_text = word_text.slice(1);
          }
          const word = new Text({
            text: word_text,
            resolution: 2,
            style: {
              ...style,
              fill: accent ? title_badge.accent : title_badge.font.color,
            },
          });

          const metrics = CanvasTextMetrics.measureText(word_text, word.style);
          line_width += metrics.width + space_width;
          line_metrics.push(metrics);
          line.addChild(word);
        }

        line_width -= space_width;
        line.y = y + Math.floor((i - (lines.length - 1) / 2) * line_height - line_metrics[0].height / 2);
        max_width = Math.max(max_width, line_width);
        let cur_x = x - line_width / 2;

        for (let k = 0; k < line_metrics.length; k++) {
          const word = line.getChildAt(k);
          const metrics = line_metrics[k];
          word.x = cur_x;
          cur_x += metrics.width + space_width;
        }

        container.addChild(line);
      }

      return { text: container, max_width, height: lines.length * line_height };
    };

    const { text, max_width, height } = drawText(
      title_badge.text,
      title_badge.x,
      title_badge.y,
      title_badge.font.size,
      title_badge.font.line_height,
      title_badge.font.space_width,
    );

    let cur_w = title_badge.rect.w;
    let cur_h = title_badge.rect.h;
    if (max_width > cur_w - title_badge.rect.padding_x * 2) {
      cur_w = max_width + title_badge.rect.padding_x * 2;
    }
    if (height > cur_h - title_badge.rect.padding_y * 2) {
      cur_h = height + title_badge.rect.padding_y * 2;
    }

    const box = drawBox(title_badge.x - cur_w / 2, title_badge.y - cur_h / 2, cur_w, cur_h);

    this.title_badge_group.addChild(box, text);

    if (title_badge.footnote.enabled) {
      const { text: small_text } = drawText(
        title_badge.footnote.text,
        title_badge.x,
        title_badge.y + cur_h / 2 + title_badge.footnote.margin,
        title_badge.footnote.size,
        title_badge.footnote.size,
        title_badge.footnote.space_width,
      );
      this.title_badge_group.addChild(small_text);
    }
  }
}
