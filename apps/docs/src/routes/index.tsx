import { createFileRoute, Link } from '@tanstack/react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';

import { baseOptions } from '@/lib/layout.shared';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="flex flex-1 flex-col items-center justify-center text-center px-4">
        <h1 className="font-medium text-2xl mb-4">React Aria UI</h1>
        <p className="text-fd-muted-foreground mb-8 max-w-md">
          Accessible React components built with React Aria, styled with
          Tailwind CSS. Distributed via shadcn registry.
        </p>
        <Link
          className="px-4 py-2 rounded-lg bg-fd-primary text-fd-primary-foreground font-medium text-sm"
          params={{
            _splat: '',
          }}
          to="/docs/$"
        >
          Get Started
        </Link>
      </main>
    </HomeLayout>
  );
}
