import BlockAddBar from "@reearth/beta/features/Visualizer/shared/components/BlockAddBar";
import { EditModeProvider } from "@reearth/beta/features/Visualizer/shared/contexts/editModeContext";
import { InstallableBlock } from "@reearth/beta/features/Visualizer/shared/types";
import { DragAndDropList } from "@reearth/beta/lib/reearth-ui";
import { ValueType, ValueTypes } from "@reearth/beta/utils/value";
import { Spacing } from "@reearth/core";
import { styled } from "@reearth/services/theme";
import { FC, Fragment, ReactNode, memo, useMemo } from "react";

import InfoboxBlockComponent from "./Block";
import {
  GAP_DEFAULT_VALUE,
  INFOBOX_WIDTH,
  PADDING_DEFAULT_VALUE,
  POSITION_DEFAULT_VALUE
} from "./constants";
import useHooks from "./hooks";
import type { Infobox, InfoboxBlockProps } from "./types";

export type InfoboxPosition = "right" | "left";

export type InstallableInfoboxBlock = InstallableBlock & {
  type?: "InfoboxBlock";
};

const INFOBOX_DRAG_HANDLE_CLASS_NAME =
  "reearth-visualizer-editor-infobox-drag-handle";

export type Props = {
  infobox?: Infobox;
  isEditable?: boolean;
  installableInfoboxBlocks?: InstallableInfoboxBlock[];
  renderBlock?: (block: InfoboxBlockProps) => ReactNode;
  onBlockCreate?: (
    pluginId: string,
    extensionId: string,
    index?: number | undefined
  ) => Promise<void>;
  onBlockMove?: (
    id: string,
    targetIndex: number,
    blockId?: string
  ) => Promise<void>;
  onBlockDelete?: (id?: string) => Promise<void>;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType]
  ) => Promise<void>;
  onPropertyItemAdd?: (
    propertyId?: string,
    schemaGroupId?: string
  ) => Promise<void>;
  onPropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number
  ) => Promise<void>;
  onPropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string
  ) => Promise<void>;
};

const Infobox: FC<Props> = ({
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
  onPropertyItemDelete
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
    handleBlockOpen,
    handleBlockCreate,
    handleBlockSelect,
    handleBlockDoubleClick,
    handleMoveEnd
  } = useHooks({
    infobox,
    isEditable,
    onBlockCreate,
    onBlockMove
  });

  const DraggableInfoboxBlock = useMemo(
    () =>
      infoboxBlocks.map((b, idx) => ({
        id: b.id,
        content: (
          <Fragment key={idx}>
            <ItemWrapper>
              <InfoboxBlockComponent
                key={b.id}
                block={b}
                isEditable={isEditable}
                renderBlock={renderBlock}
                isSelected={b.id === selectedBlockId}
                dragHandleClassName={INFOBOX_DRAG_HANDLE_CLASS_NAME}
                onClick={() => handleBlockSelect(b.id)}
                onBlockDoubleClick={() => handleBlockDoubleClick(b.id)}
                onClickAway={handleBlockSelect}
                onRemove={onBlockDelete}
                onPropertyUpdate={onPropertyUpdate}
                onPropertyItemAdd={onPropertyItemAdd}
                onPropertyItemMove={onPropertyItemMove}
                onPropertyItemDelete={onPropertyItemDelete}
              />
            </ItemWrapper>
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
        )
      })),
    [
      infoboxBlocks,
      isEditable,
      renderBlock,
      selectedBlockId,
      handleBlockSelect,
      onBlockDelete,
      onPropertyUpdate,
      onPropertyItemAdd,
      onPropertyItemMove,
      onPropertyItemDelete,
      disableSelection,
      openBlocksIndex,
      installableInfoboxBlocks,
      gapField?.value,
      handleBlockCreate,
      handleBlockDoubleClick,
      handleBlockOpen
    ]
  );

  return showInfobox ? (
    <EditModeProvider value={editModeContext}>
      <Wrapper
        ref={wrapperRef}
        position={positionField?.value}
        padding={paddingField?.value}
      >
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
            items={DraggableInfoboxBlock}
            handleClassName={INFOBOX_DRAG_HANDLE_CLASS_NAME}
            onMoveEnd={handleMoveEnd}
            dragDisabled={false}
            gap={GAP_DEFAULT_VALUE}
          />
        )}
      </Wrapper>
    </EditModeProvider>
  ) : null;
};

export default memo(Infobox);

const Wrapper = styled("div")<{
  position?: InfoboxPosition;
  padding?: Spacing;
}>(({ position, padding, theme }) => ({
  display: "flex",
  flexDirection: "column",
  position: "absolute",
  top: "37px",
  height: "515px",
  width: `${INFOBOX_WIDTH}px`,
  background: "#ffffff",
  borderRadius: theme.radius.normal,
  zIndex: theme.zIndexes.visualizer.infobox,
  boxSizing: "border-box",
  overflow: "auto",
  paddingTop: padding?.top ?? `${PADDING_DEFAULT_VALUE}px`,
  paddingBottom: padding?.bottom ?? `${PADDING_DEFAULT_VALUE}px`,
  paddingLeft: padding?.left ?? `${PADDING_DEFAULT_VALUE}px`,
  paddingRight: padding?.right ?? `${PADDING_DEFAULT_VALUE}px`,
  [position ?? POSITION_DEFAULT_VALUE]: "13px"
}));

const ItemWrapper = styled("div")(() => ({
  background: "#ffffff"
}));
