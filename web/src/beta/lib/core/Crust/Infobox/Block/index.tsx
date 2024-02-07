import { useCallback, type ComponentType, type ReactNode, memo } from "react";

import type { Layer } from "@reearth/beta/lib/core/mantle";
import type { CommonBlockProps, BlockProps } from "@reearth/beta/lib/core/shared/types";
import { styled } from "@reearth/services/theme";

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
    <Wrapper editable={props?.isEditable} onClick={props?.onClick} selected={props?.isSelected}>
      {renderBlock?.({ block: props.block, layer: props.layer, onClick: props.onClick })}
    </Wrapper>
  ) : null;
};

export default memo(InfoboxBlockComponent);

const Wrapper = styled.div<{ editable?: boolean; selected?: boolean }>`
  border: 1px solid
    ${({ selected, editable, theme }) => (editable && selected ? theme.select.main : "transparent")};

  :hover {
    ${({ editable, theme }) => editable && `border-color: ${theme.outline.main}`};
  }
`;
