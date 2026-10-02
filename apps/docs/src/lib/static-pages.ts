// Routes nothing links to, so the prerender crawler would not find them. Each
// entry is the prerender path and the file it must produce.
export const staticPages = [
  { file: '404.html', path: '/404' },
  { file: 'api/search', path: '/api/search' },
  { file: 'llms.txt', path: '/llms.txt' },
  { file: 'llms-full.txt', path: '/llms-full.txt' },
] as const;
