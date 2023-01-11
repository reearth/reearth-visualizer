import { ComponentType, ReactNode } from "react";

import { styled } from "@reearth/theme";
import { ValueType, ValueTypes } from "@reearth/util/value";

import { Block, InfoboxProperty } from "../types";

import builtin from "./builtin";

export type { InfoboxProperty, Typography, LatLng } from "../types";

export type Props<BP = any> = {
  renderBlock?: (block: Block) => ReactNode;
} & CommonProps<BP>;

export type CommonProps<BP = any> = {
  isEditable?: boolean;
  isBuilt?: boolean;
  isSelected?: boolean;
  block?: Block<BP>;
  infoboxProperty?: InfoboxProperty;
  onClick?: () => void;
  onChange?: <T extends ValueType>(
    schemaItemId: string,
    fieldId: string,
    value: ValueTypes[T],
    type: T,
  ) => void;
};

export type Component<BP = any> = ComponentType<CommonProps<BP>>;

export default function BlockComponent<P = any>({
  renderBlock,
  ...props
}: Props<P>): JSX.Element | null {
  const Builtin =
    props.block?.pluginId && props.block.extensionId
      ? builtin[`${props.block.pluginId}/${props.block.extensionId}`]
      : undefined;

  return Builtin ? (
    <Builtin {...props} />
  ) : props.block ? (
    <Wrapper editable={props?.isEditable} onClick={props?.onClick} selected={props?.isSelected}>
      {renderBlock?.(props.block)}
    </Wrapper>
  ) : null;
}

const Wrapper = styled.div<{ editable?: boolean; selected?: boolean }>`
  border: 1px solid
    ${({ selected, editable, theme }) =>
      editable && selected ? theme.infoBox.accent2 : "transparent"};
  border-radius: 6px;

  &:hover {
    border-color: ${({ editable, theme }) => (editable ? theme.infoBox.border : null)};
  }
`;
