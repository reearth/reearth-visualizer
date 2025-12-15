import { TimelineCommitter } from "@reearth/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { TIMELINE_COMMITER } from "./constants";
import useChannels from "./useChannels";
import useIndicator from "./useIndicator";
import usePanel from "./usePanel";
import { getUserTimezoneOffset } from "./utils";

import { TimelineProps } from ".";

export default ({ widget, context }: TimelineProps) => {
  const { channels, toggleChannelVisibility } = useChannels({ widget });

  const displayTimezoneOffset = useMemo(() => {
    return widget.property?.general?.displayTimezone ?? getUserTimezoneOffset();
  }, [widget.property?.general?.displayTimezone]);

  const timelineManagerRef = context?.timelineManagerRef;

  const [currentTime, setCurrentTime] = useState<number>(0);
  const { startTime, endTime } = useMemo(() => {
    const validAndVisibleChannels = channels?.filter(
      (channel) => channel.valid && !channel.hidden
    );
    if (!validAndVisibleChannels || validAndVisibleChannels.length === 0) {
      return {
        startTime: new Date().getTime(),
        endTime: new Date().getTime() + 86400000
      };
    }

    const start = Math.min(
      ...validAndVisibleChannels.map((channel) =>
        new Date(channel.startTime).getTime()
      )
    );
    const end = Math.max(
      ...validAndVisibleChannels.map((channel) =>
        new Date(channel.endTime).getTime()
      )
    );
    return { startTime: start, endTime: end };
  }, [channels]);

  const { indicatorRef, updateIndicatorPosition } = useIndicator({
    startTime,
    endTime
  });

  const updateTimeline = useCallback(
    (newTime: number) => {
      const clampedTime = Math.max(startTime, Math.min(newTime, endTime));

      timelineManagerRef?.current?.commit({
        cmd: "SET_TIME",
        payload: {
          current: new Date(clampedTime),
          start: new Date(startTime),
          stop: new Date(endTime)
        },
        committer: TIMELINE_COMMITER
      });

      setCurrentTime(clampedTime);
    },
    [startTime, endTime, timelineManagerRef]
  );

  const {
    timelinePanelRef,
    isDragging,
    panelWidthStyle,
    handleTimelinePanelMouseDown,
    handleTimelinePanelMouseMove,
    handleTimelinePanelMouseUp
  } = usePanel({
    indicatorRef,
    updateIndicatorPosition,
    startTime,
    endTime,
    currentTime,
    setCurrentTime,
    updateTimeline
  });

  const skipBack = useCallback(() => {
    updateTimeline(startTime);
  }, [startTime, updateTimeline]);

  const skipForward = useCallback(() => {
    updateTimeline(endTime);
  }, [endTime, updateTimeline]);

  const [isLooping, setIsLooping] = useState(false);

  const setLoop = useCallback(() => {
    setIsLooping(true);
    timelineManagerRef?.current?.commit({
      cmd: "SET_OPTIONS",
      payload: {
        rangeType: "bounced"
      },
      committer: TIMELINE_COMMITER
    });
  }, [timelineManagerRef]);

  const setNoLoop = useCallback(() => {
    setIsLooping(false);
    timelineManagerRef?.current?.commit({
      cmd: "SET_OPTIONS",
      payload: {
        rangeType: "clamped"
      },
      committer: TIMELINE_COMMITER
    });
  }, [timelineManagerRef]);

  const applyLoop = useCallback(() => {
    if (isLooping) {
      setLoop();
    } else {
      setNoLoop();
    }
  }, [isLooping, setLoop, setNoLoop]);

  const toggleLoop = useCallback(() => {
    if (!isLooping) {
      setLoop();
    } else {
      setNoLoop();
    }
  }, [isLooping, setLoop, setNoLoop]);

  const [isPlaying, setIsPlaying] = useState(false);

  const play = useCallback(() => {
    applyLoop();
    setIsPlaying(true);
    timelineManagerRef?.current?.commit({
      cmd: "PLAY",
      committer: TIMELINE_COMMITER
    });
  }, [timelineManagerRef, applyLoop]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    timelineManagerRef?.current?.commit({
      cmd: "PAUSE",
      committer: TIMELINE_COMMITER
    });
  }, [timelineManagerRef]);

  const togglePlay = useCallback(() => {
    if (!isPlaying) {
      play();
    } else {
      pause();
    }
  }, [isPlaying, play, pause]);

  const currentTimeRef = useRef<number>(currentTime);
  currentTimeRef.current = currentTime;
  useEffect(() => {
    if (currentTimeRef.current < startTime) {
      pause();
      updateTimeline(startTime);
    } else if (currentTimeRef.current > endTime) {
      pause();
      updateTimeline(endTime);
    }
  }, [startTime, endTime, updateTimeline, pause]);

  // Play finish check
  useEffect(() => {
    if (currentTime >= endTime && isPlaying && !isLooping) {
      pause();
    }
  }, [currentTime, endTime, isPlaying, isLooping, pause]);

  // Listen to timeline tick
  const handleTick = useCallback((currentTime: Date) => {
    const time = currentTime.getTime();
    setCurrentTime(time);
  }, []);

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const handleTimelineCommit = useCallback((commiter: TimelineCommitter) => {
    if (
      commiter?.source !== TIMELINE_COMMITER.source &&
      commiter?.id !== TIMELINE_COMMITER.id &&
      isPlayingRef.current
    ) {
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    const timelineManager = timelineManagerRef?.current;
    timelineManager?.onTick(handleTick);
    timelineManager?.onCommit(handleTimelineCommit);
    return () => {
      timelineManager?.offTick(handleTick);
      timelineManager?.offCommit(handleTimelineCommit);
    };
  }, [handleTick, timelineManagerRef, handleTimelineCommit]);

  updateIndicatorPosition(currentTime);

  return {
    channels,
    toggleChannelVisibility,
    startTime,
    endTime,
    currentTime,
    displayTimezoneOffset,
    timelinePanelRef,
    indicatorRef,
    isDragging,
    panelWidthStyle,
    handleTimelinePanelMouseDown,
    handleTimelinePanelMouseMove,
    handleTimelinePanelMouseUp,
    isPlaying,
    togglePlay,
    skipBack,
    skipForward,
    isLooping,
    toggleLoop
  };
};
