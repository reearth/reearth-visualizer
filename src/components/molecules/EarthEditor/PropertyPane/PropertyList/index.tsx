import React from "react";
import { useIntl } from "react-intl";

import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import TreeView, { Props as TreeViewProps } from "@reearth/components/atoms/TreeView";
import { styled } from "@reearth/theme";

import LayerMultipleSelectionModal from "../../LayerMultipleSelectionModal";
import type { Layer as LayerType } from "../PropertyItem";

import useHooks from "./hooks";
import PropertyListItem, { Item as ItemType } from "./item";

export type Item = ItemType & { layerId?: string };
export type Layer = LayerType;

export type Props = {
  className?: string;
  name?: string;
  items?: Item[];
  selectedIndex?: number;
  layers?: LayerType[];
  layerMode?: boolean;
  onItemSelect?: (index: number) => void;
  onItemAdd?: (defaultValue?: string) => void;
  onItemMove?: (from: number, to: number) => void;
  onItemRemove?: (index: number) => void;
  onItemsUpdate?: (
    items: {
      itemId?: string;
      layerId?: string;
      from: number;
      to: number;
    }[],
  ) => void;
};

const PropertyList: React.FC<Props> = ({
  className,
  name,
  items = [],
  layers,
  layerMode,
  selectedIndex,
  onItemSelect,
  onItemAdd,
  onItemMove,
  onItemRemove,
  onItemsUpdate,
}) => {
  const intl = useIntl();
  const {
    layerModalActive,
    selectedLayers,
    treeViewItem,
    treeViewSelected,
    closeLayerModal,
    handleLayerSelect,
    addItem,
    moveItem,
    removeItem,
    handleSelect,
  } = useHooks({
    layers,
    items,
    layerMode,
    selectedIndex,
    onItemSelect,
    onItemAdd,
    onItemMove,
    onItemRemove,
    onItemsUpdate,
  });

  return (
    <Wrapper className={className}>
      <Header>
        <Text size="xs" otherProperties={{ flex: 1 }}>
          {name} {intl.formatMessage({ defaultMessage: "List" })}
        </Text>
        <AddItemIcon icon="plus" size={16} onClick={addItem} />
        <RemoveItemIcon icon="bin" size={16} onClick={removeItem} />
      </Header>
      <StyledTreeView
        item={treeViewItem}
        selected={treeViewSelected}
        renderItem={PropertyListItem}
        onDrop={moveItem}
        onSelect={handleSelect}
        selectable
        draggable
        droppable
        dragItemType="propertyGroup"
      />
      <LayerMultipleSelectionModal
        active={layerModalActive}
        onClose={closeLayerModal}
        onSelect={handleLayerSelect}
        layers={layers}
        selected={selectedLayers}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div``;

const Header = styled.header`
  display: flex;
  padding: 0 0 8px 0;
  color: ${props => props.theme.properties.contentsText};
`;

const InnerTreeView = (props: TreeViewProps<Item, HTMLDivElement>) => (
  <TreeView<Item, HTMLDivElement> {...props} />
);

const StyledTreeView = styled(InnerTreeView)`
  min-height: 100px;
  max-height: 320px;
  border: 1px solid #414141;
`;

const AddItemIcon = styled(Icon)`
  user-select: none;
  cursor: pointer;
  padding: 0 5px;
`;

const RemoveItemIcon = styled(Icon)`
  user-select: none;
  cursor: pointer;
  padding: 0 0 0 5px;
`;

export default PropertyList;
