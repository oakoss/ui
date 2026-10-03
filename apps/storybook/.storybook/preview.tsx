import '../src/styles.css';

import type { Decorator, Preview } from '@storybook/react-vite';

import {
  type IconProps,
  type IconResolver,
  IconResolverContext,
} from '@oakoss/ui/components/icon-placeholder';
import * as lucide from 'lucide-react';
import { type ComponentType, type ReactNode, useEffect } from 'react';
import { I18nProvider, isRTL } from 'react-aria-components';

// Installs swap icons at `shadcn add` time; Storybook resolves them live.
const lucideIcons = new Map<string, unknown>(Object.entries(lucide));

function isIcon(value: unknown): value is ComponentType<IconProps> {
  return (
    typeof value === 'function' ||
    (typeof value === 'object' && value !== null && '$$typeof' in value)
  );
}

const resolveLucide: IconResolver = ({ lucide: name }, props) => {
  const Icon = lucideIcons.get(name);
  return isIcon(Icon) ? <Icon aria-hidden {...props} /> : undefined;
};

const withIcons: Decorator = (Story) => (
  <IconResolverContext value={resolveLucide}>
    <Story />
  </IconResolverContext>
);

function PalettedStory({
  canvasElement,
  children,
  family,
  primary,
}: {
  canvasElement: HTMLElement;
  children: ReactNode;
  family: string | undefined;
  primary: string | undefined;
}): ReactNode {
  useEffect(() => {
    const root = canvasElement.ownerDocument.documentElement;
    for (const [name, value] of [
      ['data-family', family],
      ['data-primary', primary],
    ] as const) {
      root.removeAttribute(name);
      if (value !== undefined) root.setAttribute(name, value);
    }
  }, [canvasElement, family, primary]);

  return children;
}

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

// Unset means the default theme from theme.css; themes.css holds the rest.
const withPalette: Decorator = (Story, context) => (
  <PalettedStory
    canvasElement={context.canvasElement}
    family={context.globals.family}
    primary={context.globals.primary}
  >
    <Story />
  </PalettedStory>
);

const withTheme: Decorator = (Story, context) => {
  // The test projects set VITE_STORY_THEME; a story's own theme global wins.
  const selected: string | undefined =
    context.globals.theme ?? import.meta.env.VITE_STORY_THEME;
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

// The root, so portaled overlays follow; but docs share one document across
// stories, where the last story's locale would win the whole page.
function LocalizedStory({
  canvasElement,
  children,
  inDocs,
  locale,
}: {
  canvasElement: HTMLElement;
  children: ReactNode;
  inDocs: boolean;
  locale: string;
}): ReactNode {
  const dir = isRTL(locale) ? 'rtl' : 'ltr';
  useEffect(() => {
    // Docs reset the root too: the preview keeps one document across views.
    const root = canvasElement.ownerDocument.documentElement;
    root.setAttribute('lang', inDocs ? 'en-US' : locale);
    root.setAttribute('dir', inDocs ? 'ltr' : dir);
  }, [canvasElement, dir, inDocs, locale]);

  return (
    <I18nProvider locale={locale}>
      {inDocs ? (
        <div dir={dir} lang={locale}>
          {children}
        </div>
      ) : (
        children
      )}
    </I18nProvider>
  );
}

const withLocale: Decorator = (Story, context) => {
  const locale: string = context.globals.locale ?? 'en-US';
  return (
    <LocalizedStory
      canvasElement={context.canvasElement}
      inDocs={context.viewMode === 'docs'}
      locale={locale}
    >
      <Story />
    </LocalizedStory>
  );
};

const preview: Preview = {
  decorators: [withTheme, withPalette, withLocale, withIcons],
  globalTypes: {
    family: {
      description: 'Gray family',
      toolbar: {
        dynamicTitle: true,
        icon: 'paintbrush',
        items: [
          { title: 'Default family', value: undefined },
          ...[
            'mauve',
            'mist',
            'neutral',
            'olive',
            'stone',
            'taupe',
            'zinc',
          ].map((value) => ({ title: value, value })),
        ],
      },
    },
    locale: {
      description: 'Locale and text direction',
      toolbar: {
        dynamicTitle: true,
        icon: 'globe',
        items: [
          { title: 'English (LTR)', value: 'en-US' },
          { title: 'Arabic (RTL)', value: 'ar-EG' },
        ],
      },
    },
    primary: {
      description: 'Primary color',
      toolbar: {
        dynamicTitle: true,
        icon: 'circle',
        items: [
          { title: 'Default primary', value: undefined },
          ...[
            'amber',
            'blue',
            'cyan',
            'emerald',
            'fuchsia',
            'green',
            'indigo',
            'lime',
            'orange',
            'pink',
            'purple',
            'red',
            'rose',
            'sky',
            'teal',
            'violet',
            'yellow',
          ].map((value) => ({ title: value, value })),
        ],
      },
    },
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
    a11y: { test: 'error' },
    controls: {
      matchers: { color: /(?:background|color)$/iu, date: /Date$/iu },
    },
  },
  tags: ['autodocs'],
};

export default preview;
