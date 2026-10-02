import { createFileRoute } from '@tanstack/react-router';
import { createFromSource } from 'fumadocs-core/search/server';

import { source } from '#/lib/source';

const server = createFromSource(source, { language: 'english' });

// Prerendered as a static index that the browser searches with staticClient.
export const Route = createFileRoute('/api/search')({
  server: { handlers: { GET: () => server.staticGET() } },
});
