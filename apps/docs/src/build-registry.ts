// Writes the hosted registry into the built site: /r/ from this tree and
// /v<version>/r/ from each release tag, every dependency rewritten into its
// own directory. Runs after `vite build`, outside its cache, since the tags
// aren't part of turbo's hash.
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  packageVersion,
  releasedVersions,
  releaseFile,
  releaseTags,
} from '#/lib/registry-release';
import { siteUrl } from '#/lib/site';

const docs = path.join(import.meta.dirname, '..');
const client = path.join(docs, 'dist/client');
const shadcn = path.join(docs, 'node_modules/.bin/shadcn');
const root = git(['rev-parse', '--show-toplevel']).trim();
const ui = path.join(root, 'packages/ui');
const version = packageVersion(
  readFileSync(path.join(ui, 'package.json'), 'utf-8'),
);
const versionTag = `v${version}`;

// Every release the changelog records needs its tag. The current one may not
// be pushed yet: a version PR's merge starts CI alongside oakum's release job,
// which tags it. REQUIRE_RELEASE_TAG=1 requires it too, for a build that
// ships the release.
const tags = releaseTags(git(['tag', '--list', 'v*']).split('\n'), version);
const released = releasedVersions(
  readFileSync(path.join(ui, 'CHANGELOG.md'), 'utf-8'),
).map((entry) => `v${entry}`);
const missing = releaseTags(released, version).filter(
  (tag) =>
    !tags.includes(tag) &&
    (tag !== versionTag || process.env.REQUIRE_RELEASE_TAG === '1'),
);
if (missing.length > 0) {
  throw new Error(
    `no ${missing.join(', ')} tag; fetch tags (actions/checkout's fetch-tags)`,
  );
}

const work = mkdtempSync(path.join(tmpdir(), 'oakoss-registry-'));
try {
  clean();
  build(root, 'r');
  for (const tag of tags) {
    const tree = path.join(work, tag);
    mkdirSync(tree);
    execFileSync('tar', ['-x', '-C', tree], {
      input: execFileSync('git', ['-C', root, 'archive', tag], {
        maxBuffer: 1024 ** 3,
      }),
    });
    build(tree, `${tag}/r`);
  }
} finally {
  rmSync(work, { force: true, recursive: true });
}

function build(tree: string, dir: string) {
  const built = path.join(work, `${dir.replaceAll('/', '-')}-built`);
  shadcnBuild(tree, built);
  // shadcn exits 0 for a registry with no items.
  if (!existsSync(path.join(built, 'base.json'))) {
    throw new Error(`shadcn build wrote no base item for /${dir}/`);
  }
  const out = path.join(client, dir);
  mkdirSync(out, { recursive: true });
  for (const file of readdirSync(built)) {
    const json: unknown = JSON.parse(
      readFileSync(path.join(built, file), 'utf-8'),
    );
    writeFileSync(
      path.join(out, file),
      JSON.stringify(releaseFile(json, `${siteUrl}/${dir}`)),
    );
  }
}

// /r/ also holds the theme panel's prerendered items, under /r/themes/.
function clean() {
  const entries = readdirSync(client, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && /^v\d+\.\d+\.\d+$/u.test(entry.name)) {
      rmSync(path.join(client, entry.name), { recursive: true });
    }
  }
  const items = path.join(client, 'r');
  for (const file of readdirSync(items)) {
    if (file.endsWith('.json')) rmSync(path.join(items, file));
  }
}

function git(args: string[]) {
  return execFileSync('git', args, { cwd: docs, encoding: 'utf-8' });
}

// shadcn splits an error across stdout and stderr, and prints a line per
// item on success, so its output shows only when it fails.
function shadcnBuild(tree: string, out: string) {
  try {
    execFileSync(shadcn, ['build', 'registry.json', '-c', tree, '-o', out], {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
  } catch (error) {
    if (error instanceof Error && 'stdout' in error) {
      process.stderr.write(`${String(error.stdout)}\n`);
    }
    throw error;
  }
}
