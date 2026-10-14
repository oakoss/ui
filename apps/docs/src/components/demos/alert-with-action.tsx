import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from '@oakoss/ui/components/ui/feedback/alert';
import { Button } from '@oakoss/ui/components/ui/inputs/button';

export function AlertWithAction() {
  return (
    <Alert className="not-prose max-w-lg" intent="warning">
      <AlertTitle>Your trial ends in 3 days</AlertTitle>
      <AlertDescription>
        Add a payment method to keep your work.
      </AlertDescription>
      <AlertAction>
        <Button size="sm" variant="outline">
          Upgrade
        </Button>
      </AlertAction>
    </Alert>
  );
}
