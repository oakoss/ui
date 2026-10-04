import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { useState } from 'react';

export function ButtonPending() {
  const [isSaving, setIsSaving] = useState(false);

  function save() {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 2000);
  }

  return (
    <div className="not-prose flex flex-wrap items-center gap-3">
      <Button isPending={isSaving} onPress={save} pendingLabel="Saving">
        Save
      </Button>
    </div>
  );
}
