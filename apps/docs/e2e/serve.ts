// Serves dist/client the way the static host does: a path resolves to the
// file, then to its index.html, and anything else gets 404.html with a 404.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';

const root = path.join(import.meta.dirname, '../dist/client');
const port = Number(process.env.PORT ?? 4320);

const types: Record<string, string> = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.md': 'text/markdown',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
};

function resolve(urlPath: string): null | string {
  const file = path.join(root, decodeURIComponent(urlPath));
  const relative = path.relative(root, file);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  for (const candidate of [file, path.join(file, 'index.html')]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

createServer((request, response) => {
  const urlPath = new URL(request.url ?? '/', 'http://localhost').pathname;
  const file = resolve(urlPath);
  const served = file ?? path.join(root, '404.html');
  response.writeHead(file === null ? 404 : 200, {
    'Content-Type': types[path.extname(served)] ?? 'application/octet-stream',
  });
  response.end(readFileSync(served));
}).listen(port);
