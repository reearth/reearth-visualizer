import React from "react";
import { Cartesian3 } from "cesium";
import { Entity } from "resium";
import { Meta, Story } from "@storybook/react";

import { V, location } from "../storybook";
import Component, { Property } from "./storytelling";
import { WidgetProps } from "../../PluginWidget";
import { PluginProperty } from ".";

const property: Property = {
  stories: [{ title: "a" }, { title: "b" }, { title: "c" }].map(story => story),
};

export default {
  title: "molecules/Common/plugin/builtin/widgetsStoryTelling",
  component: Component,
} as Meta;

export const Default: Story<WidgetProps<Property, PluginProperty>> = args => (
  <V location={location}>
    <Entity
      id="a"
      name="A"
      position={Cartesian3.fromDegrees(130, 30, 0)}
      point={{ pixelSize: 20 }}
    />
    <Entity
      id="b"
      name="B"
      position={Cartesian3.fromDegrees(100, 30, 0)}
      point={{ pixelSize: 20 }}
    />
    <Entity id="c" name="C" position={Cartesian3.fromDegrees(0, 30, 0)} point={{ pixelSize: 20 }} />
    <Component {...args} property={property} />
  </V>
);

export const AutoStart: Story<WidgetProps<Property, PluginProperty>> = args => (
  <V location={location}>
    <Entity
      id="a"
      name="A"
      position={Cartesian3.fromDegrees(130, 30, 0)}
      point={{ pixelSize: 20 }}
    />
    <Entity
      id="b"
      name="B"
      position={Cartesian3.fromDegrees(100, 30, 0)}
      point={{ pixelSize: 20 }}
    />
    <Entity id="c" name="C" position={Cartesian3.fromDegrees(0, 30, 0)} point={{ pixelSize: 20 }} />
    <Component
      {...args}
      property={{ ...property, default: { ...property.default, autoStart: true } }}
    />
  </V>
);

export const WidgetOnly: Story<WidgetProps<Property, PluginProperty>> = args => (
  <Component {...args} property={property} />
);
