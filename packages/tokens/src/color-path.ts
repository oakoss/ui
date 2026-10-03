export type ColorPathParts = { name: string; step: string | undefined };

// `color.<neutral>` or `color.<scale>.<step>`; the step isn't checked here.
export function parseColorPath(path: string): ColorPathParts | undefined {
  const parts = path.split('.');
  const [prefix, name, step] = parts;
  if (prefix !== 'color' || name === undefined || parts.length > 3) {
    return undefined;
  }
  return { name, step };
}
