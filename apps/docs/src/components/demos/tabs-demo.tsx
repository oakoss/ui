import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@oakoss/ui/components/ui/navigation/tabs';

export function TabsDemo() {
  return (
    <Tabs className="not-prose max-w-md">
      <TabsList aria-label="Account settings">
        <TabsTrigger id="profile">Profile</TabsTrigger>
        <TabsTrigger id="billing">Billing</TabsTrigger>
        <TabsTrigger id="team">Team</TabsTrigger>
      </TabsList>
      <TabsContent className="pt-2" id="profile">
        Change your name, photo and email.
      </TabsContent>
      <TabsContent className="pt-2" id="billing">
        Update your card and see past invoices.
      </TabsContent>
      <TabsContent className="pt-2" id="team">
        Invite people and set what they can do.
      </TabsContent>
    </Tabs>
  );
}
