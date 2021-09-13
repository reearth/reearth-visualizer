import { Meta } from "@storybook/react";
import React from "react";

import DatasetSchemaCell from ".";

export default {
  title: "molecules/EarthEditor/DatasetPane/DatasetSchemaCell",
  component: DatasetSchemaCell,
} as Meta;

export const Default = () => <DatasetSchemaCell name="Hoge" totalCount={10} />;
