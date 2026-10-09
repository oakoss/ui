import { Checkbox } from '@oakoss/ui/components/ui/inputs/checkbox';
import { useState } from 'react';

const folders = ['Documents', 'Downloads', 'Pictures'];

export function CheckboxIndeterminate() {
  const [selected, setSelected] = useState(['Documents']);
  const isAll = selected.length === folders.length;
  return (
    <div className="not-prose flex flex-col gap-5">
      <Checkbox
        isIndeterminate={selected.length > 0 && !isAll}
        isSelected={isAll}
        onChange={(isSelected) => setSelected(isSelected ? folders : [])}
      >
        All folders
      </Checkbox>
      <div className="flex flex-col gap-5 ps-6">
        {folders.map((folder) => (
          <Checkbox
            isSelected={selected.includes(folder)}
            key={folder}
            onChange={(isSelected) =>
              setSelected((current) =>
                isSelected
                  ? [...current, folder]
                  : current.filter((name) => name !== folder),
              )
            }
          >
            {folder}
          </Checkbox>
        ))}
      </div>
    </div>
  );
}
