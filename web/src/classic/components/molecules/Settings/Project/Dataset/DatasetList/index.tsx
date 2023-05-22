import React from "react";

import DatasetItem from "@reearth/classic/components/molecules/Settings/Project/Dataset/DatasetItem";
import { styled } from "@reearth/services/theme";

export type Item = {
  id: string;
  name: string;
};

export type Props = {
  items: Item[];
  isLoading?: boolean;
  hasMore?: boolean;
  removeDatasetSchema?: (schemaId: string) => void;
  onGetMoreDataSets?: () => void;
  onDownloadFile?: (id: string, name: string, onLoad: () => void) => void;
};

const DatasetList: React.FC<Props> = ({ items, removeDatasetSchema, onDownloadFile }) => {
  return (
    <Wrapper>
      {items.map(item => (
        <DatasetItem
          key={item.id}
          {...item}
          removeDatasetSchema={removeDatasetSchema}
          onDownloadFile={onDownloadFile}
        />
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 250px 250px 250px;
  grid-gap: 20px;
  overflow: auto;
`;

export default DatasetList;
