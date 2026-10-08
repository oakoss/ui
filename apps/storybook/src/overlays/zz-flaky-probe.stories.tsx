import type { Meta, StoryObj } from '@storybook/react-vite';

// TEMP(ui-vqz): fails its first attempt so CI's retry passes it, to check the
// Flaky Tests job summary lists it. Remove once confirmed.
const attempts = { count: 0 };

const meta = {
  render: () => <p>Flaky probe</p>,
  title: 'Probe/Flaky',
} satisfies Meta;

export default meta;

export const PassesOnRetry: StoryObj<typeof meta> = {
  play: () => {
    attempts.count += 1;
    if (attempts.count === 1) throw new Error('first attempt fails');
  },
};
