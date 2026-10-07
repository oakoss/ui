import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { TextField } from '@oakoss/ui/components/ui/inputs/text-field';
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@oakoss/ui/components/ui/overlays/sheet';

export function SheetDemo() {
  return (
    <div className="not-prose">
      <SheetTrigger>
        <Button variant="outline">Edit profile</Button>
        <Sheet>
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>
              Changes save when you press Save.
            </SheetDescription>
          </SheetHeader>
          <SheetBody className="flex flex-col gap-4">
            <TextField defaultValue="Ada Lovelace" label="Name" />
            <TextField
              defaultValue="ada@example.com"
              label="Email"
              type="email"
            />
          </SheetBody>
          <SheetFooter>
            <SheetClose>Cancel</SheetClose>
            <SheetClose intent="primary" variant="solid">
              Save
            </SheetClose>
          </SheetFooter>
        </Sheet>
      </SheetTrigger>
    </div>
  );
}
