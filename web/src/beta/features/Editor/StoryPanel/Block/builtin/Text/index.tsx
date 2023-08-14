import { CommonProps as BlockProps } from "../../types";
import BlockWrapper from "../common/Wrapper";

export type Props = BlockProps<Property>;

export type Property = {};

const TextBlock: React.FC<Props> = ({ block, isSelected, onClick, onRemove }) => {
  return (
    <BlockWrapper
      title={block?.title}
      icon={block?.extensionId}
      isSelected={isSelected}
      onClick={onClick}
      onRemove={onRemove}
    />
  );
};

export default TextBlock;
