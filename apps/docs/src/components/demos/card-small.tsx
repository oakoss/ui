import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@oakoss/ui/components/ui/surfaces/card';

export function CardSmall() {
  return (
    <Card className="not-prose w-full max-w-xs" size="sm">
      <CardHeader>
        <CardTitle>Storage</CardTitle>
        <CardDescription>62 of 100 GB used.</CardDescription>
      </CardHeader>
      <CardContent>Clear old exports to free up space.</CardContent>
    </Card>
  );
}
