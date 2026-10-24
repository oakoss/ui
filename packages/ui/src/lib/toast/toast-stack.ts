import type { ToastItem } from '#/lib/toast/toast-store';

import { visibleCount } from '#/lib/toast/toast-content';

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
export const toastPeek = 12;
// Room above and below the stack: the toasts' bottom-4 or top-4 offset, and
// as much on the far side.
export const toasterInset = 32;
const shrink = 0.05;

// Positions each toast: newest at the edge; collapsed, the next ones peek
// behind it, a little smaller; expanded, they follow one another. Past
// `visible` toasts, a toast waits hidden behind the stack. A closing toast
// keeps its place but takes no room: the ones behind it move up as it fades,
// and the stack stays tall enough to show it.
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
  const shown = visibleCount(visible);
  const sign = side === 'bottom' ? -1 : 1;
  const heightOf = (item: ToastItem) => heights.get(item.instance) ?? 0;
  const first = items.find((item) => !item.isExiting) ?? items[0];
  const front = first ? heightOf(first) : 0;
  const placed: { item: ToastItem; slot: ToastSlot }[] = [];
  let ahead = 0;
  let offset = 0;
  let reach = 0;
  for (const [index, item] of items.entries()) {
    // An open toast shows once fewer than `visible` open ones are ahead of
    // it; a closing toast keeps where it stood, so a hidden one exits hidden.
    const isHidden = (item.isExiting ? index : ahead) >= shown;
    const depth = Math.min(ahead, shown - 1);
    const isBehind = !isExpanded && ahead > 0;
    const start = isExpanded ? offset : depth * toastPeek;
    placed.push({
      item,
      slot: {
        isBehind,
        isHidden,
        offset: sign * start,
        scale: isExpanded ? 1 : 1 - depth * shrink,
        z: items.length - index,
      },
    });
    if (isHidden) continue;
    reach = Math.max(reach, start + (isBehind ? front : heightOf(item)));
    if (item.isExiting) continue;
    ahead += 1;
    offset += heightOf(item) + toastGap;
  }
  return { frontHeight: front, height: reach, placed };
}
