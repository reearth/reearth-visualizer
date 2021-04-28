import React from "react";
import { Meta } from "@storybook/react";
import { V, location } from "../storybook";
import Navigator from "./navigator";

export default {
  title: "molecules/Common/plugin/builtin/widgetsNavigator",
  component: Navigator,
} as Meta;

export const Default = () => (
  <V location={location}>
    <Navigator />
  </V>
);
