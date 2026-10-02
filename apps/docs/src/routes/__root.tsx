import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import { RootProvider } from 'fumadocs-ui/provider/tanstack';

import { StaticSearchDialog } from '#/components/search';
import appCss from '#/styles/app.css?url';

export const Route = createRootRoute({
  component: RootComponent,
  head: () => ({
    links: [{ href: appCss, rel: 'stylesheet' }],
    meta: [
      {
        // HTML requires the `utf-8` label.
        // oxlint-disable-next-line unicorn/text-encoding-identifier-case
        charSet: 'utf-8',
      },
      { content: 'width=device-width, initial-scale=1', name: 'viewport' },
      { title: 'oakoss/ui' },
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
          <Outlet />
        </RootProvider>
        <Scripts />
      </body>
    </html>
  );
}
