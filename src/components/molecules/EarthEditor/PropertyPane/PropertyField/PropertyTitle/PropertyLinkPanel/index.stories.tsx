import React from "react";
import { Meta } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import PropertyLinkPanel, { DatasetSchema } from ".";

const datasetSchemas: DatasetSchema[] = [
  {
    id: "1",
    name: "Schema A",
    datasets: [
      { id: "d1", name: "Dataset 1" },
      { id: "d2", name: "Dataset 2" },
      { id: "d3", name: "Dataset 3" },
      { id: "d4", name: "Dataset 4" },
    ],
    fields: [
      { id: "f1", name: "Field 1", type: "string" },
      { id: "f2", name: "Field 2", type: "string" },
      { id: "f3", name: "Field 3", type: "latlng" },
      { id: "f4", name: "Field 4", type: "latlng" },
      { id: "f5", name: "Field 5", type: "number" },
      { id: "f6", name: "Field 6", type: "bool" },
      { id: "f7", name: "Field 7", type: "url" },
    ],
  },
  {
    id: "2",
    name: "Schema B",
    datasets: [
      { id: "d1", name: "Dataset 1" },
      { id: "d2", name: "Dataset 2" },
      { id: "d3", name: "Dataset 3" },
    ],
    fields: [{ id: "f1", name: "Field 1", type: "string" }],
  },
];

export default {
  title: "molecules/EarthEditor/PropertyPane/PropertyField/PropertyTitle/PropertyLinkPanel",
  component: PropertyLinkPanel,
} as Meta;

export const DatasetLinkable = () => (
  <PropertyLinkPanel
    datasetSchemas={datasetSchemas}
    onClear={action("onClear")}
    onLink={action("onLink")}
    isLinkable={true}
  />
);
export const ChildLinked = () => (
  <PropertyLinkPanel
    datasetSchemas={datasetSchemas}
    linkedDataset={{
      schema: "File.csv",
      dataset: "datasetnumbers1234",
      field: "height",
    }}
    linkableType="string"
    onClear={action("onClear")}
    onLink={action("onLink")}
  />
);
export const ChildOverridden = () => (
  <PropertyLinkPanel
    datasetSchemas={datasetSchemas}
    linkedDataset={{
      schema: "1",
      dataset: "d2",
      field: "color",
    }}
    isOverridden
    onClear={action("onClear")}
    onLink={action("onLink")}
  />
);
export const NotLinkable = () => (
  <PropertyLinkPanel onClear={action("onClear")} onLink={action("onLink")} />
);
