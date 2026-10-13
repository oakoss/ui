import {
  createFileRoute,
  type ErrorComponentProps,
  Link,
  notFound,
} from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { staticFunctionMiddleware } from '@tanstack/start-static-server-functions';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  EditOnGitHub,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { BookOpen, Code } from 'lucide-react';
import { Suspense, use, useEffect } from 'react';

import { baseOptions, docsOptions } from '#/components/layout';
import { useMDXComponents } from '#/components/mdx';
import { itemSourceUrl } from '#/lib/registry';
import { githubSourceUrl, markdownUrl } from '#/lib/site';
import { docs, source } from '#/lib/source';

export const Route = createFileRoute('/docs/$')({
  component: Page,
  errorComponent: PageError,
  loader: async ({ params }) => {
    const slugs = params._splat?.split('/') ?? [];
    // The 404 page hydrates on unknown URLs; with no baked data for them, the
    // static loader fetch would fail and replace it with an error.
    if (source.getPage(slugs) === undefined) throw notFound();
    const data = await serverLoader({ data: slugs });
    await docs.getPage(data.path)?.preload();
    return data;
  },
});

const serverLoader = createServerFn({ method: 'GET' })
  .validator((slugs: string[]) => slugs)
  // Bakes each page's result into a static file at prerender time, so client
  // navigation works without a server.
  .middleware([staticFunctionMiddleware])
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs);
    if (!page) throw notFound();

    const { item, reactAria } = page.data;
    return {
      markdownUrl: markdownUrl(page.slugs),
      pageTree: await source.serializePageTree(source.getPageTree()),
      path: page.path,
      reactAria,
      sourceUrl: item === undefined ? undefined : itemSourceUrl(item),
    };
  });

function Content({
  markdownUrl,
  path,
  reactAria,
  sourceUrl,
}: {
  markdownUrl: string;
  path: string;
  reactAria: string | undefined;
  sourceUrl: string | undefined;
}) {
  // End-to-end tests wait for this: clicks and typing before hydration are lost.
  useEffect(() => {
    document.documentElement.dataset.hydrated = '';
  }, []);

  const page = docs.getPage(path);
  if (!page) throw new Error(`unknown page: ${path}`);

  const { toc } = use(page.load());
  const MDX = page.body;
  const editUrl = githubSourceUrl(path);

  return (
    <DocsPage toc={toc}>
      <DocsTitle>{page.title}</DocsTitle>
      <DocsDescription>{page.description}</DocsDescription>
      <div className="-mt-4 flex flex-row flex-wrap items-center gap-2 border-b pb-6">
        {sourceUrl === undefined ? null : (
          <EditOnGitHub href={sourceUrl}>
            <Code className="size-3.5" />
            Source
          </EditOnGitHub>
        )}
        {reactAria === undefined ? null : (
          <EditOnGitHub href={reactAria}>
            <BookOpen className="size-3.5" />
            React Aria
          </EditOnGitHub>
        )}
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover githubUrl={editUrl} markdownUrl={markdownUrl} />
        <EditOnGitHub href={editUrl} />
      </div>
      <DocsBody>
        <MDX components={useMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

function Page() {
  const { markdownUrl, pageTree, path, reactAria, sourceUrl } =
    useFumadocsLoader(Route.useLoaderData());

  return (
    <DocsLayout {...docsOptions()} tree={pageTree}>
      {/* Lets the prerender crawler find each page's Markdown version. */}
      <Link hidden to={markdownUrl} />
      <Suspense>
        <Content
          markdownUrl={markdownUrl}
          path={path}
          reactAria={reactAria}
          sourceUrl={sourceUrl}
        />
      </Suspense>
    </DocsLayout>
  );
}

// A page that fails, such as one whose chunk a later deploy replaced, keeps
// the sidebar. Its loader may be what failed, so the tree comes from source.
function PageError({ error }: ErrorComponentProps) {
  const message = error instanceof Error ? error.message : String(error);
  // Reloading fixes only a failed chunk import, which each browser words
  // differently (Chromium and Firefox, then Safari).
  const isStale =
    /dynamically imported module|Importing a module script failed/u.test(
      message,
    );
  return (
    <DocsLayout {...baseOptions()} tree={source.getPageTree()}>
      <DocsPage>
        <DocsTitle>This page couldn’t load</DocsTitle>
        <DocsDescription>
          {isStale
            ? 'The site may have been updated since you opened it.'
            : 'Something went wrong showing this page.'}
        </DocsDescription>
        <DocsBody>
          {isStale ? (
            <p>
              <button
                className="underline"
                onClick={() => location.reload()}
                type="button"
              >
                Reload the page
              </button>{' '}
              or pick another page from the sidebar.
            </p>
          ) : (
            <p>Pick another page from the sidebar.</p>
          )}
          {import.meta.env.DEV ? (
            <pre>{error instanceof Error ? error.stack : message}</pre>
          ) : null}
        </DocsBody>
      </DocsPage>
    </DocsLayout>
  );
}
