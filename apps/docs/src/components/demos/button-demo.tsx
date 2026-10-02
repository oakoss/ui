import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { useState } from 'react';

export function ButtonDemo() {
  const [count, setCount] = useState(0);
  return (
    <div className="not-prose flex items-center gap-3 rounded-lg border p-6">
      <Button data-testid="demo-button" onPress={() => setCount((c) => c + 1)}>
        Pressed {count} times
      </Button>
      <Button intent="outline">Outline</Button>
      <Button intent="destructive">Destructive</Button>
    </div>
  );
}
