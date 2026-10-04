import { createFileRoute, Link, notFound } from '@tanstack/react-router';
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
import { Suspense, use } from 'react';

import { baseOptions } from '#/components/layout';
import { useMDXComponents } from '#/components/mdx';
import { itemSourceUrl } from '#/lib/registry';
import { githubSourceUrl, markdownUrl } from '#/lib/site';
import { docs, source } from '#/lib/source';

export const Route = createFileRoute('/docs/$')({
  component: Page,
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
    <DocsLayout {...baseOptions()} tree={pageTree}>
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
