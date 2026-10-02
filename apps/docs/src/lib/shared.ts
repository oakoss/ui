import { createGetUrl } from 'fumadocs-core/source';

export const appName = 'oakoss/ui';
export const docsRoute = '/docs';

export const gitConfig = {
  branch: 'main',
  contentDir: 'apps/docs/content/docs',
  repo: 'ui',
  user: 'oakoss',
};

const getDocsUrl = createGetUrl(docsRoute);

/**
@returns page slugs
*/
export function decodeMarkdownUrl(segments: string[]) {
  if (segments.length === 0) return [];

  const out = segments.map((segment, i) =>
    i === segments.length - 1 ? segment.replace(/\.md$/u, '') : segment,
  );
  if (out.length === 1 && out[0] === 'index') out.pop();
  return out;
}

export function getPageMarkdownUrl(page: { locale?: string; slugs: string[] }) {
  const segments = [...page.slugs];
  if (segments.length === 0) {
    segments.push('index.md');
  } else {
    segments[segments.length - 1] += '.md';
  }

  return { segments, url: getDocsUrl(segments, page.locale) };
}
