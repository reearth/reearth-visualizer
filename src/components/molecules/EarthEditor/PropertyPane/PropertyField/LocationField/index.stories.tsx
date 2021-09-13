import { Meta } from "@storybook/react";
import React from "react";

// Components
import LocationField, { Location } from ".";

const location: Location = {
  lat: 36.5,
  lng: 137.34,
  height: 20,
};

export default {
  title: "molecules/EarthEditor/PropertyPane/PropertyField/LocationField",
  component: LocationField,
} as Meta;

export const Default = () => <LocationField value={location} />;
