import { Meta, StoryObj } from "@storybook/react";
import { ReactNode } from "react";

import Dropdown from ".";

const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div style={{ width: "100px", height: "60px" }}>{children}</div>
);

const meta: Meta<typeof Dropdown> = {
  component: Dropdown,
};

export default meta;

type Story = StoryObj<typeof Dropdown>;

const DropDownContent: React.FC = () => {
  return (
    <ul>
      <li>Apple</li>
      <li>Banana</li>
      <li>Orange</li>
    </ul>
  );
};

export const Default: Story = {
  render: () => (
    <Wrapper>
      <Dropdown isOpen label="Sample">
        <DropDownContent />
      </Dropdown>
    </Wrapper>
  ),
};

export const DirectionRight: Story = {
  render: () => (
    <Wrapper>
      <Dropdown isOpen direction="right" label="Sample">
        <DropDownContent />
      </Dropdown>
    </Wrapper>
  ),
};
export const DirectionDown: Story = {
  render: () => (
    <Wrapper>
      <Dropdown isOpen direction="down" label="Sample">
        <DropDownContent />
      </Dropdown>
    </Wrapper>
  ),
};
