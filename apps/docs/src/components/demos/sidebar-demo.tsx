import * as Icon from '@oakoss/ui/components/icons';
import {
  Sidebar,
  SidebarInset,
} from '@oakoss/ui/components/ui/navigation/sidebar';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@oakoss/ui/components/ui/navigation/sidebar-group';
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@oakoss/ui/components/ui/navigation/sidebar-layout';
import {
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@oakoss/ui/components/ui/navigation/sidebar-menu';
import { SidebarProvider } from '@oakoss/ui/components/ui/navigation/sidebar-provider';
import {
  SidebarRail,
  SidebarTrigger,
} from '@oakoss/ui/components/ui/navigation/sidebar-trigger';
import { useState } from 'react';

const pages = [
  { icon: <Icon.Circle />, label: 'Home' },
  { icon: <Icon.Calendar />, label: 'Calendar' },
  { icon: <Icon.Search />, label: 'Search' },
];

export function SidebarDemo() {
  const [current, setCurrent] = useState('Home');
  return (
    <SidebarProvider>
      <Sidebar aria-label="Main">
        <SidebarHeader>
          <span className="px-2 text-sm font-semibold">Acme</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {pages.map(({ icon, label }) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton
                      isCurrent={current === label}
                      onPress={() => setCurrent(label)}
                    >
                      {icon}
                      <span>{label}</span>
                    </SidebarMenuButton>
                    {label === 'Calendar' ? (
                      <SidebarMenuBadge>3</SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Icon.Help />
                <span>Help</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <Page title={current} />
    </SidebarProvider>
  );
}

function Page({ title }: { title: string }) {
  return (
    <SidebarInset elementType="div">
      <header className="flex items-center gap-2 border-b p-2">
        <SidebarTrigger />
        <span className="text-sm">{title}</span>
      </header>
    </SidebarInset>
  );
}
