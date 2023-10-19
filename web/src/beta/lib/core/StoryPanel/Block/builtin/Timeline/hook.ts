import { ChangeEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Range } from "@reearth/beta/lib/core/StoryPanel/Block/types";
import {
  formatDateForSliderTimeline,
  formatDateForTimeline,
} from "@reearth/beta/lib/core/StoryPanel/utils";

type TimelineProps = {
  currentTime: number;
  range?: Range;
  onClick?: (t: number) => void;
  onDrag?: (t: number) => void;
  onPlay?: (isPlaying: boolean) => void;
  onPlayReversed?: (isPlaying: boolean) => void;
  onSpeedChange?: (speed: number) => void;
};

export default ({
  currentTime,
  range,
  onClick,
  onDrag,
  onPlay,
  onPlayReversed,
  onSpeedChange,
}: TimelineProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingReversed, setIsPlayingReversed] = useState(false);
  const syncCurrentTimeRef = useRef(currentTime);
  console.log(onClick, onDrag);
  const handleOnSpeedChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      onSpeedChange?.(parseInt(e.currentTarget.value, 10));
    },
    [onSpeedChange],
  );
  const toggleIsPlaying = useCallback(() => {
    if (isPlayingReversed) {
      setIsPlayingReversed(false);
      onPlayReversed?.(false);
    }
    setIsPlaying(p => !p);
    onPlay?.(!isPlaying);
  }, [isPlayingReversed, onPlay, isPlaying, onPlayReversed]);

  const toggleIsPlayingReversed = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      onPlay?.(false);
    }
    setIsPlayingReversed(p => !p);
    onPlayReversed?.(!isPlayingReversed);
  }, [isPlaying, isPlayingReversed, onPlay, onPlayReversed]);

  useEffect(() => {
    syncCurrentTimeRef.current = currentTime;
  }, [currentTime]);

  const formattedCurrentTime = useMemo(() => {
    const textDate = formatDateForTimeline(currentTime, { detail: true });
    return textDate;
  }, [currentTime]);

  const formatRangeDateAndTime = (data: string) => {
    const lastIdx = data.lastIndexOf(" ");
    const date = data.slice(0, lastIdx);
    const time = data.slice(lastIdx + 1);
    return {
      date,
      time,
    };
  };

  const timeRange = useMemo(() => {
    if (range) {
      return {
        startTime: formatRangeDateAndTime(
          formatDateForSliderTimeline(range.start, { detail: true }),
        ),
        midTime: formatRangeDateAndTime(formatDateForSliderTimeline(range.mid)),
        endTime: formatRangeDateAndTime(formatDateForSliderTimeline(range.end)),
      };
    }
  }, [range]);

  return {
    formattedCurrentTime,
    timeRange,
    toggleIsPlaying,
    toggleIsPlayingReversed,
    handleOnSpeedChange,
  };
};
