import type { ComponentType, ReactNode } from "react";

import { type Theme } from "@reearth/beta/lib/core/Crust/theme";
import type { Layer } from "@reearth/beta/lib/core/mantle";
import type { ValueType, ValueTypes } from "@reearth/beta/utils/value";
import { styled } from "@reearth/services/theme";

import builtin, { isBuiltinStoryBlock } from "./builtin";
import { Block, BlockProps } from "./types";

// export type { InfoboxProperty, Typography, LatLng } from "../types";

export type Props<BP = unknown> = {
  renderBlock?: (block: BlockProps) => ReactNode;
  layer?: Layer;
} & CommonProps<BP>;

export type CommonProps<BP = unknown> = {
  isEditable?: boolean;
  isBuilt?: boolean;
  isSelected?: boolean;
  block?: Block<BP>;
  //   infoboxProperty?: InfoboxProperty;
  theme?: Theme;
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
  const builtinBlockId = `${props.block?.pluginId}/${props.block?.extensionId}`;
  const Builtin = isBuiltinStoryBlock(builtinBlockId) ? builtin[builtinBlockId] : undefined;

  return Builtin ? (
    <Builtin {...props} />
  ) : props.block ? (
    <Wrapper editable={props?.isEditable} onClick={props?.onClick} selected={props?.isSelected}>
      {renderBlock?.({ block: props.block, layer: props.layer, onClick: props.onClick })}
    </Wrapper>
  ) : null;
}

const Wrapper = styled.div<{ editable?: boolean; selected?: boolean }>`
  border: 1px solid
    ${({ selected, editable, theme }) => (editable && selected ? theme.select.main : "transparent")};
  border-radius: 6px;

  &:hover {
    border-color: ${({ editable, theme }) => (editable ? theme.outline.main : null)};
  }
`;
