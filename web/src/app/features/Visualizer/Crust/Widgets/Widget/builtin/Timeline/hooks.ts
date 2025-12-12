import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import useChannels from "./useChannels";
import useIndicator from "./useIndicator";
import usePanel from "./usePanel";
import { getUserTimezoneOffset } from "./utils";

import { TimelineProps } from ".";

export default ({ widget, context }: TimelineProps) => {
  const { channels, toggleChannelVisibility } = useChannels({ widget });

  const displayTimezoneOffset = useMemo(() => {
    return (
      widget.property?.general?.display_timezone ?? getUserTimezoneOffset()
    );
  }, [widget.property?.general?.display_timezone]);

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

  // Update timeline and commit changes
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
        committer: "timelineWidget" as any
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
      committer: "timelineWidget" as any
    });
  }, [timelineManagerRef]);

  const setNoLoop = useCallback(() => {
    setIsLooping(false);
    timelineManagerRef?.current?.commit({
      cmd: "SET_OPTIONS",
      payload: {
        rangeType: "clamped"
      },
      committer: "timelineWidget" as any
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
      committer: "timelineWidget" as any
    });
  }, [timelineManagerRef, applyLoop]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    timelineManagerRef?.current?.commit({
      cmd: "PAUSE",
      committer: "timelineWidget" as any
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

  // Listen to timeline tick
  const handleTick = useCallback((currentTime: Date) => {
    const time = currentTime.getTime();
    setCurrentTime(time);
  }, []);
  useEffect(() => {
    const timelineManager = timelineManagerRef?.current;
    timelineManager?.onTick(handleTick);
    return () => {
      timelineManager?.offTick(handleTick);
    };
  }, [handleTick, timelineManagerRef]);

  // Initialize
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    const initialStartTime = widget.property?.general?.initial_time;
    if (!initialStartTime || !startTime || !endTime) return;
    updateTimeline(new Date(initialStartTime).getTime());
    console.log("initialized currentTime:", initialStartTime);
    initialized.current = true;
  }, [
    widget.property?.general?.initial_time,
    startTime,
    endTime,
    updateTimeline
  ]);

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
