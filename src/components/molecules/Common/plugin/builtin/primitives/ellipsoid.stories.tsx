import React from "react";
import { Meta } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { V, location } from "../storybook";
import Ellipsoid from "./ellipsoid";

export default {
  title: "molecules/Common/plugin/builtin/primitivesEllipsoid",
  component: Ellipsoid,
} as Meta;

export const Default = () => (
  <V location={location}>
    <Ellipsoid
      isVisible
      onClick={action("onClick")}
      property={{
        default: {
          radius: 1000,
          fillColor: "#f00a",
          position: location,
          height: location.height,
        },
      }}
    />
  </V>
);
