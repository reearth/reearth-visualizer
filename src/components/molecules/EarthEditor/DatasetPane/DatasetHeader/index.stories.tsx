import { Meta } from "@storybook/react";
import React from "react";

import DatasetHeader from ".";

export default {
  title: "molecules/EarthEditor/DatasetPane/DatasetHeader",
  component: DatasetHeader,
} as Meta;

export const Default = () => <DatasetHeader host="Hoge" />;
