// type-tables.ts marks props declared in dependencies with this prefix, then
// drops them from the generated type tables.
export const INHERITED_PREFIX = '~inherited:';

// Shown in place of a type table with no own props, on pages and in Markdown.
export const NO_OWN_PROPS = 'This component adds no props of its own.';

export function isInheritedDeclaration(path: string | undefined) {
  return path?.includes('/node_modules/') ?? false;
}

export function ownEntries<T extends { name: string }>(entries: T[]): T[] {
  return entries.filter((entry) => !entry.name.startsWith(INHERITED_PREFIX));
}
