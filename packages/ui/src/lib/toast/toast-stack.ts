import type { ToastItem } from '#/lib/toast/toast-store';

export type ToastSlot = {
  // Behind the front toast in a collapsed stack: clipped to its height.
  isBehind: boolean;
  // Past the visible count: kept, but out of sight and reach.
  isHidden: boolean;
  // From the stack's edge, negative upward.
  offset: number;
  scale: number;
  z: number;
};

export const toastGap = 8;
const peek = 12;
const shrink = 0.05;

// Positions each toast: newest at the edge; collapsed, the next ones peek
// behind it, a little smaller; expanded, they follow one another. Past
// `visible` toasts, a toast waits hidden behind the stack.
export function stackToasts({
  heights,
  isExpanded,
  items,
  side,
  visible,
}: {
  heights: ReadonlyMap<number, number>;
  isExpanded: boolean;
  items: readonly ToastItem[];
  side: 'bottom' | 'top';
  visible: number;
}) {
  const shown = Math.max(1, visible);
  const sign = side === 'bottom' ? -1 : 1;
  const placed: { item: ToastItem; slot: ToastSlot }[] = [];
  let offset = 0;
  for (const [index, item] of items.entries()) {
    // By position, exiting toasts included: a toast past the visible count
    // moves up once the ones in front have gone, and stays hidden as it exits.
    const isHidden = index >= shown;
    const depth = Math.min(index, shown - 1);
    placed.push({
      item,
      slot: {
        isBehind: !isExpanded && index > 0,
        isHidden,
        offset: sign * (isExpanded ? offset : depth * peek),
        scale: isExpanded ? 1 : 1 - depth * shrink,
        z: items.length - index,
      },
    });
    if (!isHidden) offset += (heights.get(item.instance) ?? 0) + toastGap;
  }
  const front = items[0] ? (heights.get(items[0].instance) ?? 0) : 0;
  const peeking = Math.max(Math.min(items.length, shown) - 1, 0) * peek;
  return {
    frontHeight: front,
    height: isExpanded ? Math.max(offset - toastGap, 0) : front + peeking,
    placed,
  };
}
