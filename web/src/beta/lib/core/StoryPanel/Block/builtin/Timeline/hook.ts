import { ChangeEventHandler, useCallback, useEffect, useMemo, useState } from "react";

import {
  TickEventCallback,
  TimelineCommitter,
} from "@reearth/beta/lib/core/Map/useTimelineManager";
import { Range } from "@reearth/beta/lib/core/StoryPanel/Block/types";
import {
  formatDateForSliderTimeline,
  formatDateForTimeline,
  formatRangeDateAndTime,
} from "@reearth/beta/lib/core/StoryPanel/utils";

type TimelineProps = {
  currentTime: number;
  range?: Range;
  isSelected?: boolean;
  blockId?: string;
  inEditor?: boolean;
  speed: number;
  onClick?: (t: number) => void;
  onDrag?: (t: number) => void;
  onPlay?: (committer: TimelineCommitter) => void;
  onSpeedChange?: (speed: number, committerId?: string) => void;
  onPause: (committerId: string) => void;
  onTimeChange?: (time: Date, committerId?: string) => void;
  onCommit?: (cb: (committer: TimelineCommitter) => void) => void | undefined;
  removeOnCommitEventListener?: (cb: (committer: TimelineCommitter) => void) => void | undefined;
  onTick?: (cb: TickEventCallback) => void | undefined;
  removeTickEventListener?: (cb: TickEventCallback) => void | undefined;
  setCurrentTime?: (t: number) => void;
};

export default ({
  currentTime,
  range,
  isSelected,
  blockId,
  inEditor,
  speed,
  onPlay,
  onSpeedChange,
  onPause,
  onTimeChange,
  onCommit,
  onTick,
  removeOnCommitEventListener,
  removeTickEventListener,
  setCurrentTime,
}: TimelineProps) => {
  const [isPause, setIsPause] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [activeBlock, setActiveBlock] = useState("");
  const [isPlayingReversed, setIsPlayingReversed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [committer, setCommiter] = useState<TimelineCommitter>({
    source: "storyTimelineBlock",
    id: blockId,
  });

  const [isOpen, setIsOpen] = useState(false);

  const [selected, setSelected] = useState("1min/sec");
  const handlePopOver = useCallback(() => {
    !inEditor && setIsOpen(!isOpen);
  }, [inEditor, isOpen]);

  const handleOnSelect = useCallback(
    (value: string, second: number) => {
      if (!inEditor) {
        setIsOpen(false);
        value !== selected && setSelected(value);
        isPlayingReversed
          ? onSpeedChange?.(second * -1, committer.id)
          : onSpeedChange?.(second, committer.id);
      }
    },
    [committer.id, inEditor, isPlayingReversed, onSpeedChange, selected],
  );

  useEffect(() => {
    if (isSelected)
      setCommiter(prev => {
        return { source: prev.source, id: blockId };
      });
  }, [blockId, isSelected]);

  const handleOnSpeedChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      onSpeedChange?.(parseInt(e.currentTarget.value, 10), committer.id);
    },
    [committer, onSpeedChange],
  );

  const handleOnPlay = useCallback(() => {
    if (isPlayingReversed || isPause) {
      setIsPlayingReversed?.(false);
      setIsPause(false);
    }
    onPlay?.(committer);
    setIsActive(true);
    committer?.id && setActiveBlock(committer.id);
    onTimeChange?.(new Date(currentTime), committer.id);
    onSpeedChange?.(Math.abs(speed), committer.id);
    setIsPlaying(true);
  }, [
    isPlayingReversed,
    isPause,
    onPlay,
    committer,
    onTimeChange,
    currentTime,
    onSpeedChange,
    speed,
  ]);

  const handleOnPlayReversed = useCallback(() => {
    if (isPlaying || isPause) {
      setIsPause(false);
      setIsPlaying(false);
    }
    onPlay?.(committer);
    setIsActive(true);
    setIsPlayingReversed(true);
    committer?.id && setActiveBlock(committer.id);
    onTimeChange?.(new Date(currentTime), committer.id);
    onSpeedChange?.(Math.abs(speed) * -1, committer.id);
  }, [committer, currentTime, isPause, isPlaying, onPlay, onSpeedChange, onTimeChange, speed]);

  const handleOnPause = useCallback(() => {
    if (isPlayingReversed || isPlaying) {
      setIsPlayingReversed?.(false);
      setIsPlaying?.(false);
    }
    committer?.id && onPause?.(committer.id);
    setIsPause(!isPause);
  }, [committer.id, isPause, isPlaying, isPlayingReversed, onPause]);

  const formattedCurrentTime = useMemo(() => {
    const textDate = formatDateForTimeline(currentTime, { detail: true });
    return textDate;
  }, [currentTime]);

  const timeRange = useMemo(() => {
    if (range) {
      return {
        startTime: formatRangeDateAndTime(
          formatDateForSliderTimeline(range.start, { detail: true }),
        ),
        midTime: formatRangeDateAndTime(formatDateForSliderTimeline(range.mid, { detail: true })),
        endTime: formatRangeDateAndTime(formatDateForSliderTimeline(range.end, { detail: true })),
      };
    }
    return {};
  }, [range]);

  const sliderPosition = useMemo(() => {
    if (range && currentTime >= range.start && currentTime <= range?.end) {
      // if (!inEditor) {
      // const totalRange = range?.end - range.start;
      const currentPosition = currentTime - range.start;
      const positionPercentage = (currentPosition / 86400000) * 10;
      return Math.round(positionPercentage);
      // }
    }
    return 3;
  }, [range, currentTime]);

  const handleTick = useCallback(
    (current: Date) => {
      return setCurrentTime?.(current.getTime());
    },
    [setCurrentTime],
  );

  const handleTimelineCommitterChange = useCallback(
    (committer: TimelineCommitter) => {
      if (isActive && (committer.source !== "storyTimelineBlock" || committer.id !== activeBlock)) {
        setActiveBlock(" ");
        setIsActive(false);
        setIsPause(false);
        setIsPlaying(false);
        setIsPlayingReversed(false);
      }
    },
    [activeBlock, isActive],
  );

  useEffect(() => {
    if (isActive) onTick?.(handleTick), onCommit?.(handleTimelineCommitterChange);
    return () => {
      removeTickEventListener?.(handleTick);
      removeOnCommitEventListener?.(handleTimelineCommitterChange);
    };
  }, [
    handleTick,
    handleTimelineCommitterChange,
    isActive,
    isPlaying,
    isPlayingReversed,
    onCommit,
    onTick,
    removeOnCommitEventListener,
    removeTickEventListener,
  ]);
  return {
    formattedCurrentTime,
    timeRange,
    isPlaying: isPlaying,
    isPlayingReversed,
    isPause,
    sliderPosition,
    isOpen,
    selected,
    handleOnSelect,
    handlePopOver,
    toggleIsPlaying: handleOnPlay,
    toggleIsPlayingReversed: handleOnPlayReversed,
    toggleIsPause: handleOnPause,
    handleOnSpeedChange,
  };
};
