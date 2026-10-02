import { createFileRoute } from '@tanstack/react-router';

import { NotFound } from '#/components/not-found';

// Prerendered to 404.html, which the host serves for unknown URLs.
export const Route = createFileRoute('/404')({ component: NotFound });
