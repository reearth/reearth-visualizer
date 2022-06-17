import { Meta, Story } from "@storybook/react";

import Component, { Props } from ".";

export default {
  title: "atoms/Box",
  component: Component,
} as Meta;

export const Margin: Story<Props> = () => (
  <Component m="l">
    <div>Margin</div>
  </Component>
);
export const Padding: Story<Props> = () => (
  <Component p="l">
    <div>Padding</div>
  </Component>
);
export const Border: Story<Props> = () => (
  <Component border="solid 5px red">
    <div>Border</div>
  </Component>
);
export const Bg: Story<Props> = () => (
  <Component bg="red">
    <div>Bg</div>
  </Component>
);
