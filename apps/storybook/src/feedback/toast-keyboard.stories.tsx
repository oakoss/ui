import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Toaster,
  type ToasterProps,
} from '@oakoss/ui/components/ui/feedback/toast/toast';
import { Field, FieldLabel } from '@oakoss/ui/components/ui/inputs/field';
import { Input } from '@oakoss/ui/components/ui/inputs/input';
import { TextField } from '@oakoss/ui/components/ui/inputs/text-field';
import { expect, userEvent } from 'storybook/test';

import { demoStore, findToast, resetDemoStore } from './toast-demo';

// Return in the field shows a toast without leaving it, so on a phone the
// on-screen keyboard stays open: the stack should sit above it.
function KeyboardDemo(props: Omit<ToasterProps, 'store'>) {
  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          demoStore.show('Message sent', { duration: Infinity });
        }}
      >
        <TextField>
          <Field className="w-80">
            <FieldLabel>Message</FieldLabel>
            <Input enterKeyHint="send" />
          </Field>
        </TextField>
      </form>
      <Toaster {...props} store={demoStore} />
    </>
  );
}

const meta = {
  beforeEach: resetDemoStore,
  component: KeyboardDemo,
  title: 'Feedback/Toast/Keyboard',
} satisfies Meta<typeof KeyboardDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

// For a hand check on a phone: focus the field, then send. The field keeps
// focus, so the keyboard stays up under the toast.
export const BottomStack: Story = {
  play: async ({ canvas }) => {
    const field = canvas.getByRole('textbox', { name: 'Message' });
    await userEvent.type(field, 'Hello{Enter}');
    await findToast('Message sent');
    await expect(field).toHaveFocus();
  },
};

export const TopStack: Story = {
  args: { placement: 'top center' },
  play: BottomStack.play,
};
