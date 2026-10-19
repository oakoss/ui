import * as Icon from '@oakoss/ui/components/icons';
import { Input } from '@oakoss/ui/components/ui/inputs/input';
import {
  Sidebar,
  SidebarInset,
  type SidebarProps,
} from '@oakoss/ui/components/ui/navigation/sidebar';
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@oakoss/ui/components/ui/navigation/sidebar-group';
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInput,
  SidebarSeparator,
} from '@oakoss/ui/components/ui/navigation/sidebar-layout';
import {
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@oakoss/ui/components/ui/navigation/sidebar-menu';
import {
  SidebarProvider,
  type SidebarProviderProps,
} from '@oakoss/ui/components/ui/navigation/sidebar-provider';
import {
  SidebarRail,
  SidebarTrigger,
} from '@oakoss/ui/components/ui/navigation/sidebar-trigger';
import { useState } from 'react';
import { Link, RouterProvider } from 'react-aria-components';
import { screen } from 'storybook/test';

export type SidebarDemoProps = {
  onRailPress?: () => void;
  // Projects listed, so the content can overflow.
  projects?: number;
  // The Projects group's defaultExpanded; unset, it opens for the current page.
  projectsExpanded?: boolean;
  // The page the demo's router starts on.
  start?: string;
  withRail?: boolean;
} & Omit<SidebarProps, 'children'> &
  Pick<
    SidebarProviderProps,
    | 'defaultOpen'
    | 'isOpen'
    | 'keyboardShortcut'
    | 'onOpenChange'
    | 'persistKey'
  >;

const main = [
  { href: '/home', label: 'Home' },
  { href: '/inbox', label: 'Inbox' },
  { href: '/settings', label: 'Settings' },
];

export async function settle() {
  await Promise.all(
    document.getAnimations().map((animation) => animation.finished),
  );
}

export function sidebarContainer() {
  const element = document.querySelector<HTMLElement>(
    '[data-slot=sidebar-container]',
  );
  if (!element) throw new Error('No sidebar container');
  return element;
}

// Links navigate through a stand-in router, so the page never leaves; the
// current page is the one the router last went to.
export function SidebarDemo({
  defaultOpen,
  isOpen,
  keyboardShortcut,
  onOpenChange,
  onRailPress,
  persistKey = false,
  projects = 3,
  projectsExpanded,
  start = '/home',
  withRail = true,
  ...props
}: SidebarDemoProps) {
  const [path, setPath] = useState(start);
  return (
    <RouterProvider navigate={setPath}>
      <SidebarProvider
        defaultOpen={defaultOpen}
        isOpen={isOpen}
        keyboardShortcut={keyboardShortcut}
        onOpenChange={onOpenChange}
        persistKey={persistKey}
      >
        <Sidebar aria-label="Main" {...props}>
          <SidebarHeader>
            <SidebarInput aria-label="Search" placeholder="Search" />
          </SidebarHeader>
          <SidebarContent>
            <MainGroup path={path} />
            <ProjectsGroup
              isExpanded={projectsExpanded}
              path={path}
              projects={projects}
            />
          </SidebarContent>
          <SidebarSeparator />
          <Footer />
          {withRail ? <SidebarRail onPress={onRailPress} /> : null}
        </Sidebar>
        <Page path={path} />
      </SidebarProvider>
    </RouterProvider>
  );
}

// The rail shares the trigger's name.
export function sidebarTrigger() {
  const trigger = screen
    .getAllByRole('button', { name: 'Toggle sidebar' })
    .find((element) => element.dataset.slot === 'sidebar-trigger');
  if (!trigger) throw new Error('No sidebar trigger');
  return trigger;
}

function Footer() {
  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Help">
            <Icon.Help />
            <span>Help</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}

function MainGroup({ path }: { path: string }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarGroupAction aria-label="Add page">
        <Icon.Plus />
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu>
          {main.map(({ href, label }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                href={href}
                isCurrent={path === href}
                tooltip={label}
              >
                <Icon.Circle />
                <span>{label}</span>
              </SidebarMenuButton>
              {label === 'Inbox' ? (
                <SidebarMenuBadge>24</SidebarMenuBadge>
              ) : null}
              {label === 'Settings' ? (
                <SidebarMenuAction aria-label="More settings" showOnHover>
                  <Icon.Ellipsis />
                </SidebarMenuAction>
              ) : null}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function Page({ path }: { path: string }) {
  return (
    <SidebarInset>
      <header className="flex items-center gap-2 p-2">
        <SidebarTrigger />
        <span>{path}</span>
      </header>
      <div className="flex flex-col gap-2 p-4">
        <Input aria-label="Notes" />
        <Link href="/projects/2">Open project 2</Link>
      </div>
    </SidebarInset>
  );
}

function ProjectsGroup({
  isExpanded,
  path,
  projects,
}: {
  isExpanded: boolean | undefined;
  path: string;
  projects: number;
}) {
  return (
    <SidebarGroup defaultExpanded={isExpanded} isCollapsible>
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {Array.from({ length: projects }, (_, index) => {
            const href = `/projects/${index + 1}`;
            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  href={href}
                  isCurrent={path === href}
                  tooltip={`Project ${index + 1}`}
                >
                  <Icon.Calendar />
                  <span>Project {index + 1}</span>
                </SidebarMenuButton>
                {index === 0 ? (
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        href="/projects/1/tasks"
                        isCurrent={path === '/projects/1/tasks'}
                      >
                        <span>Tasks</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
