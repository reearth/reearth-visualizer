import { Meta, StoryObj } from "@storybook/react";

import LocationField from ".";

const meta: Meta<typeof LocationField> = {
  component: LocationField,
};

export default meta;

type Story = StoryObj<typeof LocationField>;

export const Sample: Story = {
  args: {
    name: "Location Field",
    description: "Location field description",
    value: { lat: 87.43, lng: 107.53 },
    onChange: () => console.log("clicked"),
  },
};
