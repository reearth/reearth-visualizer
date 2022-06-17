import { Meta } from "@storybook/react";

import Avatar from ".";

export default {
  title: "atoms/Avatar",
  component: Avatar,
} as Meta;

export const Default = () => <Avatar innerText="ReEarth" />;
export const Large = () => <Avatar size="large" innerText="ReEarth" />;
