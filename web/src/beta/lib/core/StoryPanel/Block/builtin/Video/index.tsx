import { useMemo } from "react";
import Player from "react-player";

import type { CommonProps as BlockProps } from "@reearth//beta/lib/core/StoryPanel/Block/types";
import BlockWrapper from "@reearth/beta/lib/core/StoryPanel/Block/builtin/common/Wrapper";
import { getFieldValue } from "@reearth/beta/lib/core/StoryPanel/utils";
import type { ValueTypes } from "@reearth/beta/utils/value";

const VideoBlock: React.FC<BlockProps> = ({ block, isSelected, ...props }) => {
  const src = useMemo(
    () => getFieldValue(block?.property?.items ?? [], "src") as ValueTypes["string"],
    [block?.property?.items],
  );
  const title = useMemo(() => block?.property?.items?.[1]?.title, [block?.property?.items]);

  return (
    <BlockWrapper
      title={title}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.property?.id}
      propertyItems={block?.property?.items}
      {...props}>
      {src && (
        <Player
          url={src}
          width="100%"
          height="255px"
          playsinline
          pip
          controls
          preload
          isSelected={isSelected}
        />
      )}
    </BlockWrapper>
  );
};

export default VideoBlock;
