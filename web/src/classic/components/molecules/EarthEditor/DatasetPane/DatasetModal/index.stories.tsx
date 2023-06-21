import { Meta } from "@storybook/react";

import DatasetModal from ".";

export default {
  title: "classic/molecules/EarthEditor/DatasetPane/DatasetModal",
  component: DatasetModal,
} as Meta;

export const Default = () => <DatasetModal isVisible syncLoading={false} />;
