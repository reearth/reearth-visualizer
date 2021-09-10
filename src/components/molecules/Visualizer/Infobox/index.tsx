import React, { useState } from "react";
import { useIntl } from "react-intl";

import { styled, useTheme } from "@reearth/theme";
import { ValueTypes, ValueType, Typography } from "@reearth/util/value";
import Text from "@reearth/components/atoms/Text";
import AdditionButton from "@reearth/components/atoms/AdditionButton";
import Icon from "@reearth/components/atoms/Icon";

import PluginBlock, { Block as BlockType, Primitive } from "../Block";
import Frame from "./Frame";
import Field from "./Field";
import useHooks from "./hooks";
import { SceneProperty } from "../Engine";

export type { Primitive } from "../Block";

export type Block = BlockType & {
  propertyId?: string;
  pluginProperty?: any;
};

export type InfoboxProperty = {
  default?: {
    title?: string;
    size?: "small" | "large";
    typography?: Typography;
    bgcolor?: string;
  };
};

export type Props = {
  className?: string;
  infoboxKey?: string;
  property?: InfoboxProperty;
  sceneProperty?: SceneProperty;
  primitive?: Primitive;
  blocks?: Block[];
  title?: string;
  isEditable?: boolean;
  isBuilt?: boolean;
  selectedBlockId?: string;
  visible?: boolean;
  pluginBaseUrl?: string;
  onBlockSelect?: (id?: string) => void;
  onBlockChange?: <T extends ValueType>(
    propertyId: string,
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
  property,
  sceneProperty,
  primitive,
  blocks,
  title: name,
  isEditable,
  isBuilt,
  selectedBlockId,
  visible,
  pluginBaseUrl,
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

  return (
    <Frame
      className={className}
      infoboxKey={infoboxKey}
      sceneProperty={sceneProperty}
      title={property?.default?.title || name}
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
            pluginProperty={b.pluginProperty}
            sceneProperty={sceneProperty}
            onChange={(...args) =>
              b.propertyId ? onBlockChange?.(b.propertyId, ...args) : undefined
            }
            onClick={() => {
              if (b.id && selectedBlockId !== b.id) {
                onBlockSelect?.(b.id);
              }
            }}
            primitive={primitive}
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
              <p>
                {intl.formatMessage({
                  defaultMessage: `Move mouse here and click "+" to add content`,
                })}
              </p>
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
