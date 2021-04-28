import React from "react";
import { Math as CesiumMath } from "cesium";
import { Meta } from "@storybook/react";
import { V, location } from "../storybook";
import Splashscreen from "./splashscreen";

export default {
  title: "molecules/Common/plugin/builtin/widgetsSplashscreen",
  component: Splashscreen,
} as Meta;

export const Default = () => (
  <V location={location}>
    <Splashscreen
      isBuilt
      property={{
        overlay: {
          overlayEnabled: true,
          overlayDuration: 2,
          overlayTransitionDuration: 1,
          overlayDelay: 0.5,
          overlayImage: "/sample.svg",
          overlayImageW: 648,
          overlayImageH: 432,
        },
        camera: [
          {
            cameraPosition: {
              ...location,
              altitude: location.height,
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
              ...location,
              altitude: location.height,
              fov: CesiumMath.toRadians(60),
              heading: 90,
              pitch: 0,
              roll: 0,
            },
            cameraDelay: 3,
            cameraDuration: 3,
          },
        ],
      }}
    />
  </V>
);
