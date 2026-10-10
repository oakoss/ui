import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@oakoss/ui/components/ui/navigation/tabs';

export function TabsVertical() {
  return (
    <Tabs className="not-prose max-w-md" orientation="vertical" variant="line">
      <TabsList aria-label="Settings">
        <TabsTrigger id="general">General</TabsTrigger>
        <TabsTrigger id="security">Security</TabsTrigger>
        <TabsTrigger id="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent id="general">Language and time zone.</TabsContent>
      <TabsContent id="security">Password and two-factor sign-in.</TabsContent>
      <TabsContent id="notifications">What we email you about.</TabsContent>
    </Tabs>
  );
}
