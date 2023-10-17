import { action } from "@storybook/addon-actions";
import { Meta, StoryObj } from "@storybook/react";

import DateTimeField from ".";

const meta: Meta<typeof DateTimeField> = {
  component: DateTimeField,
};

export default meta;

type Story = StoryObj<typeof DateTimeField>;

export const DateTimeFieldInput: Story = {
  render: () => <DateTimeField name="Date Time Field" onChange={action("onchange")} />,
};
