import React from "react";

import DatasetItem from "@reearth/components/molecules/Settings/Project/Dataset/DatasetItem";
import { styled } from "@reearth/theme";

export type Item = {
  id: string;
  name: string;
};

export type Props = {
  items: Item[];
  removeDatasetSchema?: (schemaId: string) => void;
};

const DatasetList: React.FC<Props> = ({ items, removeDatasetSchema }) => {
  return (
    <Wrapper>
      {items.map(item => (
        <DatasetItem key={item.id} {...item} removeDatasetSchema={removeDatasetSchema} />
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 250px 250px 250px;
  grid-gap: 20px;
`;

export default DatasetList;
