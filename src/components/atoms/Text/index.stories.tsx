import { Meta, Story } from "@storybook/react";
import React from "react";

import Text, { TextProps } from ".";

export default {
  title: "atoms/Text",
  component: Text,
} as Meta;

export const LBold: Story<TextProps> = () => (
  <Text size="l" weight="bold">
    LBold
  </Text>
);
export const MParagraph: Story<TextProps> = () => (
  <Text size="m" isParagraph>
    MParagraph
  </Text>
);
export const MRegularRed: Story<TextProps> = () => (
  <Text size="m" color="red">
    MRegular red
  </Text>
);
export const MRegularRedBgBlue: Story<TextProps> = () => (
  <Text size="m" color="red" otherProperties={{ background: "blue", border: "solid 2px red" }}>
    MRegular red blue
  </Text>
);
