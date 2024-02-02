import { Fragment, ReactNode, useCallback, useMemo, useState } from "react";

import DragAndDropList from "@reearth/beta/components/DragAndDropList";
import { Spacing } from "@reearth/beta/lib/core/mantle";
import BlockAddBar from "@reearth/beta/lib/core/shared/components/BlockAddBar";
import {
  EditModeContext,
  EditModeProvider,
} from "@reearth/beta/lib/core/shared/contexts/editModeContext";
import { ValueType, ValueTypes } from "@reearth/beta/utils/value";
import { InstallableInfoboxBlock } from "@reearth/services/api/infoboxApi/blocks";
import { styled } from "@reearth/services/theme";

import InfoboxBlockComponent from "./Block";
import {
  GAP_DEFAULT_VALUE,
  INFOBOX_UNIQUE_KEY,
  INFOBOX_WIDTH,
  PADDING_DEFAULT_VALUE,
  POSITION_DEFAULT_VALUE,
} from "./constants";
import type { Infobox, InfoboxBlockProps } from "./types";

export type InfoboxPosition = "right" | "left";

export type Props = {
  //   size?: "small" | "medium" | "large";
  position?: InfoboxPosition;
  padding?: Spacing;
  gap?: number;
  visible?: boolean;
  infobox?: Infobox;
  isEditable?: boolean;
  installableInfoboxBlocks?: InstallableInfoboxBlock[];
  renderBlock?: (block: InfoboxBlockProps) => ReactNode;
  onBlockCreate?: (
    extensionId?: string | undefined,
    pluginId?: string | undefined,
    index?: number | undefined,
  ) => Promise<void>;
  onBlockMove?: (id: string, targetIndex: number) => void;
  onBlockDelete?: (blockId?: string) => Promise<void>;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType],
  ) => Promise<void>;
  onPropertyItemAdd?: (propertyId?: string, schemaGroupId?: string) => Promise<void>;
  onPropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number,
  ) => Promise<void>;
  onPropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
  ) => Promise<void>;
};

const Infobox: React.FC<Props> = ({
  infobox,
  visible,
  position = POSITION_DEFAULT_VALUE,
  padding,
  gap,
  isEditable,
  installableInfoboxBlocks,
  onBlockCreate,
  onBlockMove,
  onBlockDelete,
  onPropertyUpdate,
  onPropertyItemAdd,
  onPropertyItemMove,
  onPropertyItemDelete,
}) => {
  const [disableSelection, setDisableSelection] = useState(false);

  const [infoboxBlocks, setInfoboxBlocks] = useState(infobox?.blocks ?? []);
  const [selectedBlockId, setSelectedBlockId] = useState<string>();
  const [openBlocksIndex, setOpenBlocksIndex] = useState<number>();

  const handleBlockOpen = useCallback(
    (index: number) => {
      if (openBlocksIndex === index) {
        setOpenBlocksIndex(undefined);
      } else {
        setOpenBlocksIndex(index);
      }
    },
    [openBlocksIndex],
  );

  const handleSelectionDisable = useCallback(
    (disabled?: boolean) => setDisableSelection(!!disabled),
    [],
  );

  const handleBlockCreate = useCallback(
    (index: number) => (extensionId?: string | undefined, pluginId?: string | undefined) =>
      onBlockCreate?.(extensionId, pluginId, index),
    [onBlockCreate],
  );

  const handleBlockSelect = useCallback(
    (blockId?: string) => {
      if (!isEditable || blockId === selectedBlockId || disableSelection) return;
      setSelectedBlockId(blockId);
    },
    [selectedBlockId, isEditable, disableSelection],
  );

  const handleBlockDoubleClick = useCallback(
    (blockId?: string) => {
      if (disableSelection) return;
      setSelectedBlockId(blockId);
    },
    [disableSelection],
  );

  const editModeContext: EditModeContext = useMemo(
    () => ({
      disableSelection,
      onSelectionDisable: handleSelectionDisable,
    }),
    [disableSelection, handleSelectionDisable],
  );

  return (
    <EditModeProvider value={editModeContext}>
      <Wrapper visible={visible} position={position} padding={padding} gap={gap}>
        {infoboxBlocks && infoboxBlocks.length > 0 && (
          <DragAndDropList
            uniqueKey={INFOBOX_UNIQUE_KEY}
            gap={gap}
            items={infoboxBlocks}
            getId={item => item.id}
            onItemDrop={async (item, index) => {
              setInfoboxBlocks(old => {
                const items = [...old];
                items.splice(
                  old.findIndex(o => o.id === item.id),
                  1,
                );
                items.splice(index, 0, item);
                return items;
              });
              await onBlockMove?.(item.id, index);
            }}
            renderItem={(b, idx) => {
              return (
                <Fragment key={idx}>
                  <InfoboxBlockComponent
                    key={b.id}
                    block={b}
                    isEditable={isEditable}
                    isSelected={b.id === selectedBlockId}
                    onClick={() => handleBlockSelect(b.id)}
                    onBlockDoubleClick={() => handleBlockDoubleClick(b.id)}
                    onClickAway={handleBlockSelect}
                    onRemove={onBlockDelete}
                    onPropertyUpdate={onPropertyUpdate}
                    onPropertyItemAdd={onPropertyItemAdd}
                    onPropertyItemMove={onPropertyItemMove}
                    onPropertyItemDelete={onPropertyItemDelete}
                  />
                  {isEditable && !disableSelection && (
                    <BlockAddBar
                      id={b.id + "below-bar"}
                      openBlocks={openBlocksIndex === idx}
                      installableBlocks={installableInfoboxBlocks}
                      showAreaHeight={gap}
                      parentWidth={INFOBOX_WIDTH}
                      onBlockOpen={() => handleBlockOpen(idx)}
                      onBlockAdd={handleBlockCreate?.(idx + 1)}
                    />
                  )}
                </Fragment>
              );
            }}
          />
        )}
      </Wrapper>
    </EditModeProvider>
  );
};

export default Infobox;

const Wrapper = styled.div<{
  visible?: boolean;
  position?: InfoboxPosition;
  padding?: Spacing;
  gap?: number;
}>`
  display: flex;
  flex-direction: column;
  gap: ${({ gap }) => gap ?? GAP_DEFAULT_VALUE}px;
  position: absolute;
  top: 37px;
  ${({ position }) => (position === "right" ? "right: 13px" : "left: 13px")};
  height: 515px;
  width: ${INFOBOX_WIDTH}px;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  background: #ffffff;
  border-radius: 6px;
  z-index: ${({ theme }) => theme.zIndexes.visualizer.infobox};
  box-sizing: border-box;
  overflow: scroll;
  padding-top: ${({ padding }) => padding?.top ?? PADDING_DEFAULT_VALUE}px;
  padding-bottom: ${({ padding }) => padding?.bottom ?? PADDING_DEFAULT_VALUE}px;
  padding-left: ${({ padding }) => padding?.left ?? PADDING_DEFAULT_VALUE}px;
  padding-right: ${({ padding }) => padding?.right ?? PADDING_DEFAULT_VALUE}px;
`;
