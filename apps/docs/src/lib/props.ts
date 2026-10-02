// remarkAutoTypeTable cannot drop entries, so source.config.ts prefixes the
// names of props declared in dependencies and ownProps filters them out.
export const INHERITED_PREFIX = '~inherited:';

export function isInheritedDeclaration(path: string | undefined) {
  return path?.includes('/node_modules/') ?? false;
}

export function ownProps<T>(type: Record<string, T>): Record<string, T> {
  return Object.fromEntries(
    Object.entries(type).filter(([name]) => !name.startsWith(INHERITED_PREFIX)),
  );
}
