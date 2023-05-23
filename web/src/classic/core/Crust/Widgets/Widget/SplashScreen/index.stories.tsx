import { Meta, Story } from "@storybook/react";
import { Math as CesiumMath } from "cesium";

import { contextEvents } from "../storybook";

import SplashScreen, { Props } from ".";

export default {
  component: SplashScreen,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

export const Default: Story<Props> = args => <SplashScreen {...args} />;

Default.args = {
  widget: {
    id: "",
    property: {
      overlay: {
        overlayEnabled: true,
        overlayDuration: 2,
        overlayTransitionDuration: 1,
        overlayDelay: 0.5,
        overlayImage: `/sample.svg`,
        overlayImageW: 648,
        overlayImageH: 432,
        overlayBgcolor: "#fff8",
      },
      camera: [
        {
          cameraPosition: {
            lat: 0,
            lng: 0,
            height: 1000,
            fov: CesiumMath.toRadians(60),
            heading: 0,
            pitch: 0,
            roll: 0,
          },
          cameraDelay: 3,
          cameraDuration: 3,
        },
        {
          cameraPosition: {
            lat: 0,
            lng: 0,
            height: 1000,
            fov: CesiumMath.toRadians(60),
            heading: 90,
            pitch: 0,
            roll: 0,
          },
          cameraDelay: 3,
          cameraDuration: 3,
        },
      ],
    },
  },
  context: { ...contextEvents },
  isBuilt: true,
  isEditable: false,
};
