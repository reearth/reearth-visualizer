import type { CommonProps as BlockProps } from "../../types";
import BlockWrapper from "../common/Wrapper";

const VideoBlock: React.FC<BlockProps> = ({ block, isSelected, ...props }) => {
  return (
    <BlockWrapper
      title={block?.title}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.property?.id}
      propertyItems={block?.property?.items}
      {...props}
    />
  );
};

export default VideoBlock;
