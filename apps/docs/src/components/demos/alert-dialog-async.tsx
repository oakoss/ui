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
import { useState } from 'react';

export function AlertDialogAsync() {
  const [archived, setArchived] = useState(0);

  async function archive() {
    await new Promise((resolve) => {
      setTimeout(resolve, 1500);
    });
    setArchived((count) => count + 1);
  }

  return (
    <div className="not-prose flex items-center gap-3">
      <AlertDialogTrigger>
        <Button variant="outline">Archive threads</Button>
        <AlertDialog>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive 12 threads?</AlertDialogTitle>
            <AlertDialogDescription>
              They move to the archive and stop sending notifications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onAction={archive}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialog>
      </AlertDialogTrigger>
      <span className="text-sm text-muted-foreground">
        Archived {archived} times
      </span>
    </div>
  );
}
