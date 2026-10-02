// remarkAutoTypeTable cannot drop entries, so source.config.ts prefixes the
// names of props declared in dependencies and OwnPropsTable filters them out.
export const INHERITED_PREFIX = '~inherited:';

export function isInheritedDeclaration(path: string | undefined) {
  return path?.includes('/node_modules/') ?? false;
}
