import { useCallback, type ComponentType, type ReactNode } from "react";

import type { CommonBlockProps, BlockProps } from "@reearth/beta/features/Visualizer/shared/types";
import type { Layer } from "@reearth/core";

import BlockWrapper from "../../../shared/components/BlockWrapper";
import { StoryBlock } from "../types";

import builtin, { isBuiltinStoryBlock } from "./builtin";

export type Props = {
  renderBlock?: (block: BlockProps<StoryBlock>) => ReactNode;
  layer?: Layer;
  pageId?: string;
} & CommonBlockProps<StoryBlock>;

export type Component = ComponentType<CommonBlockProps<StoryBlock>>;

export default function StoryBlockComponent({
  renderBlock,
  onRemove,
  ...props
}: Props): JSX.Element | null {
  const builtinBlockId = `${props.block?.pluginId}/${props.block?.extensionId}`;
  const Builtin = isBuiltinStoryBlock(builtinBlockId) ? builtin[builtinBlockId] : undefined;
  const handleRemove = useCallback(
    () => props.block?.id && onRemove?.(props.block.id),
    [props.block?.id, onRemove],
  );

  return Builtin ? (
    <Builtin {...props} onRemove={onRemove ? handleRemove : undefined} />
  ) : props.block ? (
    <BlockWrapper
      {...props}
      isPluginBlock
      name={props.block.name}
      isEditable={props.isEditable}
      isSelected={props.isSelected}
      property={props.block.property}
      propertyId={props.block.propertyId}
      pluginBlockPropertyItems={props.block.pluginBlockPropertyItems}
      onRemove={onRemove ? handleRemove : undefined}>
      {renderBlock?.({ block: props.block, layer: props.layer, onClick: props.onClick })}
    </BlockWrapper>
  ) : null;
}
