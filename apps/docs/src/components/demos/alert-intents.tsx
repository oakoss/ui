import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@oakoss/ui/components/ui/feedback/alert';

export function AlertIntents() {
  return (
    <div className="not-prose grid w-full max-w-lg gap-3">
      <Alert>
        <AlertTitle>Scheduled maintenance</AlertTitle>
        <AlertDescription>Sunday from 02:00 to 03:00 UTC.</AlertDescription>
      </Alert>
      <Alert intent="info">
        <AlertTitle>Exports are now faster</AlertTitle>
      </Alert>
      <Alert intent="success">
        <AlertTitle>Domain verified</AlertTitle>
      </Alert>
      <Alert intent="warning">
        <AlertTitle>Storage almost full</AlertTitle>
        <AlertDescription>You&apos;ve used 9.2 GB of 10 GB.</AlertDescription>
      </Alert>
      <Alert intent="destructive">
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>Your card was declined.</AlertDescription>
      </Alert>
    </div>
  );
}
