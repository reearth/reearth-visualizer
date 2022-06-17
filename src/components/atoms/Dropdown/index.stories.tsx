import { Meta } from "@storybook/react";
import { ReactNode } from "react";

import Dropdown from ".";

const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div style={{ width: "100px", height: "60px" }}>{children}</div>
);

export default {
  title: "atoms/Dropdown",
  component: Dropdown,
} as Meta;

export const Default = () => (
  <Wrapper>
    <Dropdown isOpen label="Sample">
      <ul>
        <li>Apple</li>
        <li>Banana</li>
        <li>Orange</li>
      </ul>
    </Dropdown>
  </Wrapper>
);

export const DirectionRight = () => (
  <Wrapper>
    <Dropdown isOpen label="Sample" direction="right">
      <ul>
        <li>Apple</li>
        <li>Banana</li>
        <li>Orange</li>
      </ul>
    </Dropdown>
  </Wrapper>
);
