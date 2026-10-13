import { createFileRoute, notFound } from '@tanstack/react-router';

import { themeItemAt } from '#/lib/theme-items';

export const Route = createFileRoute('/r/themes/{$name}.json')({
  server: {
    handlers: {
      GET: ({ params }) => {
        const json = themeItemAt(`/r/themes/${params.name}.json`);
        if (json === undefined) throw notFound();
        return new Response(json, {
          headers: { 'Content-Type': 'application/json' },
        });
      },
    },
  },
});
