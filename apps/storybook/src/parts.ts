// A component part by its data-slot, under root.
export function part(slot: string, root: ParentNode = document) {
  const element = root.querySelector(`[data-slot=${CSS.escape(slot)}]`);
  if (!(element instanceof HTMLElement)) throw new Error(`No ${slot}`);
  return element;
}
