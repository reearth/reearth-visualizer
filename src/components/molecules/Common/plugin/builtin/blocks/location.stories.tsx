import React from "react";
import { Meta } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import Location from "./location";

export default {
  title: "molecules/Common/plugin/builtin/blocks/Location",
  component: Location,
} as Meta;

export const Default = () => <Location property={{ default: { location: { lat: 0, lng: 0 } } }} />;
export const Title = () => (
  <Location property={{ default: { location: { lat: 0, lng: 0 }, title: "Location" } }} />
);
export const NoLocation = () => <Location property={{ default: {} }} />;
export const Selected = () => <Location isSelected property={{ default: {} }} />;
export const Editable = () => (
  <Location
    isEditable
    property={{ default: { location: { lat: 0, lng: 0 } } }}
    onChange={action("onChange")}
  />
);
export const Built = () => <Location isBuilt property={{ default: {} }} />;
