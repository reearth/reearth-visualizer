import React, { useCallback, useState } from "react";

import Flex from "@reearth/classic/components/atoms/Flex";
import Icon from "@reearth/classic/components/atoms/Icon";
import Text from "@reearth/classic/components/atoms/Text";
import { styled } from "@reearth/services/theme";

import DatasetDeleteModal from "../DatasetDeleteModal";

export type DatasetSchemaProps = {
  className?: string;
  id?: string;
  name?: string;
  totalCount?: number;
  onRemove?: (schemaId: string) => void;
  selected?: boolean;
  onDatasetSchemaSelect?: (datasetSchemaId: string) => void;
};

const DatasetSchemaCell: React.FC<DatasetSchemaProps> = ({
  className,
  id,
  onRemove,
  name,
  totalCount,
  selected,
  onDatasetSchemaSelect,
}) => {
  const [showDeleteModal, setDeleteModal] = useState(false);

  const handleSelect = useCallback(() => {
    if (!id) return;
    onDatasetSchemaSelect?.(id);
  }, [id, onDatasetSchemaSelect]);

  const handleToggleDeleteModal = useCallback(() => {
    setDeleteModal(!showDeleteModal);
  }, [showDeleteModal]);

  return (
    <Wrapper className={className} align="center" selected={selected} onClick={handleSelect}>
      <StyledIcon icon="dataset" size={16} />
      <Name size="xs">{name}</Name>
      <Count size="xs">({totalCount ?? ""})</Count>
      <RemoveButton icon="bin" size={14} onClick={handleToggleDeleteModal} />
      <DatasetDeleteModal
        onRemove={() => id && onRemove?.(id)}
        openModal={showDeleteModal}
        setModal={(show: boolean) => setDeleteModal(show)}
      />
    </Wrapper>
  );
};

const Wrapper = styled(Flex)<Pick<DatasetSchemaProps, "selected">>`
  background-color: ${({ selected, theme }) =>
    selected ? theme.classic.layers.selectedLayer : "transparent"};
  align-content: center;
  padding: 10px;
  border-radius: 3px;
  cursor: pointer;
  color: ${props => props.theme.classic.leftMenu.text};
  user-select: none;
  &:hover {
    background-color: ${({ theme }) => theme.classic.main.bg};
  }
`;

const StyledIcon = styled(Icon)`
  flex-shrink: 0;
  margin-right: 5px;
`;

const Name = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: auto;
`;

const Count = styled(Text)`
  padding-left: 0.5em;
`;

const RemoveButton = styled(Icon)`
  margin-left: 4px;
`;

export default DatasetSchemaCell;
