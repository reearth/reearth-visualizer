import { Meta } from "@storybook/react";
import React from "react";

import Avatar from ".";

export default {
  title: "molecules/Settings/Avatar",
  component: Avatar,
} as Meta;

export const Default = () => <Avatar size={24}>😄</Avatar>;
