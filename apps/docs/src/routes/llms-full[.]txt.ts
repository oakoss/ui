import { createFileRoute } from '@tanstack/react-router';

import { agentInstructions } from '#/lib/llms';
import { docsLlms } from '#/lib/source';

export const Route = createFileRoute('/llms-full.txt')({
  server: {
    handlers: {
      GET: async () =>
        new Response(`${agentInstructions}\n\n${await docsLlms.full()}`),
    },
  },
});
