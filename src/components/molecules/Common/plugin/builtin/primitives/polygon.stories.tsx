import React from "react";
import { Meta } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { V, location } from "../storybook";
import Polygon from "./polygon";

export default {
  title: "molecules/Common/plugin/builtin/primitivesPolygon",
  component: Polygon,
} as Meta;

export const Default = () => (
  <V location={location}>
    <Polygon
      isVisible
      onClick={action("onClick")}
      property={{
        default: {
          fill: true,
          fillColor: "#ffffffaa",
          stroke: true,
          strokeColor: "red",
          strokeWidth: 10,
          polygon: [
            [
              { lat: 35.652832, lng: 139.839478, height: 100 },
              { lat: 36.652832, lng: 140.039478, height: 100 },
              { lat: 34.652832, lng: 141.839478, height: 100 },
            ],
          ],
        },
      }}
    />
  </V>
);
