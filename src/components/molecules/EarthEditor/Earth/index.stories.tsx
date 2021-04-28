import React from "react";
import { Meta } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import Earth, { EarthLayer } from ".";

const layers: EarthLayer[] = [
  {
    pluginId: "hogehoge",
    extensionId: "foobar",
    id: "layer1",
    pluginProperty: {},
    title: "hoge",
    property: {
      location: { lat: 35.3929, lng: 139.4428 },
      title: "foobar",
      description: "foobar!!!",
      line: true,
    },
  },
  {
    pluginId: "fugafuga",
    extensionId: "marker",
    id: "layer2",
    pluginProperty: {},
    title: "hoge",
    property: {
      location: { lat: 34.3929, lng: 139.4428 },
      title: "foobar",
      description: "foobar!!!",
      line: true,
    },
  },
];

export default {
  title: "molecules/EarthEditor/Earth",
  component: Earth,
} as Meta;

export const Default = () => <Earth layers={layers} onLayerSelect={action("onLayerSelect")} />;
