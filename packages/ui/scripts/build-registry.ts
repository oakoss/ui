/**
 * Build Registry Script
 *
 * Builds shadcn-compatible registry JSON files from source components.
 * Outputs to public/r/ directory with flat structure and prefixed names.
 *
 * Usage: pnpm build
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT_DIR = path.resolve(import.meta.dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public', 'r');
const STARTERS_DIR = path.join(ROOT_DIR, 'starters');

interface RegistryFile {
  path: string;
  type:
    | 'registry:ui'
    | 'registry:lib'
    | 'registry:component'
    | 'registry:hook'
    | 'registry:style';
  content: string;
  target?: string;
}

interface RegistryItem {
  $schema: string;
  name: string;
  type: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  files: RegistryFile[];
  cssVars?: {
    theme?: Record<string, string>;
    light?: Record<string, string>;
    dark?: Record<string, string>;
  };
  css?: Record<string, unknown>;
}

interface SourceRegistryItem {
  name: string;
  type: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  files: Array<{
    path: string;
    type: RegistryFile['type'];
    target?: string;
  }>;
  cssVars?: RegistryItem['cssVars'];
  css?: RegistryItem['css'];
}

interface SourceRegistry {
  $schema: string;
  name: string;
  homepage?: string;
  items: SourceRegistryItem[];
}

/**
 * Read file content and return as string
 */
function readFileContent(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Transform import paths for registry output.
 * Converts internal paths like '@/starters/...' to user-facing paths like '@/lib/utils'
 */
function transformImports(content: string, _starter: string): string {
  // Transform @/starters/react-aria-tailwind/src/lib/* to @/lib/*
  content = content.replace(
    /@\/starters\/react-aria-tailwind\/src\/lib\//g,
    '@/lib/',
  );

  // Transform @/starters/react-aria-css/src/lib/* to @/lib/*
  content = content.replace(
    /@\/starters\/react-aria-css\/src\/lib\//g,
    '@/lib/',
  );

  // Transform @/starters/*/src/components/ui/* to @/components/ui/*
  content = content.replace(
    /@\/starters\/[^/]+\/src\/components\/ui\//g,
    '@/components/ui/',
  );

  return content;
}

/**
 * Inline CSS imports by reading referenced CSS files and embedding their content
 */
function inlineCssImports(
  content: string,
  basePath: string,
  _starter: string,
): string {
  // Match CSS import statements like: import './Button.css';
  const cssImportRegex = /import\s+['"]\.\/([^'"]+\.css)['"]\s*;?\n?/g;

  return content.replace(cssImportRegex, (match, cssFileName) => {
    const cssPath = path.join(path.dirname(basePath), cssFileName);
    if (fs.existsSync(cssPath)) {
      // Remove CSS imports from the component - CSS will be included separately
      return '';
    }
    return match;
  });
}

/**
 * Build a single registry item
 */
function buildRegistryItem(
  item: SourceRegistryItem,
  starter: string,
): RegistryItem {
  const starterDir = path.join(STARTERS_DIR, starter, 'src');

  const files: RegistryFile[] = item.files.map((file) => {
    const filePath = path.join(starterDir, file.path);
    let content = readFileContent(filePath);

    // Transform imports and inline CSS for TypeScript/JavaScript files
    if (file.path.endsWith('.tsx') || file.path.endsWith('.ts')) {
      content = transformImports(content, starter);
      content = inlineCssImports(content, filePath, starter);
    }

    return {
      path: file.path,
      type: file.type,
      content,
      ...(file.target && { target: file.target }),
    };
  });

  return {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: item.name,
    type: item.type,
    ...(item.title && { title: item.title }),
    ...(item.description && { description: item.description }),
    ...(item.dependencies && { dependencies: item.dependencies }),
    ...(item.devDependencies && { devDependencies: item.devDependencies }),
    ...(item.registryDependencies && {
      registryDependencies: item.registryDependencies,
    }),
    files,
    ...(item.cssVars && { cssVars: item.cssVars }),
    ...(item.css && { css: item.css }),
  };
}

/**
 * Process a starter registry
 */
function processStarter(starter: string): void {
  const registryPath = path.join(STARTERS_DIR, starter, 'registry.json');

  if (!fs.existsSync(registryPath)) {
    console.log(`Skipping ${starter}: no registry.json found`);
    return;
  }

  const registry: SourceRegistry = JSON.parse(readFileContent(registryPath));
  console.log(`Processing ${starter} with ${registry.items.length} items...`);

  for (const item of registry.items) {
    const outputName = `${starter}-${item.name}.json`;
    const outputPath = path.join(PUBLIC_DIR, outputName);

    const registryItem = buildRegistryItem(item, starter);
    // Override name with prefixed version
    registryItem.name = `${starter}-${item.name}`;

    fs.writeFileSync(outputPath, JSON.stringify(registryItem, null, 2));
    console.log(`  Built: ${outputName}`);
  }
}

/**
 * Build the main registry index
 */
function buildRegistryIndex(): void {
  const starters = fs.readdirSync(STARTERS_DIR).filter((dir) => {
    const registryPath = path.join(STARTERS_DIR, dir, 'registry.json');
    return (
      fs.statSync(path.join(STARTERS_DIR, dir)).isDirectory() &&
      fs.existsSync(registryPath)
    );
  });

  interface IndexItem {
    name: string;
    type: string;
    title?: string;
    description?: string;
  }

  const items: IndexItem[] = [];

  for (const starter of starters) {
    const registryPath = path.join(STARTERS_DIR, starter, 'registry.json');
    const registry: SourceRegistry = JSON.parse(readFileContent(registryPath));

    for (const item of registry.items) {
      items.push({
        name: `${starter}-${item.name}`,
        type: item.type,
        ...(item.title && { title: item.title }),
        ...(item.description && { description: item.description }),
      });
    }
  }

  const index = {
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: '@oakoss/ui',
    homepage: 'https://github.com/oakoss/ui',
    items,
  };

  const outputPath = path.join(PUBLIC_DIR, 'registry.json');
  fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));
  console.log(`Built: registry.json with ${items.length} items`);
}

/**
 * Main build function
 */
function main(): void {
  console.log('Building registry...\n');

  // Ensure output directory exists
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  // Process each starter
  const starters = fs.readdirSync(STARTERS_DIR).filter((dir) => {
    return fs.statSync(path.join(STARTERS_DIR, dir)).isDirectory();
  });

  for (const starter of starters) {
    processStarter(starter);
  }

  // Build main registry index
  buildRegistryIndex();

  console.log('\nRegistry build complete!');
}

main();
