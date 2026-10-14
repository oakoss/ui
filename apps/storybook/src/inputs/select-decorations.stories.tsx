import type { Meta, StoryObj } from '@storybook/react-vite';

import * as Icon from '@oakoss/ui/components/icons';
import { Select, SelectItem } from '@oakoss/ui/components/ui/inputs/select';
import {
  expect,
  screen,
  spyOn,
  userEvent,
  waitFor,
  within,
} from 'storybook/test';

const SingleSelect = Select<object>;

const fruits = (
  <>
    <SelectItem id="apple">Apple</SelectItem>
    <SelectItem id="banana">Banana</SelectItem>
  </>
);

const meta = {
  args: { children: fruits, label: 'Fruit' },
  component: SingleSelect,
  title: 'Inputs/Select/Decorations',
} satisfies Meta<typeof SingleSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

// Text inside the trigger describes it; an element is decoration. Neither
// warns, before or after a pick.
export const Text: Story = {
  args: { description: 'Ships tomorrow.', end: 'incl. tax', start: 'Ship to:' },
  beforeEach: () => {
    spyOn(console, 'warn');
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /Fruit/u });
    await expect(console.warn).not.toHaveBeenCalled();
    await userEvent.click(button);
    await userEvent.click(await screen.findByRole('option', { name: 'Apple' }));
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    await expect(button).toHaveTextContent('Apple');
    await expect(console.warn).not.toHaveBeenCalled();
    await expect(button).toHaveAccessibleDescription(
      'Ships tomorrow. Ship to: incl. tax',
    );
    await expect(within(button).getByText('Ship to:')).toBeVisible();
    await expect(within(button).getByText('incl. tax')).toBeVisible();
    await expect(canvas.getAllByText('Ship to:')).toHaveLength(1);
    await expect(
      button.querySelector('[data-slot=select-value]')?.nextElementSibling,
    ).toHaveTextContent('incl. tax');
    await expect(
      canvas.getByRole('button', { name: /Size/u }),
    ).not.toHaveAccessibleDescription();
  },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <SingleSelect {...args} />
      <SingleSelect label="Size" start={<Icon.Search aria-hidden />}>
        {fruits}
      </SingleSelect>
    </div>
  ),
};

// A focusable decoration nests inside the trigger's button, so each Select
// holding one warns once; an element taken out of the tab order doesn't.
export const Focusable: Story = {
  beforeEach: () => {
    spyOn(console, 'warn');
  },
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'nested-interactive' }] } },
  },
  play: async () => {
    await expect(console.warn).toHaveBeenCalledTimes(3);
    await expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("Select's trigger is a button"),
    );
  },
  render: (args) => (
    <>
      <SingleSelect {...args} end={<a href="https://example.com">Help</a>} />
      <SingleSelect {...args} end={<button type="button">Help</button>} />
      <SingleSelect
        {...args}
        end={
          <span role="button" tabIndex={0}>
            Help
          </span>
        }
      />
      <SingleSelect {...args} end={<span tabIndex={-1}>Help</span>} />
    </>
  ),
};
