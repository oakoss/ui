import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@oakoss/ui/components/ui/surfaces/card';

export function CardDemo() {
  return (
    <Card className="not-prose w-full max-w-sm">
      <CardHeader>
        <CardTitle>Team plan</CardTitle>
        <CardDescription>Billed yearly, renews on 1 March.</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            Change
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>Five seats and 100 GB of storage.</CardContent>
      <CardFooter>
        <Button fullWidth>Upgrade</Button>
      </CardFooter>
    </Card>
  );
}
