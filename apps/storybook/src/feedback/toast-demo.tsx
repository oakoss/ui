import {
  Toaster,
  type ToasterProps,
} from '@oakoss/ui/components/ui/feedback/toast/toast';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { ToastStore } from '@oakoss/ui/lib/toast/toast-store';
import { expect, screen, waitFor } from 'storybook/test';

// One store, reset before each story, so no toast leaks between stories.
export const demoStore = new ToastStore();

export function Demo(props: Omit<ToasterProps, 'store'>) {
  return (
    <>
      <Button
        onPress={() => {
          demoStore.show(
            'Changes saved',
            { description: 'All files are up to date.', duration: Infinity },
            'success',
          );
        }}
      >
        Save
      </Button>
      <Toaster {...props} store={demoStore} />
    </>
  );
}

export function findToast(name: string) {
  return screen.findByRole('alertdialog', { name });
}

// Waits out the exit transition, after which the toast leaves the page.
export async function gone(name: string) {
  await waitFor(async () => {
    await expect(screen.queryByRole('alertdialog', { name })).toBeNull();
  });
}

export function liveRegion(politeness: 'assertive' | 'polite') {
  const region = document.querySelector<HTMLElement>(
    `[data-slot=toast-portal] [aria-live=${CSS.escape(politeness)}]`,
  );
  if (!region) throw new Error(`No ${politeness} live region`);
  return region;
}

// Each announcement is its own node, so this lists them exactly.
export function messages(politeness: 'assertive' | 'polite') {
  return [...liveRegion(politeness).children].map((node) => node.textContent);
}

export function resetDemoStore() {
  demoStore.reset();
}
