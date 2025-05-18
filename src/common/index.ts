export async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export function countAspectRatio(
  width: number,
  height: number,
  img_width: number,
  img_height: number,
): { x: number; y: number; w: number; h: number } {
  const aspect_ratio = img_width / img_height;

  if (aspect_ratio < width / height) {
    const h = Math.round(width / aspect_ratio);
    return {
      x: 0,
      y: Math.round((height - h) / 2),
      w: width,
      h: h,
    };
  } else {
    const w = Math.round(height * aspect_ratio);
    return {
      x: Math.round((width - w) / 2),
      y: 0,
      w: w,
      h: height,
    };
  }
}
