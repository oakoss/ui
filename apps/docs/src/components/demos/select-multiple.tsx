import { Select, SelectItem } from '@oakoss/ui/components/ui/inputs/select';

const toppings = [
  { id: 'cheese', name: 'Cheese' },
  { id: 'mushroom', name: 'Mushroom' },
  { id: 'olive', name: 'Olive' },
  { id: 'pepper', name: 'Pepper' },
];

export function SelectMultiple() {
  return (
    <div className="not-prose flex max-w-sm flex-col gap-4">
      <Select
        defaultValue={['cheese']}
        items={toppings}
        label="Toppings"
        selectionMode="multiple"
      >
        {(item) => <SelectItem>{item.name}</SelectItem>}
      </Select>
    </div>
  );
}
