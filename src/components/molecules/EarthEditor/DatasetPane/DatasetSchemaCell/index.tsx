import React, { useCallback, useState } from "react";

import Icon from "@reearth/components/atoms/Icon";
import { styled, fonts } from "@reearth/theme";

import DatasetDeleteModal from "../DatasetDeleteModal";

export type DatasetSchemaProps = {
  className?: string;
  id?: string;
  name?: string;
  totalCount?: number;
  onRemove?: (schemaId: string) => void;
  selected?: boolean;
  selectDatasetSchema?: (datasetSchemaId: string) => void;
};

const DatasetSchemaCell: React.FC<DatasetSchemaProps> = ({
  className,
  id,
  onRemove,
  name,
  totalCount,
  selected,
  selectDatasetSchema,
}) => {
  const handleSelect = useCallback(() => {
    if (!id) return;
    selectDatasetSchema?.(id);
  }, [id, selectDatasetSchema]);
  const [showDeleteModal, setDeleteModal] = useState(false);

  return (
    <Wrapper className={className} selected={selected} onClick={handleSelect}>
      <StyledIcon icon="dataset" size={16} />
      <Name>{name}</Name>
      <Count>({totalCount ?? ""})</Count>
      <div onClick={() => setDeleteModal(!showDeleteModal)}>
        <RemoveButton icon="bin" size={14} />
      </div>
      <DatasetDeleteModal
        onRemove={() => id && onRemove?.(id)}
        openModal={showDeleteModal}
        setModal={(show: boolean) => setDeleteModal(show)}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div<Pick<DatasetSchemaProps, "selected">>`
  background-color: ${({ selected, theme }) =>
    selected ? theme.layers.selectedLayer : "transparent"};
  display: flex;
  align-items: center;
  font-size: ${fonts.sizes.xs}px;
  padding: 10px;
  border-radius: 3px;
  cursor: pointer;
  color: ${props => props.theme.leftMenu.text};
  user-select: none;
  &:hover {
    background-color: ${({ theme }) => theme.main.bg};
  }
`;

const StyledIcon = styled(Icon)`
  flex-shrink: 0;
  padding-right: 0.5em;
`;

const Name = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: auto;
`;

const Count = styled.div`
  font-size: 0.8em;
  padding-left: 0.5em;
`;

const RemoveButton = styled(Icon)`
  margin-left: 4px;
`;

export default DatasetSchemaCell;
