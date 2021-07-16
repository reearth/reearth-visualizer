import React from "react";
import { Meta } from "@storybook/react";
import { Math as CesiumMath } from "cesium";

import { V, location } from "../storybook";
import Menu, { Property } from "./menu";

const property: Property = {
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
        ...location,
        altitude: location.height,
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
    {
      id: "emptyurl",
      buttonType: "link",
      buttonTitle: "Empty URL",
    },
  ],
  menu: [
    {
      id: "hoge",
      menuTitle: "Hoge",
      menuType: "camera",
      menuCamera: {
        ...location,
        altitude: location.height,
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
};

export default {
  title: "molecules/Common/plugin/builtin/widgetsMenu",
  component: Menu,
} as Meta;

export const Default = () => (
  <V location={location}>
    <Menu property={property} />
  </V>
);
