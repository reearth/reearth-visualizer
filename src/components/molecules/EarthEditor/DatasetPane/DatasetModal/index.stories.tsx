import { Meta } from "@storybook/react";
import React from "react";

import DatasetModal from ".";

export default {
  title: "molecules/EarthEditor/DatasetPane/DatasetModal",
  component: DatasetModal,
} as Meta;

export const Default = () => <DatasetModal isVisible syncLoading={false} />;
