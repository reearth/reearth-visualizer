import { Meta, Story } from "@storybook/react";
import { Math as CesiumMath } from "cesium";

import { Provider } from "../../storybook";

import SplashScreen, { Props } from ".";

export default {
  title: "molecules/Visualizer/Widget/SplashScreen",
  component: SplashScreen,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

export const Default: Story<Props> = args => (
  <Provider>
    <SplashScreen {...args} />
  </Provider>
);

Default.args = {
  widget: {
    id: "",
    property: {
      overlay: {
        overlayEnabled: true,
        overlayDuration: 2,
        overlayTransitionDuration: 1,
        overlayDelay: 0.5,
        overlayImage: `${process.env.PUBLIC_URL}/sample.svg`,
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
  isBuilt: true,
  isEditable: false,
};
