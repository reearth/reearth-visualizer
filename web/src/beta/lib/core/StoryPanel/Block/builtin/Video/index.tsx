import { useMemo } from "react";

import type { CommonProps as BlockProps } from "@reearth//beta/lib/core/StoryPanel/Block/types";
import BlockWrapper from "@reearth/beta/lib/core/StoryPanel/Block/builtin/common/Wrapper";
import VideoPlayer from "@reearth/beta/lib/core/StoryPanel/Block/builtin/Video/VideoPlayer";
import { getFieldValue } from "@reearth/beta/lib/core/StoryPanel/utils";
import type { ValueTypes } from "@reearth/beta/utils/value";

const VideoBlock: React.FC<BlockProps> = ({ block, isSelected, ...props }) => {
  const src = useMemo(
    () => getFieldValue(block?.property?.items ?? [], "src") as ValueTypes["string"],
    [block?.property?.items],
  );

  return (
    <BlockWrapper
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.property?.id}
      propertyItems={block?.property?.items}
      {...props}>
      {src && <VideoPlayer isSelected={isSelected} src={src} />}
    </BlockWrapper>
  );
};

export default VideoBlock;
