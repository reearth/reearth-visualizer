import { Meta, StoryObj } from "@storybook/react";

import { TextArea, TextAreaProps } from ".";

const meta: Meta<TextAreaProps> = {
  component: TextArea,
};

export default meta;
type Story = StoryObj<typeof TextArea>;

export const Default: Story = {
  args: {
    value: "Write down your content",
    rows: 3,
  },
};

export const withFourRows: Story = {
  args: {
    placeholder: "Write down your content",
    rows: 4,
  },
};

export const withFiveRows: Story = {
  args: {
    placeholder: "Write down your content",
    rows: 5,
  },
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: "Write down your content",
  },
};

export const withDisable: Story = {
  args: {
    disabled: true,
    value: "Text Input",
  },
};

export const withCounterSize: Story = {
  args: {
    counter: true,
    value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
};

export const withMaxLength: Story = {
  args: {
    counter: true,
    maxLength: 300,
    value:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
  },
};

export const withHeight: Story = {
  args: {
    resizable: "height",
    value:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
  },
};
