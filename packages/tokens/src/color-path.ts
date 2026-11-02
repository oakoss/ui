export type ColorPathParts = { name: string; step: string | undefined };

// A palette color as Tailwind names it: `zinc-950`, or `white` for a neutral.
export function colorPathLabel(path: string): string {
  const parsed = parseColorPath(path);
  if (parsed === undefined) return path;
  return parsed.step === undefined
    ? parsed.name
    : `${parsed.name}-${parsed.step}`;
}

// `color.<neutral>` or `color.<scale>.<step>`; the step isn't checked here.
export function parseColorPath(path: string): ColorPathParts | undefined {
  const parts = path.split('.');
  const [prefix, name, step] = parts;
  if (prefix !== 'color' || name === undefined || parts.length > 3) {
    return undefined;
  }
  return { name, step };
}
