
import BlockWrapper from "@reearth/beta/features/Visualizer/shared/components/BlockWrapper";
import type { CommonBlockProps as BlockProps } from "@reearth/beta/features/Visualizer/shared/types";
import { FC, useMemo } from "react";

import { StoryBlock } from "../../../types";

import TimelineEditor from "./Editor";

export type TimelineValues = {
  currentTime: string;
  startTime: string;
  endTime: string;
};

const TimelineBlock: FC<BlockProps<StoryBlock>> = ({
  block,
  isSelected,
  ...props
}) => {
  const timeline = useMemo(() => {
    return {
      timelineValues: block?.property?.default?.timelineSetting?.value,
      blockId: block?.id,
      playMode: block?.property?.default?.playMode?.value,
    };
  }, [
    block?.id,
    block?.property?.default?.playMode?.value,
    block?.property?.default?.timelineSetting?.value,
  ]);

  const { blockId, timelineValues, playMode } = timeline;

  return (
    <BlockWrapper
      name={block?.name}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.propertyId}
      property={block?.property}
      {...props}
    >
      <TimelineEditor
        inEditor={!!props.isEditable}
        padding={props.padding}
        timelineValues={timelineValues}
        blockId={blockId}
        playMode={playMode}
        property={block?.property}
      />
    </BlockWrapper>
  );
};

export default TimelineBlock;
