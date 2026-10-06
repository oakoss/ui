import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@oakoss/ui/components/ui/overlays/dialog';

const sections = [
  'Accounts',
  'Content',
  'Payments',
  'Privacy',
  'Termination',
  'Liability',
  'Disputes',
  'Changes',
];

export function DialogScrolling() {
  return (
    <div className="not-prose">
      <DialogTrigger>
        <Button variant="outline">Read terms</Button>
        <Dialog>
          <DialogHeader>
            <DialogTitle>Terms of service</DialogTitle>
            <DialogDescription>Updated October 2026.</DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            {sections.map((section) => (
              <section key={section}>
                <h3 className="font-medium">{section}</h3>
                <p className="text-muted-foreground">
                  Each section explains one part of the agreement in plain
                  language, so you can find what applies to you without reading
                  every clause.
                </p>
              </section>
            ))}
          </DialogBody>
          <DialogFooter>
            <DialogClose>Decline</DialogClose>
            <DialogClose intent="primary" variant="solid">
              Accept
            </DialogClose>
          </DialogFooter>
        </Dialog>
      </DialogTrigger>
    </div>
  );
}
