export type Coord = [number, number];

export abstract class Renderable {
  public ctx?: CanvasRenderingContext2D;
  public _coord: Coord = [0, 0];
  public _size: Coord = [100, 100];
  public _z = 10;
  public _direction?: Coord;
  public _gradient?: [number, string][];
  public _debug = false;

  public children: Renderable[] = [];

  abstract render(): void;

  z(z: number): this {
    this._z = z;
    return this;
  }

  size(size: Coord): this {
    this._size = size;
    return this;
  }

  coord(coord: Coord): this {
    this._coord = coord;
    return this;
  }

  add(child: Renderable): this {
    child.debug(this._debug);
    this.children.push(child);
    return this;
  }

  debug(value: boolean): this {
    this._debug = value;
    return this;
  }

  cross(color: string, [x, y]: Coord, tag?: string, tag_position: "BOTTOM" | "TOP" = "BOTTOM") {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + 10);
    this.ctx.lineTo(x, y - 10);
    this.ctx.stroke();
    this.ctx.moveTo(x + 10, y);
    this.ctx.lineTo(x - 10, y);
    this.ctx.stroke();
    this.ctx.closePath();

    this.ctx.fillStyle = color;
    this.ctx.font = "10px monospace";
    this.ctx.fillText(`[${x}, ${y}]${tag ? " " + tag : ""}`, x + 5, y + (tag_position === "TOP" ? -0.5 : 1) * 13);
    this.ctx.restore();
  }
}

export class GradientElement extends Renderable {
  constructor(public ctx: CanvasRenderingContext2D) {
    super();
  }

  gradient(gradient: Record<string, { value: number; color: string }>): this {
    this._gradient = Object.values(gradient).map(({ value, color }) => [value, color]);
    return this;
  }

  render(): this {
    this.children.sort((a, b) => a._z - b._z);

    if (this._gradient) {
      const gradient = this.ctx.createLinearGradient(this._coord[0], this._coord[1], this._size[0], 0);
      const intermediate_steps = 10;

      for (let i = 0; i < this._gradient.length - 1; i++) {
        const [start_pos, start_color] = this._gradient[i];
        const [end_pos, end_color] = this._gradient[i + 1];

        for (let j = 0; j <= intermediate_steps; j++) {
          const t = j / intermediate_steps;
          const pos = start_pos + (end_pos - start_pos) * t;
          const color = this.interpolateColorWithAlpha(start_color, end_color, t);
          gradient.addColorStop(pos, color);
        }
      }
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(this._coord[0], this._coord[1], this._size[0], this._size[1]);

      if (this._debug) {
        for (const [pos, color] of this._gradient) {
          this.cross(
            "#1CD3A2",
            [Math.round(this._coord[0] + pos * (this._size[0] - this._coord[0])), (this._size[1] - this._coord[1]) / 2],
            `gradient ${color}`,
          );
        }
      }
    }

    this.children.forEach((child) => child.render());
    return this;
  }

  private interpolateColorWithAlpha(color1: string, color2: string, t: number): string {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    const a1 = color1.length > 7 ? parseInt(color1.slice(7, 9), 16) / 255 : 1;

    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    const a2 = color2.length > 7 ? parseInt(color2.slice(7, 9), 16) / 255 : 1;

    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    const a = a1 + (a2 - a1) * t;

    return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
  }
}

export class RectElement extends Renderable {
  private _color = "white";
  private _rounded = 0;
  // private _shadow = 0;
  private _blur = 0;

  constructor(public ctx: CanvasRenderingContext2D) {
    super();
  }

  background(color: string, rounded = 0, blur = 0): this {
    this._color = color;
    this._rounded = rounded;
    this._blur = blur;
    return this;
  }

