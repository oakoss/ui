import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  type ResizablePanelGroupProps,
} from '@oakoss/ui/components/ui/layout/resizable';
import { useState } from 'react';
import { expect, screen, userEvent, waitFor } from 'storybook/test';

import { part } from '#/helpers/parts';

type DemoProps = {
  isCollapsible?: boolean;
  isTall?: boolean;
  withHandle?: boolean;
} & Partial<ResizablePanelGroupProps>;

function Demo({
  isCollapsible = false,
  isTall = false,
  withHandle = false,
  ...props
}: DemoProps) {
  // The group fills its container, which sets the size.
  return (
    <div className="h-48 w-120">
      <ResizablePanelGroup className="rounded-md border" {...props}>
        <ResizablePanel
          className="p-4"
          collapsible={isCollapsible}
          defaultSize="40%"
          id="sidebar"
          minSize="20%"
        >
          Sidebar
        </ResizablePanel>
        <ResizableHandle aria-label="Resize sidebar" withHandle={withHandle} />
        <ResizablePanel aria-label="Content" className="p-4" id="content">
          {isTall ? (
            <ol>
              {Array.from({ length: 30 }, (_, index) => (
                <li key={index}>Line {index + 1}</li>
              ))}
            </ol>
          ) : (
            'Content'
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

const meta = { component: Demo, title: 'Layout/Resizable' } satisfies Meta<
  typeof Demo
>;

export default meta;

type Story = StoryObj<typeof meta>;

function handle() {
  return screen.getByRole('separator', { name: 'Resize sidebar' });
}

function size() {
  return Number(handle().getAttribute('aria-valuenow'));
}

// The handle is a named window splitter: its value is the first panel's
// size, and it controls that panel.
export const Default: Story = {
  play: async () => {
    const separator = handle();
    await expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    await expect(size()).toBe(40);
    await expect(separator).toHaveAttribute('aria-valuemin', '20');
    await expect(separator).toHaveAttribute(
      'aria-controls',
      part('resizable-panel').id,
    );
    await expect(getComputedStyle(separator).borderInlineStartWidth).toBe(
      '1px',
    );
  },
};

// Arrow keys move the handle 5%, and Home and End move it to the limits.
export const Keyboard: Story = {
  play: async () => {
    await userEvent.tab();
    await expect(handle()).toHaveFocus();
    await expect(getComputedStyle(handle()).outlineStyle).toBe('solid');
    await userEvent.keyboard('{ArrowRight}');
    await expect(size()).toBe(45);
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    await expect(size()).toBe(35);
    await userEvent.keyboard('{Home}');
    await expect(size()).toBe(20);
  },
};

// Right to left the first panel sits on the right, and the arrows still move
// the handle the way they point.
export const RightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: async () => {
    const separator = handle();
    const start = separator.getBoundingClientRect().left;
    await expect(
      part('resizable-panel').getBoundingClientRect().left,
    ).toBeGreaterThan(start);
    separator.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(separator.getBoundingClientRect().left).toBeGreaterThan(start);
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    await expect(separator.getBoundingClientRect().left).toBeLessThan(start);
  },
};

// Enter collapses a collapsible panel and restores it.
export const Collapsible: Story = {
  args: { isCollapsible: true },
  play: async () => {
    handle().focus();
    await userEvent.keyboard('{Enter}');
    await expect(size()).toBe(0);
    await userEvent.keyboard('{Enter}');
    await expect(size()).toBe(40);
  },
};

// Vertical, the handle is a horizontal line across the group.
export const Vertical: Story = {
  args: { orientation: 'vertical' },
  play: async () => {
    const separator = handle();
    await expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
    await expect(getComputedStyle(separator).borderTopWidth).toBe('1px');
    await expect(separator.getBoundingClientRect().width).toBe(
      part('resizable-panel-group').getBoundingClientRect().width - 2,
    );
  },
};

// A pointer within 12px of the line drags it, though the line is 1px.
export const PointerDrag: Story = {
  play: async () => {
    const box = handle().getBoundingClientRect();
    const x = box.left + 10;
    const y = box.top + box.height / 2;
    await userEvent.pointer([
      { coords: { clientX: x, clientY: y }, keys: '[MouseLeft>]' },
      { coords: { clientX: x + 60, clientY: y } },
      { coords: { clientX: x + 60, clientY: y }, keys: '[/MouseLeft]' },
    ]);
    await expect(size()).toBeGreaterThan(40);
  },
};

// A panel whose content overflows scrolls, and is a tab stop only then,
// named by the panel's label.
export const OverflowingPanel: Story = {
  args: { isTall: true },
  play: async () => {
    const [short, tall] = [
      ...document.querySelectorAll<HTMLElement>(
        '[data-slot=resizable-panel-content]',
      ),
    ];
    await expect(short).not.toHaveAttribute('tabindex');
    await waitFor(() => expect(tall).toHaveAttribute('tabindex', '0'));
    await expect(tall?.scrollHeight).toBeGreaterThan(tall?.clientHeight ?? 0);
    await expect(screen.getByRole('region', { name: 'Content' })).toBe(tall);
    await expect(document.querySelector('[data-panel][aria-label]')).toBeNull();
  },
};

// The grip is decoration on the line, turned with the handle.
export const WithHandle: Story = {
  args: { withHandle: true },
  play: async () => {
    const grip = part('resizable-handle-icon');
    await expect(grip).toHaveAttribute('aria-hidden', 'true');
    await expect(getComputedStyle(grip).borderTopWidth).toBe('1px');
    await expect(grip.getBoundingClientRect().height).toBe(24);
  },
};

// A group with a persistKey keeps the layout in a cookie and opens with it.
const cookie = 'resizable_story';

function Remountable(props: DemoProps) {
  const [key, setKey] = useState(0);
  return (
    <div>
      <Demo key={key} {...props} />
      <button
        onClick={() => {
          setKey((value) => value + 1);
        }}
        type="button"
      >
        Remount
      </button>
    </div>
  );
}

export const Persisted: Story = {
  args: { persistKey: cookie },
  beforeEach: async () => {
    await cookieStore.delete(cookie);
    return () => cookieStore.delete(cookie);
  },
  play: async () => {
    handle().focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await waitFor(async () => {
      const stored = await cookieStore.get(cookie);
      await expect(stored?.value).toContain('50');
    });
    await userEvent.click(screen.getByRole('button', { name: 'Remount' }));
    await waitFor(() => expect(size()).toBe(50));
  },
  render: (args) => <Remountable {...args} />,
};

// A layout saved for other panels gives way to the default.
export const StaleLayout: Story = {
  args: { persistKey: cookie },
  beforeEach: async () => {
    await cookieStore.set(
      cookie,
      encodeURIComponent(JSON.stringify({ files: 30, main: 70 })),
    );
    return () => cookieStore.delete(cookie);
  },
  play: async () => {
    await expect(size()).toBe(40);
  },
};

// Forced colors repaint the line and the grip in system colors, and keep the
// focus outline.
export const ForcedColors: Story = {
  args: { withHandle: true },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const style = getComputedStyle(handle());
    await expect(style.borderInlineStartStyle).toBe('solid');
    await expect(style.borderInlineStartColor).not.toBe('rgba(0, 0, 0, 0)');
    await userEvent.tab();
    await expect(getComputedStyle(handle()).outlineStyle).toBe('solid');
  },
  tags: ['forced-colors'],
};
