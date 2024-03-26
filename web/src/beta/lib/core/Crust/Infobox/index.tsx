import { Fragment, ReactNode, memo } from "react";

import DragAndDropList from "@reearth/beta/components/DragAndDropList";
import { Spacing } from "@reearth/beta/lib/core/mantle";
import BlockAddBar from "@reearth/beta/lib/core/shared/components/BlockAddBar";
import { EditModeProvider } from "@reearth/beta/lib/core/shared/contexts/editModeContext";
import { ValueType, ValueTypes } from "@reearth/beta/utils/value";
import { styled } from "@reearth/services/theme";

import { InstallableBlock } from "../../shared/types";

import InfoboxBlockComponent from "./Block";
import {
  GAP_DEFAULT_VALUE,
  INFOBOX_UNIQUE_KEY,
  INFOBOX_WIDTH,
  PADDING_DEFAULT_VALUE,
  POSITION_DEFAULT_VALUE,
} from "./constants";
import useHooks from "./hooks";
import type { Infobox, InfoboxBlockProps } from "./types";

export type InfoboxPosition = "right" | "left";

export type InstallableInfoboxBlock = InstallableBlock & {
  type?: "InfoboxBlock";
};

export type Props = {
  infobox?: Infobox;
  isEditable?: boolean;
  installableInfoboxBlocks?: InstallableInfoboxBlock[];
  renderBlock?: (block: InfoboxBlockProps) => ReactNode;
  onBlockCreate?: (
    pluginId: string,
    extensionId: string,
    index?: number | undefined,
  ) => Promise<void>;
  onBlockMove?: (id: string, targetIndex: number, layerId?: string) => Promise<void>;
  onBlockDelete?: (id?: string) => Promise<void>;
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
  isEditable,
  installableInfoboxBlocks,
  renderBlock,
  onBlockCreate,
  onBlockMove,
  onBlockDelete,
  onPropertyUpdate,
  onPropertyItemAdd,
  onPropertyItemMove,
  onPropertyItemDelete,
}) => {
  const {
    wrapperRef,
    disableSelection,
    infoboxBlocks,
    selectedBlockId,
    openBlocksIndex,
    showInfobox,
    paddingField,
    gapField,
    positionField,
    editModeContext,
    setInfoboxBlocks,
    handleBlockOpen,
    handleBlockCreate,
    handleBlockSelect,
    handleBlockDoubleClick,
  } = useHooks({
    infobox,
    isEditable,
    onBlockCreate,
  });

  return showInfobox ? (
    <EditModeProvider value={editModeContext}>
      <Wrapper ref={wrapperRef} position={positionField?.value} padding={paddingField?.value}>
        {isEditable && !disableSelection && (
          <BlockAddBar
            id="top-bar"
            openBlocks={openBlocksIndex === -1}
            installableBlocks={installableInfoboxBlocks}
            parentWidth={INFOBOX_WIDTH}
            alwaysShow={infoboxBlocks.length < 1}
            onBlockOpen={() => handleBlockOpen(-1)}
            onBlockAdd={handleBlockCreate?.(0)}
          />
        )}
        {infoboxBlocks && infoboxBlocks.length > 0 && (
          <DragAndDropList
            uniqueKey={INFOBOX_UNIQUE_KEY}
            gap={gapField?.value ?? GAP_DEFAULT_VALUE}
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
                    renderBlock={renderBlock}
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
                      showAreaHeight={gapField?.value}
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
  ) : null;
};

export default memo(Infobox);

const Wrapper = styled.div<{
  position?: InfoboxPosition;
  padding?: Spacing;
}>`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 37px;
  ${({ position }) => `${position ?? POSITION_DEFAULT_VALUE}: 13px`};
  height: 515px;
  width: ${INFOBOX_WIDTH}px;
  background: #ffffff;
  border-radius: 6px;
  z-index: ${({ theme }) => theme.zIndexes.visualizer.infobox};
  box-sizing: border-box;
  overflow: auto;
  padding-top: ${({ padding }) => padding?.top ?? PADDING_DEFAULT_VALUE}px;
  padding-bottom: ${({ padding }) => padding?.bottom ?? PADDING_DEFAULT_VALUE}px;
  padding-left: ${({ padding }) => padding?.left ?? PADDING_DEFAULT_VALUE}px;
  padding-right: ${({ padding }) => padding?.right ?? PADDING_DEFAULT_VALUE}px;
`;
