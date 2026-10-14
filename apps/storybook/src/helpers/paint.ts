// The color covering most of an element as painted on screen, as "r,g,b".
// Computed styles can't show what forced colors paint, such as the backplate
// they draw behind text. It screenshots through Vitest's browser mode, which
// it loads on call, since that module throws outside a Vitest run.
export async function paintedColor(element: Element) {
  let browser;
  try {
    browser = await import('vitest/browser');
  } catch {
    throw new Error('paintedColor runs only in the Vitest browser run');
  }
  const shot = await browser.page
    .elementLocator(element)
    .screenshot({ base64: true, save: false });
  const base64 = typeof shot === 'string' ? shot : shot.base64;
  const image = new Image();
  image.src = `data:image/png;base64,${base64}`;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('No canvas');
  context.drawImage(image, 0, 0);
  const { data } = context.getImageData(0, 0, image.width, image.height);
  const counts = new Map<string, number>();
  for (let index = 0; index < data.length; index += 4) {
    const color = `${data[index]},${data[index + 1]},${data[index + 2]}`;
    counts.set(color, (counts.get(color) ?? 0) + 1);
  }
  const [top] = [...counts].toSorted((a, b) => b[1] - a[1]);
  if (!top) throw new Error('Nothing painted');
  return top[0];
}
