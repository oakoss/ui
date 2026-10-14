import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@oakoss/ui/components/ui/feedback/alert';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { useState } from 'react';

// The region is on the page before its message, so screen readers announce
// the message when it appears.
export function AlertLive() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="not-prose grid w-full max-w-lg justify-items-start gap-3">
      <Button onPress={() => setSaved(true)} variant="outline">
        Save draft
      </Button>
      <div role="status">
        {saved ? (
          <Alert intent="success">
            <AlertTitle>Draft saved</AlertTitle>
            <AlertDescription>You can close this page.</AlertDescription>
          </Alert>
        ) : null}
      </div>
    </div>
  );
}
