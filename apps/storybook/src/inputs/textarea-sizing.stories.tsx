import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  TextareaField,
  TextField,
} from '@oakoss/ui/components/ui/inputs/text-field';
import { expect, userEvent } from 'storybook/test';

const meta = {
  args: { label: 'Bio' },
  component: TextareaField,
  title: 'Inputs/Textarea/Sizing',
} satisfies Meta<typeof TextareaField>;

export default meta;

type Story = StoryObj<typeof meta>;

// Keystrokes for that many lines of text.
const lines = (count: number) =>
  Array.from({ length: count }, (_, index) => `Line ${index + 1}`).join(
    '{Enter}',
  );

// Three rows by default: the control height plus two more lines. A fixed box
// below HTML's default of two rows still takes minRows.
export const MinRows: Story = {
  play: async ({ canvas }) => {
    const heights = ['Default', 'One row', 'Five rows', 'Fixed one row'].map(
      (name) =>
        canvas.getByRole('textbox', { name }).getBoundingClientRect().height,
    );
    await expect(heights).toEqual([76, 36, 116, 36]);
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <TextareaField label="Default" />
      <TextareaField label="One row" minRows={1} />
      <TextareaField label="Five rows" minRows={5} />
      <TextareaField autoGrow={false} label="Fixed one row" minRows={1} />
    </div>
  ),
};

// One row matches an Input of the same size, with its text on the same line.
export const MatchesInput: Story = {
  play: async ({ canvas }) => {
    for (const size of ['sm', 'md', 'lg']) {
      const input = canvas.getByRole('textbox', { name: `Input ${size}` });
      const textarea = canvas.getByRole('textbox', {
        name: `Textarea ${size}`,
      });
      await expect(textarea).toHaveAttribute('data-size', size);
      await expect(textarea.getBoundingClientRect().height).toBe(
        input.getBoundingClientRect().height,
      );
      await expect(getComputedStyle(textarea).paddingTop).toBe(
        `${(input.getBoundingClientRect().height - 20 - 2) / 2}px`,
      );
    }
  },
  render: () => (
    <div className="flex flex-col gap-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div className="flex items-start gap-2" key={size}>
          <TextField aria-label={`Input ${size}`} size={size} />
          <TextareaField
            aria-label={`Textarea ${size}`}
            minRows={1}
            size={size}
          />
        </div>
      ))}
    </div>
  ),
};

// The box grows with its content up to maxRows, then scrolls.
export const AutoGrow: Story = {
  args: { maxRows: 5 },
  play: async ({ canvas }) => {
    const textarea = canvas.getByRole('textbox', { name: 'Bio' });
    await expect(textarea.getBoundingClientRect().height).toBe(76);
    await userEvent.type(textarea, lines(4));
    await expect(textarea.getBoundingClientRect().height).toBe(96);
    await userEvent.type(textarea, ['{Enter}', lines(4)].join(''));
    await expect(textarea.getBoundingClientRect().height).toBe(116);
    await expect(textarea.scrollHeight).toBeGreaterThan(textarea.clientHeight);
  },
};

// Without maxRows the box keeps growing rather than scrolling.
export const Unbounded: Story = {
  play: async ({ canvas }) => {
    const textarea = canvas.getByRole('textbox', { name: 'Bio' });
    await userEvent.type(textarea, lines(12));
    await expect(getComputedStyle(textarea).maxHeight).toBe('none');
    await expect(textarea.getBoundingClientRect().height).toBe(256);
  },
};

// Where auto-grow works, a drag would fix the height, so there's no handle.
export const Resize: Story = {
  play: async ({ canvas }) => {
    const resize = (name: string) =>
      getComputedStyle(canvas.getByRole('textbox', { name })).resize;
    await expect(resize('Auto-grow')).toBe('none');
    await expect(resize('Fixed')).toBe('vertical');
    await expect(resize('Disabled')).toBe('none');
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <TextareaField label="Auto-grow" />
      <TextareaField autoGrow={false} label="Fixed" />
      <TextareaField autoGrow={false} isDisabled label="Disabled" />
    </div>
  ),
};

// Without auto-grow the box keeps its rows and scrolls.
export const Fixed: Story = {
  args: { autoGrow: false },
  play: async ({ canvas }) => {
    const textarea = canvas.getByRole('textbox', { name: 'Bio' });
    await userEvent.type(textarea, lines(6));
    await expect(textarea.getBoundingClientRect().height).toBe(76);
    await expect(textarea.scrollHeight).toBeGreaterThan(textarea.clientHeight);
  },
};
