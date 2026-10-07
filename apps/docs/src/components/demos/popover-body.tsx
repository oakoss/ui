import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Popover,
  PopoverBody,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@oakoss/ui/components/ui/overlays/popover';

const changes = [
  'Added a dark theme.',
  'Fixed focus returning to the wrong button.',
  'Dialogs now fit above the on-screen keyboard.',
  'Sheets slide in from the side the page reads from.',
  'Popovers can show an arrow.',
  'Tooltips wait half a second before opening.',
  'Buttons keep their width while pending.',
  'Text fields link their errors to the input.',
];

export function PopoverBodyDemo() {
  return (
    <div className="not-prose">
      <PopoverTrigger>
        <Button variant="outline">What’s new</Button>
        <Popover maxHeight={288}>
          <PopoverHeader>
            <PopoverTitle>What’s new</PopoverTitle>
          </PopoverHeader>
          <PopoverBody>
            <ul className="flex list-disc flex-col gap-2 ps-4">
              {changes.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
          </PopoverBody>
        </Popover>
      </PopoverTrigger>
    </div>
  );
}
