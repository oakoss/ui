import type { Decorator } from '@storybook/react-vite';

import { createElement, Fragment, use, useEffect } from 'react';
import {
  TooltipTrigger,
  TooltipTriggerStateContext,
} from 'react-aria-components';

// React Aria's tooltips and hover cards share one page-wide warm-up, which
// cools down only after an open one is asked to close: a story that unmounts
// with one open, or disables its trigger, leaves the next story's tooltip
// opening at once. Asking a tooltip to close as each story mounts starts that
// cooldown, which `hoverFresh`'s wait outlasts.
function CloseOnMount() {
  const state = use(TooltipTriggerStateContext);
  useEffect(() => {
    state?.close(true);
  }, [state]);
  return null;
}

export const withTooltipCooldown: Decorator = (Story) =>
  createElement(
    Fragment,
    null,
    createElement(TooltipTrigger, null, createElement(CloseOnMount)),
    createElement(Story),
  );
