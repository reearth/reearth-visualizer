import React, { useState } from "react";

import Icon from "@reearth/classic/components/atoms/Icon";
import Text from "@reearth/classic/components/atoms/Text";
import { ValueTypes, ValueType } from "@reearth/classic/util/value";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import PluginBlock, { Layer, Block } from "../Block";
import type { SceneProperty } from "../Engine";
import { Viewport } from "../hooks";
import type { CommonProps as PluginCommonProps } from "../Plugin";

import AdditionButton from "./AdditionButton";
import Field from "./Field";
import Frame from "./Frame";
import useHooks from "./hooks";

export type { Block, Layer } from "../Block";
export type { InfoboxProperty } from "../Plugin";

export type Props = {
  className?: string;
  infoboxKey?: string;
  sceneProperty?: SceneProperty;
  layer?: Layer;
  blocks?: Block[];
  title?: string;
  showTitle?: boolean;
  isEditable?: boolean;
  isBuilt?: boolean;
  selectedBlockId?: string;
  visible?: boolean;
  viewport?: Viewport;
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
  renderInsertionPopUp?: (onSelect: (bi: number) => void, onClose: () => void) => React.ReactNode;
} & PluginCommonProps;

const Infobox: React.FC<Props> = ({
  className,
  infoboxKey,
  sceneProperty,
  layer,
  blocks: overridenBlocks,
  title,
  isEditable,
  isBuilt,
  selectedBlockId,
  visible,
  pluginBaseUrl,
  pluginProperty,
  onMaskClick,
  onBlockSelect,
  onBlockChange,
  onBlockMove,
  renderInsertionPopUp,
  onBlockInsert,
  ...props
}) => {
  const {
    insertionPopUpPosition,
    onInsertionButtonClick,
    onInsertionPopUpClose,
    handleBlockInsert,
  } = useHooks(onBlockInsert);
  const theme = useTheme();
  const t = useT();
  const [isReadyToRender, setIsReadyToRender] = useState(false);
  const blocks = overridenBlocks ?? layer?.infobox?.blocks;
  const property = layer?.infobox?.property;

  return (
    <Frame
      className={className}
      infoboxKey={infoboxKey}
      sceneProperty={sceneProperty}
      title={property?.default?.title || title}
      size={property?.default?.size}
      height={property?.default?.height}
      heightType={property?.default?.heightType}
      position={property?.default?.position}
      outlineColor={property?.default?.outlineColor}
      useMask={!!property?.default?.useMask}
      outlineWidth={property?.default?.outlineWidth}
      visible={visible}
      noContent={!blocks?.length}
      styles={property?.default}
      showTitle={property?.default?.showTitle}
      onMaskClick={onMaskClick}
      onClick={() => selectedBlockId && onBlockSelect?.(undefined)}
      onEnter={() => setIsReadyToRender(false)}
      onEntered={() => setIsReadyToRender(true)}
      onExit={() => setIsReadyToRender(false)}>
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
            renderInsertionPopUp?.(handleBlockInsert, onInsertionPopUpClose)
          }
          insertionPopUpPosition={insertionPopUpPosition?.[1]}
          onMove={onBlockMove}
          onInsert={p => onInsertionButtonClick?.(i, p)}>
          <PluginBlock
            block={b}
            isSelected={!!isEditable && !isBuilt && selectedBlockId === b.id}
            isEditable={isEditable}
            isBuilt={isBuilt}
            infoboxProperty={property}
            theme={sceneProperty?.theme}
            pluginProperty={
              b.pluginId && b.extensionId
                ? pluginProperty?.[`${b.pluginId}/${b.extensionId}`]
                : undefined
            }
            onChange={(...args) => onBlockChange?.(b.id, ...args)}
            onClick={() => {
              if (b.id && selectedBlockId !== b.id) {
                onBlockSelect?.(b.id);
              }
            }}
            layer={layer}
            pluginBaseUrl={pluginBaseUrl}
            {...props}
          />
        </Field>
      ))}
      {isEditable && (blocks?.length ?? 0) === 0 && (
        <>
          <AdditionButton onClick={() => onInsertionButtonClick?.(0)}>
            {isReadyToRender &&
              insertionPopUpPosition &&
              renderInsertionPopUp?.(handleBlockInsert, onInsertionPopUpClose)}
          </AdditionButton>
          <NoContentInfo>
            <InnerWrapper size="xs" color={theme.classic.infoBox.weakText}>
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
  color: ${props => props.theme.classic.main.weak};
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
