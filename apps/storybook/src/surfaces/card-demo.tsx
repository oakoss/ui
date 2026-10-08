import type { ComponentProps } from 'react';

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

export type CardDemoProps = ComponentProps<typeof Card>;

export function CardDemo(props: CardDemoProps) {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Team plan</CardTitle>
        <CardDescription>Billed yearly.</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            Change
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>Five seats, 100 GB of storage.</CardContent>
      <CardFooter>
        <Button fullWidth>Upgrade</Button>
      </CardFooter>
    </Card>
  );
}
