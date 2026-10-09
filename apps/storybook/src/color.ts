// WCAG contrast of the first color drawn over the second, drawn over the
// page, in any syntax the browser parses. Translucent colors are blended as
// painted, so a transparent fill measures as the color beneath it.
export function contrast(top: string, bottom: string) {
  const context = canvas();
  for (const color of ['white', page(), bottom]) paint(context, color);
  const under = luminance(pixel(context));
  paint(context, top);
  const over = luminance(pixel(context));
  const [light = 0, dark = 0] = [over, under].toSorted((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

// A CSS variable's color as the browser computes it, such as an rgb() string.
export function tokenColor(variable: string, root: Element = document.body) {
  const probe = document.createElement('span');
  probe.style.color = `var(${variable})`;
  root.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

function canvas() {
  const context = document
    .createElement('canvas')
    .getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('No canvas');
  return context;
}

function luminance([r = 0, g = 0, b = 0]: Uint8ClampedArray) {
  const [red = 0, green = 0, blue = 0] = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.04 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function page() {
  return getComputedStyle(document.body).backgroundColor;
}

function paint(context: CanvasRenderingContext2D, color: string) {
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
}

function pixel(context: CanvasRenderingContext2D) {
  return context.getImageData(0, 0, 1, 1).data;
}
