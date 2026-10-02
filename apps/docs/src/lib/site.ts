export const appName = 'oakoss/ui';
export const docsRoute = '/docs';
export const githubUrl = 'https://github.com/oakoss/ui';

// Inverse of markdownUrl: the page slugs for a Markdown URL's segments.
export function decodeMarkdownUrl(segments: string[]) {
  const slugs = segments.map((segment, i) =>
    i === segments.length - 1 ? segment.replace(/\.md$/u, '') : segment,
  );
  return slugs.length === 1 && slugs[0] === 'index' ? [] : slugs;
}

export function githubSourceUrl(contentPath: string) {
  return `${githubUrl}/blob/main/apps/docs/content/docs/${contentPath}`;
}

// The Markdown version of a docs page; the index page is /docs/index.md.
export function markdownUrl(slugs: string[]) {
  return `${docsRoute}/${slugs.length === 0 ? 'index' : slugs.join('/')}.md`;
}
