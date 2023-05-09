import { Meta } from "@storybook/react";

import DatasetList from ".";

const items = [
  { id: "1", name: "plugins-01.kml" },
  { id: "2", name: "plugins-02.kml" },
  { id: "3", name: "plugins-03.kml" },
  { id: "4", name: "plugins-04.kml" },
];

export default {
  title: "molecules/Settings/Workspace/Dataset/DatasetList",
  component: DatasetList,
} as Meta;

export const Default = () => (
  <DatasetList
    items={items}
    removeDatasetSchema={schemaId => console.log(`Removing dataset with ID ${schemaId}`)}
    onDownloadFile={(id, name) => console.log(`Downloading file with ID ${id} and name ${name}`)}
  />
);
