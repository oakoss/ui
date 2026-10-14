// A bar's fill width over its track's, once the fill's transition has
// finished; the parts are `<name>-indicator` and `<name>-track`.
export function fillRatio(name: string) {
  const fill = part(`${name}-indicator`);
  for (const animation of fill.getAnimations()) animation.finish();
  return (
    fill.getBoundingClientRect().width /
    part(`${name}-track`).getBoundingClientRect().width
  );
}

// A component part by its data-slot, under root.
export function part(slot: string, root: ParentNode = document) {
  const element = root.querySelector(`[data-slot=${CSS.escape(slot)}]`);
  if (!(element instanceof HTMLElement)) throw new Error(`No ${slot}`);
  return element;
}
