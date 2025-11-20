import { Meta, StoryObj } from "@storybook/react-vite";

import { TextArea, TextAreaProps } from ".";

const meta: Meta<TextAreaProps> = {
  component: TextArea
};

export default meta;
type Story = StoryObj<typeof TextArea>;

export const Default: Story = {
  args: {
    value: "Write down your content",
    rows: 3
  }
};

export const Rows: Story = {
  args: {
    placeholder: "Write down your content",
    rows: 5
  }
};

export const Placeholder: Story = {
  args: {
    placeholder: "Write down your content"
  }
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "Text Input"
  }
};

export const Counter: Story = {
  args: {
    counter: true,
    value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
  }
};

export const MaxLength: Story = {
  args: {
    counter: true,
    maxLength: 300,
    value:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
  }
};

export const HeightResizeable: Story = {
  args: {
    resizable: "height",
    value:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
  }
};
