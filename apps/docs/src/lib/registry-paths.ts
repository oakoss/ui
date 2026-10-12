// shadcn's default alias directories.
const aliasDirectories: Record<string, string> = {
  components: 'components',
  hooks: 'hooks',
  lib: 'lib',
  ui: 'components/ui',
};

// Where a registry file lands in a project, from its `@alias/…` target.
export function targetPath(target: string): string {
  return target.replace(/^@(\w+)\//u, (match, alias: string) =>
    aliasDirectories[alias] === undefined
      ? match
      : `${aliasDirectories[alias]}/`,
  );
}
