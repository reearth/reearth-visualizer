import { Meta, Story } from "@storybook/react";
import { useRef } from "react";

import { engine } from "../engines/Cesium";
import Map, { Engine } from "../Map";

import { MapRef } from "./types";

import Component, { Props } from ".";

export default {
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<Props & { engine: Engine }> = args => {
  const ref = useRef<MapRef>(null);
  return (
    <>
      <Map engine="a" engines={{ a: engine }} ref={ref} />
      <Component {...args} mapRef={ref} />
    </>
  );
};

export const Cesium = Template.bind({});

Cesium.args = {
  engine: engine,
};
