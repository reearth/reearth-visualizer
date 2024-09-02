import { Meta } from "@storybook/react";

import Icon from ".";

const icon =
  '<svg stroke="white" fill="#00A0E8" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="css-1t9xarj" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';

export default {
  component: Icon
} as Meta;

export const Default = () => <Icon icon="file" size={20} />;
export const Color = () => <Icon icon="file" color="red" size={20} />;
export const Image = () => <Icon icon={`/sample.svg`} size={20} />;
export const Svg = () => <Icon icon={icon} size={20} />;
export const Wrapped = () => (
  <Icon icon={icon} size={20} style={{ background: "green" }} />
);
