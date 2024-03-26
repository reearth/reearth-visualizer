import { useMemo } from "react";

import BlockWrapper from "@reearth/beta/lib/core/shared/components/BlockWrapper";
import type { CommonBlockProps as BlockProps } from "@reearth/beta/lib/core/shared/types";
import VideoPlayer from "@reearth/beta/lib/core/StoryPanel/Block/builtin/Video/VideoPlayer";
import type { ValueTypes } from "@reearth/beta/utils/value";

import { StoryBlock } from "../../../types";

const VideoBlock: React.FC<BlockProps<StoryBlock>> = ({ block, isSelected, ...props }) => {
  const src = useMemo(
    () => block?.property?.default?.src?.value as ValueTypes["string"],
    [block?.property?.default?.src?.value],
  );

  return (
    <BlockWrapper
      name={block?.name}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.propertyId}
      property={block?.property}
      {...props}>
      {src && <VideoPlayer isSelected={isSelected} src={src} inEditor={!!props.isEditable} />}
    </BlockWrapper>
  );
};

export default VideoBlock;
