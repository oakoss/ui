import { type ReactNode, useSyncExternalStore } from 'react';

// Renders its children only after hydration, so a demo that reads the
// visitor's clock can't disagree with the page prerendered at build time.
export function ClientOnly({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback: ReactNode;
}) {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return isClient ? children : fallback;
}

// Nothing changes after hydration, so there's nothing to subscribe to.
function subscribe() {
  return () => null;
}
