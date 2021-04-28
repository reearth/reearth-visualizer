import React from "react";
import { Meta } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { Math as CesiumMath } from "cesium";

import { V, location } from "../storybook";
import PhotoOverlay from "./photooverlay";

export default {
  title: "molecules/Common/plugin/builtin/primitivesPhotoOverlay",
  component: PhotoOverlay,
} as Meta;

export const Default = () => (
  <V location={location}>
    <PhotoOverlay
      isVisible
      onClick={action("onClick")}
      property={{
        default: {
          location,
          image: "/sample.svg",
          imageSize: 0.01,
          photoOverlayImage: "/sample.svg",
          camera: {
            ...location,
            altitude: location.height,
            fov: CesiumMath.toRadians(30),
            heading: 0,
            pitch: 0,
            roll: 0,
          },
        },
      }}
    />
  </V>
);
export const Built = () => (
  <V location={location}>
    <PhotoOverlay
      isVisible
      isBuilt
      onClick={action("onClick")}
      property={{
        default: {
          location,
          image: "/sample.svg",
          imageSize: 0.01,
          photoOverlayImage: "/sample.svg",
          camera: {
            ...location,
            altitude: location.height,
            fov: CesiumMath.toRadians(30),
            heading: 0,
            pitch: 0,
            roll: 0,
          },
        },
      }}
    />
  </V>
);
