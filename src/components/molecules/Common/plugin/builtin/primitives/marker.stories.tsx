import React from "react";
import { Meta } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import { V, location } from "../storybook";
import Marker from "./marker";

export default {
  title: "molecules/Common/plugin/builtin/primitivesMarker",
  component: Marker,
} as Meta;

export const Point = () => (
  <V location={location}>
    <Marker
      isVisible
      property={{
        default: {
          location,
          height: location.height,
          style: "point",
          pointColor: "blue",
          pointSize: 50,
        },
      }}
      onClick={action("onClick")}
    />
  </V>
);
export const PointWithLabelAndExcluded = () => (
  <V location={location}>
    <Marker
      isVisible
      property={{
        default: {
          location,
          height: location.height,
          style: "point",
          pointColor: "blue",
          pointSize: 50,
          extrude: true,
          label: true,
          labelText: "label",
        },
      }}
      onClick={action("onClick")}
    />
  </V>
);
export const PointWithRightLabel = () => (
  <V location={location}>
    <Marker
      isVisible
      property={{
        default: {
          location,
          height: location.height,
          style: "point",
          label: true,
          labelText: "label",
          labelPosition: "right",
          labelTypography: {
            fontSize: 15,
            color: "red",
            bold: true,
            italic: true,
            fontFamily: "serif",
          },
        },
      }}
      onClick={action("onClick")}
    />
  </V>
);
export const PointWithTopLabel = () => (
  <V location={location}>
    <Marker
      isVisible
      property={{
        default: {
          location,
          height: location.height,
          style: "point",
          label: true,
          labelText: "label",
          labelPosition: "top",
          labelTypography: {
            fontFamily: "serif",
          },
        },
      }}
      onClick={action("onClick")}
    />
  </V>
);
export const PointWithBottomLabel = () => (
  <V location={location}>
    <Marker
      isVisible
      property={{
        default: {
          location,
          height: location.height,
          style: "point",
          label: true,
          labelText: "label",
          labelPosition: "bottom",
        },
      }}
      onClick={action("onClick")}
    />
  </V>
);
export const Image = () => (
  <V location={location}>
    <Marker
      isVisible
      property={{
        default: {
          location,
          height: location.height,
          style: "image",
          image: "/sample.svg",
          imageSize: 0.01,
        },
      }}
      onClick={action("onClick")}
    />
  </V>
);
export const ImageWithShadow = () => (
  <V location={location}>
    <Marker
      isVisible
      property={{
        default: {
          location,
          height: location.height,
          style: "image",
          image: "/sample.svg",
          imageSize: 0.02,
          imageShadow: true,
        },
      }}
      onClick={action("onClick")}
    />
  </V>
);
export const ImageWithCropAndShadow = () => (
  <V location={location}>
    <Marker
      isVisible
      property={{
        default: {
          location,
          height: location.height,
          style: "image",
          image: "/sample.svg",
          imageSize: 0.012,
          imageCrop: "circle",
          imageShadow: true,
          extrude: true,
        },
      }}
      onClick={action("onClick")}
    />
  </V>
);
