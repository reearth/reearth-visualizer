import { action } from "@storybook/addon-actions";
import { Meta, StoryObj } from "@storybook/react";

import { RadioButton, RadioButtonProps } from ".";

const meta: Meta<RadioButtonProps> = {
  component: RadioButton
};

export default meta;

type Story = StoryObj<RadioButtonProps>;

const sampleItems = [
  { id: "option1", label: "Option 1" },
  { id: "option2", label: "Option 2" },
  { id: "option3", label: "Option 3" }
];

const itemsWithIcons = [
  { id: "desktop", label: "Desktop", icon: "desktop" as const },
  { id: "mobile", label: "Mobile", icon: "mobile" as const },
  { id: "tablet", label: "Tablet", icon: "deviceMobile" as const }
];

const itemsWithDisabled = [
  { id: "enabled1", label: "Enabled Option 1" },
  { id: "disabled1", label: "Disabled Option 1", disabled: true },
  { id: "enabled2", label: "Enabled Option 2" },
  { id: "disabled2", label: "Disabled Option 2", disabled: true }
];

export const Default: Story = {
  args: {
    items: sampleItems,
    value: "option1",
    onChange: action("changed")
  }
};

export const WithIcons: Story = {
  args: {
    items: itemsWithIcons,
    value: "desktop",
    onChange: action("changed")
  }
};

export const WithDisabledItems: Story = {
  args: {
    items: itemsWithDisabled,
    value: "enabled1",
    onChange: action("changed")
  }
};

export const NoSelection: Story = {
  args: {
    items: sampleItems,
    onChange: action("changed")
  }
};

export const Disabled: Story = {
  args: {
    items: sampleItems,
    value: "option2",
    disabled: true,
    onChange: action("changed")
  }
};

export const TwoButtons: Story = {
  args: {
    items: [
      { id: "option1", label: "Option 1" },
      { id: "option2", label: "Option 2" }
    ],
    value: "option2",
    onChange: action("changed")
  }
};

export const WithIconsAndSettings: Story = {
  args: {
    items: [
      { id: "option1", label: "Option 1", icon: "setting" },
      { id: "option2", label: "Option 2", icon: "setting" }
    ],
    value: "option2",
    onChange: action("changed")
  }
};