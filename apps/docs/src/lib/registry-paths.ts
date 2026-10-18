// shadcn's default alias directories.
const aliasDirectories: Record<string, string> = {
  components: 'components',
  hooks: 'hooks',
  lib: 'lib',
  ui: 'components/ui',
};

// A registry:file (themes.css) is copied as-is rather than shown as code in
// the Manual tab, and a module id ending in .css would reach Tailwind.
export function isShownAsSource(file: { type: string }): boolean {
  return file.type !== 'registry:file';
}

// Where a registry file lands in a project, from its `@alias/…` target.
export function targetPath(target: string): string {
  return target.replace(/^@(\w+)\//u, (match, alias: string) =>
    aliasDirectories[alias] === undefined
      ? match
      : `${aliasDirectories[alias]}/`,
  );
}
