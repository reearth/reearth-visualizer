import type {
  CommonBlockProps,
  BlockProps
} from "@reearth/app/features/Visualizer/shared/types";
import type { Layer } from "@reearth/core";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { useCallback, type ComponentType, type ReactNode } from "react";

import BlockWrapper from "../../../shared/components/BlockWrapper";
import { StoryBlock } from "../types";

import builtin, { isBuiltinStoryBlock } from "./builtin";

export type Props = {
  renderBlock?: (block: BlockProps<StoryBlock>) => ReactNode;
  layer?: Layer;
  pageId?: string;
  nlsLayers?: NLSLayer[];
} & CommonBlockProps<StoryBlock>;

export type Component = ComponentType<CommonBlockProps<StoryBlock>>;

export default function StoryBlockComponent({
  renderBlock,
  onRemove,
  ...props
}: Props): JSX.Element | null {
  const builtinBlockId = `${props.block?.pluginId}/${props.block?.extensionId}`;
  const Builtin = isBuiltinStoryBlock(builtinBlockId)
    ? builtin[builtinBlockId]
    : undefined;
  const handleRemove = useCallback(
    () => props.block?.id && onRemove?.(props.block.id),
    [props.block?.id, onRemove]
  );

  return Builtin ? (
    <Builtin {...props} onRemove={onRemove ? handleRemove : undefined} />
  ) : props.block ? (
    <BlockWrapper
      {...props}
      isPluginBlock
      icon={props.block.extensionId}
      name={props.block.name}
      isEditable={props.isEditable}
      isSelected={props.isSelected}
      property={props.block.property}
      propertyId={props.block.propertyId}
      dragHandleClassName={props.dragHandleClassName}
      propertyItemsForPluginBlock={props.block.propertyItemsForPluginBlock}
      onRemove={onRemove ? handleRemove : undefined}
    >
      {renderBlock?.({
        block: props.block,
        layer: props.layer,
        onClick: props.onClick,
        nlsLayers: props.nlsLayers
      })}
    </BlockWrapper>
  ) : null;
}
