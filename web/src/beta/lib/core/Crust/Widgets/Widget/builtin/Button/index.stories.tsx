import { Meta, Story } from "@storybook/react";
import { Math as CesiumMath } from "cesium";

import { contextEvents } from "../../storybook";

import Button, { Props } from ".";

export default {
  component: Button,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

export const Default: Story<Props> = args => <Button {...args} />;

Default.args = {
  widget: {
    id: "",
    property: {
      menu: [
        {
          id: "hoge",
          menuTitle: {
            value: "Hoge",
          },
          menuType: { value: "camera" },
          menuCamera: {
            value: {
              lat: 0,
              lng: 0,
              height: 1000,
              fov: CesiumMath.toRadians(60),
              heading: 0,
              pitch: 0,
              roll: 0,
            },
          },
        },
        {
          id: "hoge",
          menuType: { value: "border" },
        },
        {
          id: "GitHub",
          menuType: { value: "link" },
          menuTitle: { value: "GitHub" },
          menuLink: { value: "https://github.com" },
        },
      ],
    },
  },
  context: { ...contextEvents },
  isBuilt: false,
  isEditable: false,
};
