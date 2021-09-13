import React, { useCallback } from "react";

import Icon from "@reearth/components/atoms/Icon";
import { styled } from "@reearth/theme";
import fonts from "@reearth/theme/fonts";

import useHooks from "./hooks";

export type DatasetSchemaProps = {
  className?: string;
  id?: string;
  name?: string;
  totalCount?: number;
  onDrop?: (layerId: string, index?: number) => void;
  onRemove?: (schemaId: string) => void;
  selected?: boolean;
};

const DatasetSchemaCell: React.FC<DatasetSchemaProps> = ({
  className,
  id,
  onDrop,
  onRemove,
  name,
  totalCount,
  selected,
}) => {
  const ref = useHooks(onDrop);
  const handleRemove = useCallback(() => {
    if (!id || !window.confirm("Are you sure to remove this dataset?")) return;
    onRemove?.(id);
  }, [id, onRemove]);
  return (
    <Wrapper className={className} ref={ref} selected={selected}>
      <StyledIcon icon="dataset" size={16} />
      <Name>{name}</Name>
      <Count>({totalCount ?? ""})</Count>
      <div onClick={handleRemove}>
        <RemoveButton icon="bin" size={14} />
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.div<Pick<DatasetSchemaProps, "selected">>`
  background-color: ${props =>
    props.selected ? props.theme.layers.paleBg : props.theme.layers.bg};
  display: flex;
  align-items: center;
  font-size: ${fonts.sizes.xs}px;
  padding: 10px;
  border-radius: 3px;
  cursor: pointer;
  color: ${props => props.theme.leftMenu.text};
  user-select: none;
  &:hover {
    background-color: ${props => props.theme.layers.hoverBg};
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
