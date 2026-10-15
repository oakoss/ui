type CssItem = {
  css?: Record<string, unknown>;
  cssVars?: { theme?: Record<string, string | undefined> };
};

// An item's CSS as shadcn writes it into a stylesheet: custom variants at the
// top level, theme variables and rules such as keyframes in @theme inline.
export function itemCss(item: CssItem): string {
  const rules = Object.entries(item.css ?? {});
  const variants = rules
    .filter(([key]) => key.startsWith('@custom-variant '))
    .map(([key]) => `${key};`);
  const themed = [
    ...Object.entries(item.cssVars?.theme ?? {})
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `--${key}: ${String(value)};`),
    ...rules
      .filter(([key]) => !key.startsWith('@custom-variant '))
      .map(([key, value]) => cssRule(key, value)),
  ];
  const block =
    themed.length === 0
      ? []
      : [`@theme inline {\n${indent(themed.join('\n'))}\n}`];
  return [...variants, ...block].join('\n\n');
}

function cssRule(key: string, value: unknown): string {
  if (typeof value === 'string') return `${key}: ${value};`;
  const body = Object.entries(value ?? {}).map(([inner, innerValue]) =>
    cssRule(inner, innerValue),
  );
  return `${key} {\n${indent(body.join('\n'))}\n}`;
}

function indent(text: string): string {
  return text
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n');
}
