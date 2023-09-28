import type { CommonProps as BlockProps } from "../../types";
import BlockWrapper from "../common/Wrapper";

const VideoBlock: React.FC<BlockProps> = ({ block, isSelected, ...props }) => {
  return (
    <BlockWrapper
      name={block?.name}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.property?.id}
      property={block?.property}
      {...props}
    />
  );
};

export default VideoBlock;
