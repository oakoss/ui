import * as Icon from '@oakoss/ui/components/icons';
import {
  Sidebar,
  SidebarInset,
} from '@oakoss/ui/components/ui/navigation/sidebar';
import {
  SidebarGroup,
  SidebarGroupContent,
} from '@oakoss/ui/components/ui/navigation/sidebar-group';
import { SidebarContent } from '@oakoss/ui/components/ui/navigation/sidebar-layout';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@oakoss/ui/components/ui/navigation/sidebar-menu';
import { SidebarProvider } from '@oakoss/ui/components/ui/navigation/sidebar-provider';
import { SidebarTrigger } from '@oakoss/ui/components/ui/navigation/sidebar-trigger';

const pages = [
  { icon: <Icon.Circle />, label: 'Home' },
  { icon: <Icon.Calendar />, label: 'Calendar' },
  { icon: <Icon.Search />, label: 'Search' },
];

export function SidebarIcon() {
  return (
    <SidebarProvider
      defaultOpen={false}
      keyboardShortcut={false}
      persistKey={false}
    >
      <Sidebar aria-label="Workspace" collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {pages.map(({ icon, label }) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton tooltip={label}>
                      {icon}
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset elementType="div">
        <header className="flex items-center gap-2 border-b p-2">
          <SidebarTrigger />
        </header>
      </SidebarInset>
    </SidebarProvider>
  );
}
