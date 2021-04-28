import React from "react";
import { Meta } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import { V, location } from "../storybook";
import Resource from "./resource";

export default {
  title: "molecules/Common/plugin/builtin/primitivesResource",
  component: Resource,
} as Meta;

export const Default = () => (
  <V location={location}>
    <Resource
      isVisible
      onClick={action("onClick")}
      property={{
        default: {
          url: "/sample.geojson",
        },
      }}
    />
  </V>
);
