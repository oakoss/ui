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

export function AlertDialogDemo() {
  return (
    <div className="not-prose">
      <AlertDialogTrigger>
        <Button intent="destructive" variant="outline">
          Delete project
        </Button>
        <AlertDialog>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              Its files and history are removed for everyone, permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction intent="destructive">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialog>
      </AlertDialogTrigger>
    </div>
  );
}
