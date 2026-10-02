import { createFileRoute, Link } from '@tanstack/react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';

import { baseOptions } from '#/components/layout';
import { appName } from '#/lib/site';

export const Route = createFileRoute('/')({ component: Home });

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="flex flex-1 flex-col justify-center px-4 py-8 text-center">
        <h1 className="mb-2 text-2xl font-semibold">{appName}</h1>
        <p className="text-fd-muted-foreground mb-6">
          Accessible React components built on React Aria and Tailwind CSS.
        </p>
        <Link
          className="bg-fd-primary text-fd-primary-foreground mx-auto rounded-lg px-3 py-2 text-sm font-medium"
          params={{ _splat: '' }}
          to="/docs/$"
        >
          Get started
        </Link>
      </div>
    </HomeLayout>
  );
}