  render(): this {
    this.children.sort((a, b) => a._z - b._z);

    if (this._blur > 0) {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = this._size[0];
      tempCanvas.height = this._size[1];
      const tempCtx = tempCanvas.getContext("2d");

      if (tempCtx) {
        tempCtx.drawImage(
          this.ctx.canvas,
          this._coord[0],
          this._coord[1],
          this._size[0],
          this._size[1],
          0,
          0,
          this._size[0],
          this._size[1],
        );

        this.ctx.filter = `blur(${this._blur}px)`;
        this.ctx.drawImage(tempCanvas, this._coord[0], this._coord[1]);
        this.ctx.filter = "none";
      }
    }

    this.ctx.fillStyle = this._color;
    if (this._rounded > 0) {
      this.ctx.save();
      this.roundedBox(this._coord[0], this._coord[1], this._size[0], this._size[1], this._rounded);
      this.ctx.fill();
      this.ctx.restore();
    } else {
      this.ctx.fillRect(this._coord[0], this._coord[1], this._size[0], this._size[1]);
    }

    this.children.forEach((child) => child.render());
    return this;
  }

  private roundedBox(x: number, y: number, w: number, h: number, radius: number) {
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, w, h, radius);
    this.ctx.closePath();
    this.ctx.clip();
  }
}

export class ImageElement extends Renderable {
  private _background?: HTMLImageElement;
  private _rounded = 0;
  private _blur = 0;
  private _shadowcolor = "black";
  private _shadowval = 0;

  private _flip_horizontal = false;
  private _flip_vertical = false;

  constructor(public ctx: CanvasRenderingContext2D) {
    super();
  }

  background(bg: HTMLImageElement, rounded = 0, blur = 0.3): this {
    this._background = bg;
    this._rounded = rounded;
    this._blur = blur;
    return this;
  }

  shadow(color: string, value: number): this {
    this._shadowcolor = color;
    this._shadowval = value;
    return this;
  }

  flip(horizontal = false, vertical = false): this {
    this._flip_horizontal = horizontal;
    this._flip_vertical = vertical;
    return this;
  }

  render(): this {
    this.children.sort((a, b) => a._z - b._z);

    this.ctx.save();

    if (this._background) {
      if (this._shadowval > 0) {
        this.ctx.save();
        this.roundedBox(
          this._coord[0] + 5,
          this._coord[1] + 5,
          this._size[0] - 10,
          this._size[1] - 10,
          this._rounded,
          true,
        );
        this.ctx.restore();
      }

      if (this._rounded > 0) {
        this.roundedBox(this._coord[0], this._coord[1], this._size[0], this._size[1], this._rounded);
      }

      if (this._flip_horizontal) {
        this.ctx.scale(-1, 1);
      }
      if (this._flip_vertical) {
        this.ctx.scale(1, -1);
      }

      const x = this._flip_horizontal ? -this._coord[0] - this._size[0] : this._coord[0];
      const y = this._flip_vertical ? -this._coord[1] - this._size[1] : this._coord[1];

      this.ctx.filter = `blur(${this._blur}px)`;
      this.ctx.drawImage(this._background, x, y, this._size[0], this._size[1]);
      this.ctx.filter = "none";

      if (this._rounded > 0) {
      }
    }
    this.ctx.restore();

    if (this._debug) {
      this.cross("#FF4D00", this._coord, "coord");
      this.cross("#44FF44", [this._coord[0] + this._size[0], this._coord[1] + this._size[1]], "size");
    }

    this.children.forEach((child) => child.render());
    return this;
  }

  private roundedBox(x: number, y: number, w: number, h: number, radius: number, shadow = false) {
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, w, h, radius);
    this.ctx.closePath();

    if (shadow) {
      this.ctx.shadowColor = this._shadowcolor;
      this.ctx.shadowBlur = this._shadowval;
      this.ctx.fillStyle = "none";
      this.ctx.fill();
    }
    this.ctx.clip();
  }
}

export class TextElement extends Renderable {
  private _text: string[] = [""];
  private _style = "600 50px sans-serif";
  private _color = "white";
  private _line_height = 60;
  private _shadow = 0;
  private _shadow_color = "black";

  constructor(public ctx: CanvasRenderingContext2D) {
    super();
  }

  text(text: string, style = "600 50px sans-serif", color = "white", line_height?: number): this {
    this._text = text.split("\n");
    this._color = color;
    this._style = style;

    if (line_height) {
      this._line_height = line_height;
    } else {
      this._line_height = parseInt(style.split(" ")[1].replace("px", ""));
    }

    return this;
  }

