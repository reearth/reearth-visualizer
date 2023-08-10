import type { ComponentType, ReactNode } from "react";

import type { Layer } from "@reearth/beta/lib/core/mantle";
import { styled } from "@reearth/services/theme";

import builtin, { isBuiltinStoryBlock } from "./builtin";
import { CommonProps, BlockProps } from "./types";

export type Props<BP = unknown> = {
  renderBlock?: (block: BlockProps) => ReactNode;
  layer?: Layer;
} & CommonProps<BP>;

export type Component<BP = any> = ComponentType<CommonProps<BP>>;

export default function StoryBlockComponent<P = any>({
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

  &:hover {
    border-color: ${({ editable, theme }) => (editable ? theme.outline.main : null)};
  }
`;
