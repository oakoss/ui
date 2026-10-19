import * as Icon from '@oakoss/ui/components/icons';
import {
  Sidebar,
  SidebarInset,
} from '@oakoss/ui/components/ui/navigation/sidebar';
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@oakoss/ui/components/ui/navigation/sidebar-group';
import { SidebarContent } from '@oakoss/ui/components/ui/navigation/sidebar-layout';
import {
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@oakoss/ui/components/ui/navigation/sidebar-menu';
import { SidebarProvider } from '@oakoss/ui/components/ui/navigation/sidebar-provider';
import { SidebarTrigger } from '@oakoss/ui/components/ui/navigation/sidebar-trigger';

export function SidebarFloating() {
  return (
    <SidebarProvider keyboardShortcut={false} persistKey={false}>
      <Sidebar aria-label="Projects" variant="floating">
        <SidebarContent>
          <SidebarGroup isCollapsible>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupAction aria-label="New project">
              <Icon.Plus />
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Icon.Calendar />
                    <span>Launch</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction aria-label="Launch options" showOnHover>
                    <Icon.Ellipsis />
                  </SidebarMenuAction>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton isCurrent>
                        <span>Tasks</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>
                        <span>Notes</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset elementType="div">
        <header className="flex items-center gap-2 p-2">
          <SidebarTrigger />
        </header>
      </SidebarInset>
    </SidebarProvider>
  );
}
