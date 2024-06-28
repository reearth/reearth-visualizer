import { useCallback, type ComponentType, type ReactNode, memo } from "react";

import BlockWrapper from "@reearth/beta/features/Visualizer/shared/components/BlockWrapper";
import type { CommonBlockProps, BlockProps } from "@reearth/beta/features/Visualizer/shared/types";
import type { Layer } from "@reearth/core";
// import { styled } from "@reearth/services/theme";

import { InfoboxBlock } from "../types";

import builtin, { isBuiltinInfoboxBlock } from "./builtin";

export type Props = {
  renderBlock?: (block: BlockProps<InfoboxBlock>) => ReactNode;
  layer?: Layer;
  pageId?: string;
} & CommonBlockProps<InfoboxBlock>;

export type Component = ComponentType<CommonBlockProps<InfoboxBlock>>;

const InfoboxBlockComponent = ({ renderBlock, onRemove, ...props }: Props): JSX.Element | null => {
  const builtinBlockId = `${props.block?.pluginId}/${props.block?.extensionId}`;
  const Builtin = isBuiltinInfoboxBlock(builtinBlockId) ? builtin[builtinBlockId] : undefined;
  const handleRemove = useCallback(
    () => props.block?.id && onRemove?.(props.block.id),
    [props.block?.id, onRemove],
  );

  return Builtin ? (
    <Builtin {...props} minHeight={120} onRemove={onRemove ? handleRemove : undefined} />
  ) : props.block ? (
    <BlockWrapper
      {...props}
      minHeight={120}
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
};

export default memo(InfoboxBlockComponent);
