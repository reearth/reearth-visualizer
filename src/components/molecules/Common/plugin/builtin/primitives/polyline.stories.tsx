import React from "react";
import { Meta } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import { V, location } from "../storybook";
import Polyline from "./polyline";

export default {
  title: "molecules/Common/plugin/builtin/primitivesPolyline",
  component: Polyline,
} as Meta;

export const Default = () => (
  <V location={location}>
    <Polyline
      isVisible
      onClick={action("onClick")}
      property={{
        default: {
          strokeColor: "#ccaa",
          strokeWidth: 10,
          coordinates: [
            { lat: 35.652832, lng: 139.839478, height: 100 },
            { lat: 36.652832, lng: 140.039478, height: 100 },
            { lat: 34.652832, lng: 141.839478, height: 100 },
          ],
        },
      }}
    />
  </V>
);
