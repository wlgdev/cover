import { GradientElement, ImageElement, RectElement, TextElement } from "./draw";

const WIDTH = 1280 as const;
const HEIGHT = 720 as const;

export type TemplateVideoParams = {
  background: {
    src: HTMLImageElement;
    x: number;
    y: number;
    w: number;
    h: number;
    blur: number;
    flip_h: boolean;
    flip_v: boolean;
  };
  gradient: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
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
  logo: {
    src: HTMLImageElement;
    x: number;
    y: number;
    w: number;
    h: number;
    blur: number;
  };
  title: {
    text: string;
    font: string;
    x: number;
    y: number;
    line_height: number;
    shadow: {
      value: number;
      color: string;
    };
  };
  description: {
    text: string;
    font: string;
    x: number;
    gap: number;
    line_height: number;
    shadow: {
      value: number;
      color: string;
    };
  };
  categories: {
    src: HTMLImageElement[];
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
  debug: boolean;
};

export async function renderVideoCanvas(
  canvas: HTMLCanvasElement,
  { background, gradient, logo, title, description, categories, debug }: TemplateVideoParams,
): Promise<HTMLCanvasElement> {
  if (!canvas) return canvas;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.imageSmoothingEnabled = true;
  ctx.textRendering = "geometricPrecision";

  const root = new ImageElement(ctx)
    .background(background.src, 0, background.blur)
    .coord([background.x, background.y])
    .size([background.w, background.h])
    .flip(background.flip_h, background.flip_v)
    .debug(debug);

  if (gradient.x2 > 0 && gradient.y2 > 0) {
    root.add(
      new GradientElement(ctx)
        .coord([gradient.x1, gradient.y1])
        .size([gradient.x2, gradient.y2])
        .gradient({ start: gradient.start, mid: gradient.mid, end: gradient.end }),
    );
  }

  root.add(new ImageElement(ctx).background(logo.src, 0, logo.blur).coord([logo.x, logo.y]).size([logo.w, logo.h]));

  const head = new TextElement(ctx)
    .coord([title.x, title.y])
    .text(title.text, title.font)
    .lineHeight(title.line_height)
    .shadow(title.shadow.color, title.shadow.value);

  const desc = new TextElement(ctx)
    .coord([description.x, head.measure()[1] + description.gap])
    .text(description.text, description.font)
    .lineHeight(description.line_height)
    .shadow(description.shadow.color, description.shadow.value);

  root.add(head).add(desc);

  let x = categories.x;
  for (const img of categories.src) {
    root.add(
      new ImageElement(ctx)
        .background(img, categories.round, categories.blur)
        .size([categories.w, categories.h])
        .coord([x, categories.y])
        .shadow(categories.shadow.color, categories.shadow.value),
    );
    x += categories.w + categories.margin;
  }

  root.render();
  return canvas;
}
