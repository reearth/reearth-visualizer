import { ChangeEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { TimelineCommitter } from "@reearth/beta/lib/core/Map/useTimelineManager";
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
  onClick?: (t: number) => void;
  onDrag?: (t: number) => void;
  onPlay?: (isPlaying: boolean, committer: TimelineCommitter) => void;
  onPlayReversed?: (isPlaying: boolean, committer: TimelineCommitter) => void;
  onSpeedChange?: (speed: number, committer: TimelineCommitter) => void;
  onPause: (isPause: boolean, committer: TimelineCommitter) => void;
};

export default ({
  currentTime,
  range,
  isSelected,
  blockId,
  onPlay,
  onPlayReversed,
  onSpeedChange,
  onPause,
}: TimelineProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingReversed, setIsPlayingReversed] = useState(false);
  const [isPause, setIsPause] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(16);

  const syncCurrentTimeRef = useRef(currentTime);
  const [committer, setCommiter] = useState<TimelineCommitter>({ source: "storyTimelineBlock" });

  useEffect(() => {
    if (isSelected)
      setCommiter(prev => {
        return { source: prev.source, id: blockId };
      });
  }, [blockId, isSelected]);

  const handleOnSpeedChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      onSpeedChange?.(parseInt(e.currentTarget.value, 10), committer);
    },
    [committer, onSpeedChange],
  );

  const toggleIsPlaying = useCallback(() => {
    if (isPlayingReversed || isPause) {
      setIsPlayingReversed(false);
      setIsPause(false);
      onPlayReversed?.(false, committer);
      onPause?.(false, committer);
    }
    setIsPlaying(p => !p);
    onPlay?.(!isPlaying, committer);
  }, [isPlayingReversed, isPause, onPlay, isPlaying, committer, onPlayReversed, onPause]);

  const toggleIsPlayingReversed = useCallback(() => {
    if (isPlaying || isPause) {
      setIsPlaying(false);
      setIsPause(false);
      onPlay?.(false, committer);
      onPause?.(false, committer);
    }
    setIsPlayingReversed(p => !p);
    onPlayReversed?.(!isPlayingReversed, committer);

    if (isPlayingReversed) {
      const totalRange = range ? range.end - range.start : 0;
      const positionPercentage = (sliderPosition / totalRange) * 374 + 16;
      const newPosition = 390 - positionPercentage;
      setSliderPosition(Math.round(newPosition));
    }
  }, [
    committer,
    isPause,
    isPlaying,
    isPlayingReversed,
    onPause,
    onPlay,
    onPlayReversed,
    range,
    sliderPosition,
  ]);

  const toggleIsPause = useCallback(() => {
    if (isPlayingReversed || isPlaying) {
      setIsPlayingReversed(false);
      setIsPlaying(false);
      onPlayReversed?.(false, committer);
      onPlay?.(false, committer);
    }
    setIsPause(p => !p);
    onPause?.(!isPause, committer);
  }, [isPlayingReversed, isPlaying, onPause, isPause, committer, onPlayReversed, onPlay]);

  useEffect(() => {
    syncCurrentTimeRef.current = currentTime;
  }, [currentTime]);

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

  const updateSliderPosition = useCallback(() => {
    if (range && currentTime >= range.start && currentTime <= range.end) {
      const totalRange = range.end - range.start;
      const currentPosition = currentTime - range.start;

      if (currentPosition !== 0) {
        const positionPercentage = (currentPosition / totalRange) * 374 + 16; // 390 - 16 = 374
        setSliderPosition(Math.round(positionPercentage));
      }
    }
  }, [currentTime, range]);

  useEffect(() => {
    updateSliderPosition();
  }, [currentTime, range, updateSliderPosition]);

  useEffect(() => {
    if (currentTime === range?.end) {
      onPlay?.(false, committer);
    }
    if (currentTime === range?.start) {
      onPlayReversed?.(false, committer);
    }
  }, [currentTime, range?.start, range?.end, onPlay, onPlayReversed, committer]);

  return {
    formattedCurrentTime,
    timeRange,
    isPlaying,
    isPlayingReversed,
    isPause,
    sliderPosition,
    toggleIsPlaying,
    toggleIsPlayingReversed,
    toggleIsPause,
    handleOnSpeedChange,
  };
};
