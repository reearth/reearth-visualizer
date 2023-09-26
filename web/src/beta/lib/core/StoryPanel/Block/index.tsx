import { useCallback, type ComponentType, type ReactNode } from "react";

import type { Layer } from "@reearth/beta/lib/core/mantle";
import { styled } from "@reearth/services/theme";

import builtin, { isBuiltinStoryBlock } from "./builtin";
import type { CommonProps, BlockProps } from "./types";

export type Props = {
  pageId?: string;
  renderBlock?: (block: BlockProps) => ReactNode;
  layer?: Layer;
} & CommonProps;

export type Component = ComponentType<CommonProps>;

export default function StoryBlockComponent({
  pageId,
  renderBlock,
  onRemove,
  ...props
}: Props): JSX.Element | null {
  const builtinBlockId = `${props.block?.pluginId}/${props.block?.extensionId}`;
  const Builtin = isBuiltinStoryBlock(builtinBlockId) ? builtin[builtinBlockId] : undefined;
  console.log(props.block);
  const handleRemove = useCallback(
    () => onRemove?.(pageId, props.block?.id),
    [pageId, props.block?.id, onRemove],
  );

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
