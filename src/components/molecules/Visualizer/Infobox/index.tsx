import React, { useState } from "react";
import { useIntl } from "react-intl";

import AdditionButton from "@reearth/components/atoms/AdditionButton";
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import { styled, useTheme } from "@reearth/theme";
import { ValueTypes, ValueType } from "@reearth/util/value";

import PluginBlock, { Layer, Block } from "../Block";
import type { SceneProperty } from "../Engine";

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
  isEditable?: boolean;
  isBuilt?: boolean;
  selectedBlockId?: string;
  visible?: boolean;
  pluginBaseUrl?: string;
  pluginProperty?: { [key: string]: any };
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
};

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
  onBlockSelect,
  onBlockChange,
  onBlockMove,
  renderInsertionPopUp,
  onBlockInsert,
}) => {
  const {
    insertionPopUpPosition,
    onInsertionButtonClick,
    onInsertionPopUpClose,
    handleBlockInsert,
  } = useHooks(onBlockInsert);
  const theme = useTheme();
  const intl = useIntl();
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
      visible={visible}
      noContent={!blocks?.length}
      styles={property?.default}
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
            <InnerWrapper size="xs" color={theme.infoBox.weakText}>
              <StyledIcon icon="arrowLong" />
              <span>
                {intl.formatMessage({
                  defaultMessage: `Move mouse here and click "+" to add content`,
                })}
              </span>
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
