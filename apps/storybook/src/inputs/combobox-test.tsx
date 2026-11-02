import { use, useEffect, useRef } from 'react';
import { ComboBoxStateContext } from 'react-aria-components';
import { screen } from 'storybook/test';

// Returns the open list and its popover with the popover's entry finished.
export async function openedList() {
  const list = await screen.findByRole('listbox');
  const popover = list.closest<HTMLElement>('[data-slot=combobox-content]');
  if (!popover) throw new Error('No popover');
  for (const animation of popover.getAnimations()) animation.finish();
  return { list, popover };
}

// Opens the list on mount without input, since ComboBox has no defaultOpen.
// 'manual' shows every option, as the trigger does; 'input' shows those the
// input's text matches. Render it inside the ComboBox, such as in `end`.
export function OpenList({
  trigger = 'manual',
}: {
  trigger?: 'input' | 'manual';
}) {
  const state = use(ComboBoxStateContext);
  const openedRef = useRef(false);
  useEffect(() => {
    if (state === null || openedRef.current) return;
    // Without allowsEmptyCollection, open() does nothing until the collection
    // has items, so it retries on each render until the list is open.
    if (state.isOpen) openedRef.current = true;
    else state.open(null, trigger);
  }, [state, trigger]);
  return null;
}
