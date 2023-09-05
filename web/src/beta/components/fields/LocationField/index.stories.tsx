import { action } from "@storybook/addon-actions";
import { Meta, StoryObj } from "@storybook/react";

import LocationField from ".";

const meta: Meta<typeof LocationField> = {
  component: LocationField,
};

export default meta;

type Story = StoryObj<typeof LocationField>;

export const LocationFieldUI: Story = {
  render: () => (
    <LocationField name="Location" description="The Location field" onChange={action("onchange")} />
  ),
};
