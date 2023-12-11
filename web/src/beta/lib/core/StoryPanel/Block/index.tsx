import { useCallback, type ComponentType, type ReactNode } from "react";

import type { Layer } from "@reearth/beta/lib/core/mantle";
import { styled } from "@reearth/services/theme";

import builtin, { isBuiltinStoryBlock } from "./builtin";
import type { CommonProps, BlockProps } from "./types";

export type Props = {
  renderBlock?: (block: BlockProps) => ReactNode;
  layer?: Layer;
  pageId?: string;
} & CommonProps;

export type Component = ComponentType<CommonProps>;

export default function StoryBlockComponent({
  renderBlock,
  onRemove,
  ...props
}: Props): JSX.Element | null {
  const builtinBlockId = `${props.block?.pluginId}/${props.block?.extensionId}`;
  const Builtin = isBuiltinStoryBlock(builtinBlockId) ? builtin[builtinBlockId] : undefined;
  const handleRemove = useCallback(() => onRemove?.(props.block?.id), [props.block?.id, onRemove]);

  return Builtin ? (
    <Builtin {...props} onRemove={onRemove ? handleRemove : undefined} />
  ) : props.block ? (
    <Wrapper editable={props?.isEditable} onClick={props?.onClick} selected={props?.isSelected}>
      {renderBlock?.({ block: props.block, layer: props.layer, onClick: props.onClick })}
    </Wrapper>
  ) : null;
}

const Wrapper = styled.div<{ editable?: boolean; selected?: boolean }>`
  border: 1px solid
    ${({ selected, editable, theme }) => (editable && selected ? theme.select.main : "transparent")};

  :hover {
    ${({ editable, theme }) => editable && `border-color: ${theme.outline.main}`};
  }
`;
