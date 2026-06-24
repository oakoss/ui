import '../src/styles/globals.css';

import type { Decorator, Preview } from '@storybook/react-vite';

import { type ReactNode, useEffect } from 'react';

function ThemedStory({
  canvasElement,
  children,
  isDark,
}: {
  canvasElement: HTMLElement;
  children: ReactNode;
  isDark: boolean;
}): ReactNode {
  useEffect(() => {
    // Apply the theme at the document root so portaled overlays (dialogs,
    // popovers, tooltips) are themed too — works in the canvas and in autodocs.
    const root = canvasElement.ownerDocument.documentElement;
    root.classList.toggle('dark', isDark);
  }, [canvasElement, isDark]);

  return children;
}

const withTheme: Decorator = (Story, context) => {
  const selected: string | undefined = context.globals.theme;
  // Docs defaults to dark, the canvas to light; the toolbar overrides both.
  const isDark =
    selected === 'dark' ||
    (selected !== 'light' && context.viewMode === 'docs');

  return (
    <ThemedStory canvasElement={context.canvasElement} isDark={isDark}>
      <Story />
    </ThemedStory>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Theme',
      toolbar: {
        dynamicTitle: true,
        icon: 'circlehollow',
        items: [
          { title: 'Light', value: 'light' },
          { title: 'Dark', value: 'dark' },
        ],
      },
    },
  },
  parameters: {
    a11y: { test: 'todo' },
    controls: {
      matchers: { color: /(?:background|color)$/iu, date: /Date$/iu },
    },
  },
  tags: ['autodocs'],
};

export default preview;
