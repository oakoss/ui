// WCAG contrast between two CSS colors, in any syntax the browser parses.
export function contrast(first: string, second: string) {
  const [light = 0, dark = 0] = [luminance(first), luminance(second)].toSorted(
    (a, b) => b - a,
  );
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

function luminance(color: string) {
  const [r = 0, g = 0, b = 0] = rgb(color).map((channel) => {
    const value = channel / 255;
    return value <= 0.04 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Any CSS color as sRGB channels, through a canvas.
function rgb(color: string) {
  const context = document
    .createElement('canvas')
    .getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('No canvas');
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = context.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}
