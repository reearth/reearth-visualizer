import React, { type ReactNode } from "react";

import AdditionButton from "@reearth/components/atoms/AdditionButton";
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import type { Layer } from "@reearth/core/mantle";
import { useT } from "@reearth/i18n";
import { styled, useTheme } from "@reearth/theme";

import BlockComponent from "./Block";
import Field from "./Field";
import Frame from "./Frame";
import useHooks from "./hooks";
import type { ValueTypes, ValueType, Block, InfoboxProperty, Theme, BlockProps } from "./types";

export type { InfoboxProperty, Block, LatLng, BlockProps } from "./types";

export type Props = {
  className?: string;
  infoboxKey?: string;
  property?: InfoboxProperty;
  blocks?: Block[];
  title?: string;
  isEditable?: boolean;
  isBuilt?: boolean;
  selectedBlockId?: string;
  visible?: boolean;
  theme?: Theme;
  layer?: Layer;
  onMaskClick?: () => void;
  onBlockSelect?: (id?: string) => void;
  onBlockChange?: <T extends ValueType>(
    blockId: string,
    schemaItemId: string,
    fieldId: string,
    value: ValueTypes[T],
    type: T,
  ) => void;
  onBlockMove?: (id: string, fromIndex: number, toIndex: number) => void;
  onBlockDelete?: (id: string) => void;
  onBlockInsert?: (bi: number, i: number, pos?: "top" | "bottom") => void;
  renderBlock?: (block: BlockProps) => ReactNode;
  renderInsertionPopup?: (onSelect: (bi: number) => void, onClose: () => void) => ReactNode;
};

const Infobox: React.FC<Props> = ({
  className,
  infoboxKey,
  property,
  blocks,
  title,
  isEditable,
  isBuilt,
  selectedBlockId,
  visible,
  theme: infoboxTheme,
  onMaskClick,
  onBlockSelect,
  onBlockChange,
  onBlockMove,
  onBlockInsert,
  renderInsertionPopup,
  ...props
}) => {
  const {
    insertionPopUpPosition,
    isReadyToRender,
    onInsertionButtonClick,
    onInsertionPopUpClose,
    handleBlockInsert,
    setNotReadyToRender,
    setReadyToRender,
  } = useHooks(onBlockInsert);
  const theme = useTheme();
  const t = useT();

  return (
    <Frame
      className={className}
      infoboxKey={infoboxKey}
      title={property?.title || title}
      size={property?.size}
      height={property?.height}
      heightType={property?.heightType}
      position={property?.position}
      outlineColor={property?.outlineColor}
      useMask={!!property?.useMask}
      outlineWidth={property?.outlineWidth}
      visible={visible}
      noContent={!blocks?.length}
      theme={infoboxTheme}
      backgroundColor={property?.bgcolor}
      typography={property?.typography}
      paddingTop={property?.infoboxPaddingTop}
      paddingBottom={property?.infoboxPaddingBottom}
      paddingRight={property?.infoboxPaddingRight}
      paddingLeft={property?.infoboxPaddingLeft}
      showTitle={property?.showTitle}
      onMaskClick={onMaskClick}
      onClick={() => selectedBlockId && onBlockSelect?.(undefined)}
      onEnter={setNotReadyToRender}
      onEntered={setReadyToRender}
      onExit={setNotReadyToRender}>
      {blocks?.map((b, i) => (
        <Field
          key={b.id}
          id={b.id}
          index={i}
          isEditable={isEditable}
          isBuilt={isBuilt}
          isSelected={selectedBlockId === b.id}
          dragDisabled={blocks.length < 2}
          renderInsertionPopUp={
            isReadyToRender &&
            insertionPopUpPosition?.[0] === i &&
            renderInsertionPopup?.(handleBlockInsert, onInsertionPopUpClose)
          }
          insertionPopUpPosition={insertionPopUpPosition?.[1]}
          onMove={onBlockMove}
          onInsert={p => onInsertionButtonClick?.(i, p)}>
          <BlockComponent
            block={b}
            isSelected={!!isEditable && !isBuilt && selectedBlockId === b.id}
            isEditable={isEditable}
            isBuilt={isBuilt}
            infoboxProperty={property}
            onChange={(...args) => onBlockChange?.(b.id, ...args)}
            onClick={() => {
              if (b.id && selectedBlockId !== b.id) {
                onBlockSelect?.(b.id);
              }
            }}
            {...props}
          />
        </Field>
      ))}
      {isEditable && (blocks?.length ?? 0) === 0 && (
        <>
          <AdditionButton onClick={() => onInsertionButtonClick?.(0)}>
            {isReadyToRender &&
              insertionPopUpPosition &&
              renderInsertionPopup?.(handleBlockInsert, onInsertionPopUpClose)}
          </AdditionButton>
          <NoContentInfo>
            <InnerWrapper size="xs" color={theme.infoBox.weakText}>
              <StyledIcon icon="arrowLong" />
              <span>{t(`Move mouse here and click "+" to add content`)}</span>
            </InnerWrapper>
          </NoContentInfo>
        </>
      )}
    </Frame>
  );
};

const NoContentInfo = styled.div`
  display: flex;
  justify-content: center;
  color: ${props => props.theme.main.weak};
  text-align: left;
`;

const StyledIcon = styled(Icon)`
  margin: 0 auto 15px auto;
  height: 66px;
`;

const InnerWrapper = styled(Text)`
  display: flex;
  flex-direction: column;
  width: 184px;
`;

export default Infobox;
