import type { CommonProps as BlockProps } from "@reearth//beta/lib/core/StoryPanel/Block/types";
import BlockWrapper from "@reearth/beta/lib/core/StoryPanel/Block/builtin/common/Wrapper";

import Timeline from "./Timeline";

const TimelineBlock: React.FC<BlockProps> = ({ block, isSelected, ...props }) => {
  return (
    <BlockWrapper
      name={block?.name}
      icon={block?.extensionId}
      // isSelected={isSelected}
      propertyId={block?.propertyId}
      property={block?.property}
      settingsEnabled={false}
      {...props}>
      <Timeline isSelected={isSelected} blockId={block?.id} />
    </BlockWrapper>
  );
};

export default TimelineBlock;
