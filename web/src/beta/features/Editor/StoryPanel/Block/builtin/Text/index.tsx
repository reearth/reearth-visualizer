import { useCallback } from "react";

import { CommonProps as BlockProps } from "../../types";
import BlockWrapper from "../Wrapper";

export type Props = BlockProps<Property>;

export type Property = {};

const TextBlock: React.FC<Props> = ({ block, isSelected, onClick, onRemove }) => {
  const handleRemove = useCallback(() => onRemove?.(block?.id), [block?.id, onRemove]);

  return (
    <BlockWrapper
      title={block?.title}
      icon={block?.extensionId}
      isSelected={isSelected}
      onClick={onClick}
      onRemove={handleRemove}
    />
  );
};

export default TextBlock;
