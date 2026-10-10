import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@oakoss/ui/components/ui/navigation/tabs';

export function TabsLine() {
  return (
    <Tabs className="not-prose max-w-md" variant="line">
      <TabsList aria-label="Project">
        <TabsTrigger id="overview">Overview</TabsTrigger>
        <TabsTrigger id="activity">Activity</TabsTrigger>
        <TabsTrigger id="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent className="pt-2" id="overview">
        A summary of the project.
      </TabsContent>
      <TabsContent className="pt-2" id="activity">
        Recent changes and comments.
      </TabsContent>
      <TabsContent className="pt-2" id="settings">
        Name, visibility and members.
      </TabsContent>
    </Tabs>
  );
}
