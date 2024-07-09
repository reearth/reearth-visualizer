import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";

import DatasetList from ".";

const items = [
  { id: "1", name: "plugins-01.kml" },
  { id: "2", name: "plugins-02.kml" },
  { id: "3", name: "plugins-03.kml" },
  { id: "4", name: "plugins-04.kml" },
];

export default {
  title: "classic/molecules/Settings/Workspace/Dataset/DatasetList",
  component: DatasetList,
} as Meta;

export const Default = () => (
  <DatasetList
    items={items}
    removeDatasetSchema={action("removeDatasetSchema")}
    onDownloadFile={action("onDownloadFile")}
  />
);
