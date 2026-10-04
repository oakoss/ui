import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import { RootProvider } from 'fumadocs-ui/provider/tanstack';

import { IconProvider } from '#/components/icon-resolver';
import { StaticSearchDialog } from '#/components/search';
import { appName } from '#/lib/site';
import appCss from '#/styles/app.css?url';

export const Route = createRootRoute({
  component: RootComponent,
  head: () => ({
    links: [
      { href: appCss, rel: 'stylesheet' },
      { href: '/favicon.ico', rel: 'icon', sizes: '32x32' },
      { href: '/favicon.svg', rel: 'icon', type: 'image/svg+xml' },
      { href: '/apple-touch-icon.png', rel: 'apple-touch-icon' },
    ],
    meta: [
      { charSet: 'utf-8' },
      { content: 'width=device-width, initial-scale=1', name: 'viewport' },
      { title: appName },
    ],
  }),
});

function RootComponent() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-screen flex-col">
        <RootProvider search={{ SearchDialog: StaticSearchDialog }}>
          <IconProvider>
            <Outlet />
          </IconProvider>
        </RootProvider>
        <Scripts />
      </body>
    </html>
  );
}
