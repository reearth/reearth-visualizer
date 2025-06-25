import VideoPlayer from "@reearth/app/features/Visualizer/Crust/StoryPanel/Block/builtin/Video/VideoPlayer";
import BlockWrapper from "@reearth/app/features/Visualizer/shared/components/BlockWrapper";
import type { CommonBlockProps as BlockProps } from "@reearth/app/features/Visualizer/shared/types";
import type { ValueTypes } from "@reearth/app/utils/value";
import { FC, useMemo } from "react";

import { StoryBlock } from "../../../types";

const VideoBlock: FC<BlockProps<StoryBlock>> = ({
  block,
  isSelected,
  ...props
}) => {
  const src = useMemo(
    () => block?.property?.default?.src?.value as ValueTypes["string"],
    [block?.property?.default?.src?.value]
  );

  return (
    <BlockWrapper
      name={block?.name}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.propertyId}
      property={block?.property}
      {...props}
    >
      {src && (
        <VideoPlayer
          isSelected={isSelected}
          src={src}
          inEditor={!!props.isEditable}
        />
      )}
    </BlockWrapper>
  );
};

export default VideoBlock;
