import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@oakoss/ui/components/ui/overlays/alert-dialog';

export function AlertDialogSmall() {
  return (
    <div className="not-prose">
      <AlertDialogTrigger>
        <Button variant="outline">Sign out</Button>
        <AlertDialog size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <span aria-hidden className="text-2xl">
                ⏻
              </span>
            </AlertDialogMedia>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              Unsaved drafts stay on this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Sign out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialog>
      </AlertDialogTrigger>
    </div>
  );
}
