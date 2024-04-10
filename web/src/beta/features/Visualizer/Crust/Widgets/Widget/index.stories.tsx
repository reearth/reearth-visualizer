import { Meta, Story } from "@storybook/react";
import { Math as CesiumMath } from "cesium";

import { contextEvents } from "./storybook";

import Widget, { Props } from ".";

export default {
  component: Widget,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

export const Default: Story<Props> = args => <Widget {...args} />;

Default.args = {
  widget: {
    id: "",
    pluginId: "reearth",
    extensionId: "menu",
    extended: false,
    property: {
      buttons: [
        {
          id: "menu",
          buttonType: "menu",
          buttonTitle: "Menu",
          buttonPosition: "topleft",
          buttonStyle: "text",
        },
        {
          id: "google",
          buttonType: "link",
          buttonLink: "https://google.com",
          buttonTitle: "Google",
          buttonPosition: "topleft",
          buttonStyle: "text",
          buttonBgcolor: "red",
        },
        {
          id: "twitter",
          buttonType: "link",
          buttonLink: "https://twitter.com",
          buttonTitle: "Twitter",
          buttonPosition: "bottomright",
          buttonStyle: "text",
          buttonBgcolor: "#0ff",
        },
        {
          id: "hoge",
          buttonType: "camera",
          buttonPosition: "bottomright",
          buttonCamera: {
            lat: 0,
            lng: 0,
            height: 1000,
            fov: CesiumMath.toRadians(60),
            heading: 0,
            pitch: 0,
            roll: 0,
          },
          buttonTitle: "hoge",
        },
        {
          id: "menu2",
          buttonType: "menu",
          buttonIcon: "/sample.svg",
          buttonPosition: "bottomleft",
          buttonStyle: "icon",
        },
        {
          id: "menu3",
          buttonType: "menu",
          buttonTitle: "Menu",
          buttonIcon: "/sample.svg",
          buttonPosition: "bottomleft",
          buttonStyle: "texticon",
        },
      ],
      menu: [
        {
          id: "hoge",
          menuTitle: "Hoge",
          menuType: "camera",
          menuCamera: {
            lat: 0,
            lng: 0,
            height: 1000,
            fov: CesiumMath.toRadians(60),
            heading: 0,
            pitch: 0,
            roll: 0,
          },
        },
        {
          id: "hoge",
          menuType: "border",
        },
        {
          id: "GitHub",
          menuType: "link",
          menuTitle: "GitHub",
          menuLink: "https://github.com",
        },
      ],
    },
  },
  isBuilt: false,
  isEditable: false,
  context: { ...contextEvents },
};
