import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  FieldDescription,
  FieldLabel,
} from '@oakoss/ui/components/ui/inputs/field';
import { Slider, SliderTrack } from '@oakoss/ui/components/ui/inputs/slider';
import { useState } from 'react';
import { Text } from 'react-aria-components';
import { expect, userEvent, waitFor } from 'storybook/test';

// Storybook reads props from a component, not a generic one.
const SingleSlider = Slider<number>;

const meta = {
  args: { className: 'w-80', defaultValue: 40, label: 'Volume' },
  component: SingleSlider,
  title: 'Inputs/Slider/Description',
} satisfies Meta<typeof SingleSlider>;

export default meta;

type Story = StoryObj<typeof meta>;

// React Aria's Slider has no description slot; the slider links one to every
// thumb, ahead of any description the consumer points at.
export const Description: Story = {
  play: async ({ canvas }) => {
    for (const thumb of canvas.getAllByRole('slider')) {
      await expect(thumb).toHaveAccessibleDescription(
        'Applies to every speaker. Changes save at once.',
      );
    }
  },
  render: () => (
    <>
      <Slider
        aria-describedby="volume-note"
        className="w-80"
        defaultValue={[20, 80]}
        description="Applies to every speaker."
        label="Volume"
        thumbLabels={['Low', 'High']}
      />
      <p id="volume-note">Changes save at once.</p>
    </>
  ),
};

// A description that renders nothing mounts nothing to point at.
export const EmptyDescription: Story = {
  args: { description: <>{false}</> },
  play: async ({ canvas, canvasElement }) => {
    // React Aria writes the attribute even when empty.
    await expect(canvas.getByRole('slider')).toHaveAttribute(
      'aria-describedby',
      '',
    );
    await expect(
      canvasElement.querySelector('[data-slot=field-description]'),
    ).toBeNull();
  },
};

function ToggledNote() {
  const [isShown, setIsShown] = useState(true);
  return (
    <>
      <Slider className="w-80" defaultValue={40}>
        <FieldLabel>Volume</FieldLabel>
        <SliderTrack />
        {isShown ? (
          <FieldDescription>Applies to every speaker.</FieldDescription>
        ) : null}
      </Slider>
      <Button onPress={() => setIsShown(false)}>Hide note</Button>
    </>
  );
}

// A description that unmounts takes its link with it.
export const Unmounts: Story = {
  play: async ({ canvas }) => {
    const thumb = canvas.getByRole('slider', { name: 'Volume' });
    await expect(thumb).toHaveAccessibleDescription(
      'Applies to every speaker.',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Hide note' }));
    await expect(thumb).toHaveAttribute('aria-describedby', '');
  },
  render: () => <ToggledNote />,
};

// A description with its own id keeps it, and the thumbs point at that id.
export const OwnId: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('slider')).toHaveAccessibleDescription(
      'Applies to every speaker.',
    );
    await expect(canvas.getByRole('slider')).toHaveAttribute(
      'aria-describedby',
      'volume-note',
    );
  },
  render: () => (
    <Slider className="w-80" defaultValue={40}>
      <FieldLabel>Volume</FieldLabel>
      <SliderTrack />
      <FieldDescription id="volume-note">
        Applies to every speaker.
      </FieldDescription>
    </Slider>
  ),
};

function ChangingNoteId() {
  const [version, setVersion] = useState(1);
  return (
    <>
      <Slider className="w-80" defaultValue={40}>
        <FieldLabel>Volume</FieldLabel>
        <SliderTrack />
        <FieldDescription id={`note-${version}`}>
          Applies to every speaker.
        </FieldDescription>
      </Slider>
      <Button onPress={() => setVersion(2)}>Change id</Button>
    </>
  );
}

// A description whose id changes while mounted keeps its link.
export const IdChanges: Story = {
  play: async ({ canvas }) => {
    const thumb = canvas.getByRole('slider', { name: 'Volume' });
    await userEvent.click(canvas.getByRole('button', { name: 'Change id' }));
    await waitFor(() =>
      expect(thumb).toHaveAttribute('aria-describedby', 'note-2'),
    );
    await expect(thumb).toHaveAccessibleDescription(
      'Applies to every speaker.',
    );
  },
  render: () => <ChangingNoteId />,
};

// Text with no slot is plain text, not a description, and doesn't throw.
export const PlainText: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Drag or use the arrow keys.')).toBeVisible();
    await expect(canvas.getByRole('slider')).toHaveAttribute(
      'aria-describedby',
      '',
    );
  },
  render: () => (
    <Slider className="w-80" defaultValue={40}>
      <FieldLabel>Volume</FieldLabel>
      <SliderTrack />
      <Text>Drag or use the arrow keys.</Text>
    </Slider>
  ),
};