  shadow(color: string, value: number): this {
    this._shadow = value;
    this._shadow_color = color;
    return this;
  }

  lineHeight(value: number): this {
    this._line_height = value;
    return this;
  }

  render(): this {
    this.children.sort((a, b) => a._z - b._z);

    if (this._debug) {
      this.cross("#ffff00", this.measure(), this._text.join(" "));
    }

    this.ctx.font = this._style;
    this.ctx.fillStyle = this._color;

    if (this._shadow > 0) {
      this.ctx.save();
      this.ctx.shadowBlur = this._shadow;
      this.ctx.shadowColor = this._shadow_color;
    }

    for (const line of this._text) {
      if (this._debug) {
        this.cross("#00ffff", this._coord, line);
        const m = this.ctx.measureText(line);
        this.cross("#00ffff", [this._coord[0], this._coord[1] - m.actualBoundingBoxAscent], line, "TOP");
      }
      this.ctx.filter = "none";
      this.ctx.fillText(line, this._coord[0], this._coord[1]);

      this._coord[1] += this._line_height;
    }

    this._coord[1] -= this._line_height;

    if (this._shadow > 0) {
      this.ctx.restore();
    }

    this.children.forEach((child) => child.render());
    return this;
  }

  measure(): Coord {
    this.ctx.font = this._style;
    let max_y = 0;
    let max_x = 0;
    let min_y = 0;
    for (const line of this._text) {
      const m = this.ctx.measureText(line);
      max_x = Math.max(max_x, this._coord[0] + m.width);
    }

    return [Math.round(max_x), this._coord[1] + this._line_height * (this._text.length - 1)];
  }
}

export class Badge extends Renderable {
  private _text = "";
  private _font = "500 35px Jost";
  private _bg_color = "white";

  constructor(public ctx: CanvasRenderingContext2D) {
    super();
  }

  text(text: string): this {
    this._text = text;
    return this;
  }

  font(font: string): this {
    this._font = font;
    return this;
  }

  background(color: string): this {
    this._bg_color = color;
    return this;
  }

  measure(): Coord {
    const badge_text = new TextElement(this.ctx)
      .coord([this._coord[0] + 20, this._coord[1] + 50])
      .lineHeight(60)
      .text(this._text, this._font);

    return [badge_text.measure()[0] + 40, 75];
  }

  render(): this {
    const badge_text = new TextElement(this.ctx)
      .coord([this._coord[0] + 20, this._coord[1] + 50])
      .lineHeight(60)
      .text(this._text, this._font);
    const badge = new RectElement(this.ctx)
      .background(this._bg_color, 14, 7)
      .coord(this._coord)
      .size([badge_text.measure()[0] + 40, 75]);

    badge.add(badge_text).render();
    return this;
  }
}

export class BadgeStack extends Renderable {
  private _elements: Badge[][] = [];
  private _padding: Coord = [20, 20];

  constructor(public ctx: CanvasRenderingContext2D) {
    super();
  }

  elements(els: Badge[][]): this {
    this._elements = els;
    return this;
  }

  padding(padding: Coord): this {
    this._padding = padding;
    return this;
  }

  measure(): Coord {
    let max_width = 0;
    let max_height = 0;
    let x = this._coord[0];
    let y = this._coord[1];

    for (const line of this._elements) {
      let badge_height = 0;
      x = this._coord[0];
      for (const badge of line) {
        x += badge.measure()[0] + this._padding[0];
        badge_height = Math.max(badge_height, badge.measure()[1]);
        max_width = Math.max(max_width, x - this._coord[0]);
      }
      y += badge_height + this._padding[1];
      max_height = Math.max(max_height, y - this._coord[1]);
    }

    return [max_width, max_height];
  }

  render(): this {
    let x = this._coord[0];
    let y = this._coord[1];

    for (const line of this._elements) {
      let badge_height = 0;
      x = this._coord[0];
      for (const badge of line) {
        badge.coord([x, y]).render();
        x += badge.measure()[0] + this._padding[0];
        badge_height = Math.max(badge_height, badge.measure()[1]);
      }
      y += badge_height + this._padding[1];
    }

    return this;
  }
}
