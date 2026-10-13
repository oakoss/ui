export type PackageManager = { add: string; dlx: string; name: string };

// The storage key of the install tabs' choice, which Fumadocs persists.
export const packageManagerKey = 'package-manager';

export const packageManagers: PackageManager[] = [
  { add: 'npm install', dlx: 'npx', name: 'npm' },
  { add: 'pnpm add', dlx: 'pnpm dlx', name: 'pnpm' },
  { add: 'yarn add', dlx: 'yarn dlx', name: 'yarn' },
  { add: 'bun add', dlx: 'bunx --bun', name: 'bun' },
];
