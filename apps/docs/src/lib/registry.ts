import registry from '@oakoss/ui/registry.json';

import { githubUrl } from '#/lib/site';

// Server-only: the registry carries the whole theme, too big for the client.
export function itemSourceUrl(name: string) {
  const item = registry.items.find((candidate) => candidate.name === name);
  const file = item?.files?.find(({ type }) => type === 'registry:ui');
  if (file === undefined) throw new Error(`no component file for "${name}"`);
  return `${githubUrl}/blob/main/packages/ui/${file.path}`;
}
