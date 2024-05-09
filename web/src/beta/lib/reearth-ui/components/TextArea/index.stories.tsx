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
  },
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: "Write down your content",
  },
};

export const withDefaultHeight: Story = {
  args: {
    filled: "default",
    value:
      "Write down your contentLorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
  },
};
export const withAutoSize: Story = {
  args: {
    filled: "autoSize",
    value:
      "Write down your contentLorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
  },
};
