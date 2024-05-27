import { action } from "@storybook/addon-actions";
import { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { Switcher, SwitcherProps } from ".";

const meta: Meta<SwitcherProps> = {
  component: Switcher,
};

export default meta;

type Story = StoryObj<SwitcherProps>;

export const On: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Switcher isOn={true} onClick={action("switcher-on-click")} />
    </div>
  ),
};

export const Off: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Switcher isOn={false} onClick={action("switcher-off-click")} />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Switcher isOn={false} onClick={action("switcher-disabled-off-click")} disabled={true} />
    </div>
  ),
};

const ToggleComponent: React.FC = () => {
  const [isOn, setIsOn] = useState(false);
  const handleClick = () => {
    action("switcher-toggle-click")();
    setIsOn((prev: boolean) => !prev);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Switcher isOn={isOn} onClick={handleClick} />
    </div>
  );
};

export const Toggle: Story = {
  render: () => <ToggleComponent />,
};
