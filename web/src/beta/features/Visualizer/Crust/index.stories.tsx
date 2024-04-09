import { Meta, Story } from "@storybook/react";
import { useRef } from "react";

import { engine } from "../../../lib/core/engines/Cesium";
import Map, { Engine } from "../../../lib/core/Map";
import {
  InteractionModeType,
  INTERACTION_MODES,
} from "../../../lib/core/Visualizer/interactionMode";

import { MapRef } from "./types";

import Component, { Props } from ".";

export default {
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<Props & { engine: Engine; interactionMode: InteractionModeType }> = args => {
  const ref = useRef<MapRef>(null);
  return (
    <>
      <Map
        engine="a"
        engines={{ a: engine }}
        ref={ref}
        featureFlags={INTERACTION_MODES[args.interactionMode]}
      />
      <Component {...args} mapRef={ref} />
    </>
  );
};

export const Cesium = Template.bind({});

Cesium.args = {
  engine: engine,
};
