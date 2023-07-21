import { Meta, StoryObj } from "@storybook/react";
import { ReactNode } from "react";

import Dropdown, { Menu } from ".";

const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div style={{ width: "100px", height: "60px" }}>{children}</div>
);

const meta: Meta<typeof Dropdown> = {
  component: Dropdown,
};

export default meta;

type Story = StoryObj<typeof Dropdown>;

const menu: Menu = {
  width: 200,
  items: [{ text: "HARHAR" }, { text: "HARHAR" }, { text: "HARHAR" }],
};

export const Default: Story = {
  render: () => (
    <Wrapper>
      <Dropdown isOpen label="Sample" menu={menu} />
    </Wrapper>
  ),
};

export const DirectionRight: Story = {
  render: () => (
    <Wrapper>
      <Dropdown isOpen direction="right" label="Sample" menu={menu} />
    </Wrapper>
  ),
};
export const DirectionDown: Story = {
  render: () => (
    <Wrapper>
      <Dropdown isOpen direction="down" label="Sample" menu={menu} />
    </Wrapper>
  ),
};
