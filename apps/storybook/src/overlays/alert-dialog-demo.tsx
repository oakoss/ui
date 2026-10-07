import type { ComponentProps } from 'react';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@oakoss/ui/components/ui/overlays/alert-dialog';
import { screen, userEvent } from 'storybook/test';

export type AlertDemoProps = Omit<
  ComponentProps<typeof AlertDialog>,
  'children'
> &
  Pick<ComponentProps<typeof AlertDialogAction>, 'onAction' | 'onError'>;

// A promise a play function settles by hand, to hold an action pending; the
// story's onAction returns it.
export const work = { current: Promise.withResolvers<null>() };

export function AlertDemo({ onAction, onError, ...props }: AlertDemoProps) {
  return (
    <AlertDialogTrigger>
      <Button intent="destructive" variant="outline">
        Delete project
      </Button>
      <AlertDialog {...props}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this project?</AlertDialogTitle>
          <AlertDialogDescription>
            Its files and history are removed for everyone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            intent="destructive"
            onAction={onAction}
            {...(onError === undefined ? {} : { onError })}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialog>
    </AlertDialogTrigger>
  );
}

export async function openAlert() {
  await userEvent.click(screen.getByRole('button', { name: 'Delete project' }));
  return screen.findByRole('alertdialog', { name: 'Delete this project?' });
}
