import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@oakoss/ui/components/ui/feedback/alert';

export function AlertDemo() {
  return (
    <Alert className="not-prose max-w-lg" intent="info">
      <AlertTitle>New sign-in from Chrome on Windows</AlertTitle>
      <AlertDescription>
        If this wasn&apos;t you, <a href="#security">review your security</a>.
      </AlertDescription>
    </Alert>
  );
}
