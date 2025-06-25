import {
  calculatePaddingValue,
  convertPositionToTime,
  formatDateForSliderTimeline,
  formatDateForTimeline,
  formatRangeDateAndTime
} from "@reearth/app/features/Visualizer/Crust/StoryPanel/utils";
import { DEFAULT_BLOCK_PADDING } from "@reearth/app/features/Visualizer/shared/components/BlockWrapper/hooks";
import { getNewDate } from "@reearth/app/features/Visualizer/shared/hooks/useTimelineBlock";
import { TickEventCallback, TimelineCommitter } from "@reearth/core";
import {
  ChangeEventHandler,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { PaddingProp } from "./Player";

import { TimelineValues } from ".";

export type Range = {
  start: number;
  mid: number;
  end: number;
};

type TimelineProps = {
  currentTime: number;
  range?: Range;
  isSelected?: boolean;
  blockId?: string;
  inEditor?: boolean;
  speed: number;
  playMode?: string;
  timelineValues?: TimelineValues;
  padding?: PaddingProp;
  property?: any;
  timezone?: string;
  onPlay?: (committer: TimelineCommitter) => void;
  onSpeedChange?: (speed: number, committerId?: string) => void;
  onPause: (committerId: string) => void;
  onTimeChange?: (time: Date, committerId?: string) => void;
  onCommit?: (cb: (committer: TimelineCommitter) => void) => void;
  removeOnCommitEventListener?: (
    cb: (committer: TimelineCommitter) => void
  ) => void;
  onTick?: (cb: TickEventCallback) => void;
  removeTickEventListener?: (cb: TickEventCallback) => void;
  setCurrentTime?: (t: number) => void;
};

type TimeEventHandler = (time: Date, committerId: string) => void;

export default ({
  currentTime,
  range,
  isSelected,
  blockId,
  inEditor,
  speed,
  playMode,
  timelineValues,
  padding,
  property,
  timezone,
  onPlay,
  onSpeedChange,
  onPause,
  onTimeChange,
  onCommit,
  onTick,
  removeOnCommitEventListener,
  removeTickEventListener,
  setCurrentTime
}: TimelineProps) => {
  const [isPause, setIsPause] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [activeBlock, setActiveBlock] = useState("");
  const [isPlayingReversed, setIsPlayingReversed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const [committer, setCommiter] = useState<TimelineCommitter>({
    source: "storyTimelineBlock",
    id: blockId
  });

  const [isOpen, setIsOpen] = useState(false);

  const [selected, setSelected] = useState("1sec/sec");
  const formattedCurrentTime = useMemo(() => {
    const textDate = formatDateForTimeline(
      currentTime,
      { detail: true },
      timezone
    );

    return textDate;
  }, [currentTime, timezone]);

  const current = formatRangeDateAndTime(
    formatDateForSliderTimeline(currentTime, { detail: true }, timezone)
  );

  const timeRange = useMemo(() => {
    if (range) {
      return {
        startTime: formatRangeDateAndTime(
          formatDateForSliderTimeline(range.start, { detail: true }, timezone)
        ),
        midTime: formatRangeDateAndTime(
          formatDateForSliderTimeline(range.mid, { detail: true }, timezone)
        ),
        endTime: formatRangeDateAndTime(
          formatDateForSliderTimeline(range.end, { detail: true }, timezone)
        )
      };
    }
    return {};
  }, [range, timezone]);

  const panelSettings = useMemo(() => {
    if (!property?.panel) return undefined;
    return {
      padding: {
        ...property?.panel?.padding,
        value: calculatePaddingValue(
          DEFAULT_BLOCK_PADDING,
          property?.panel?.padding?.value
        )
      }
    };
  }, [property?.panel]);

  const handlePopOver = useCallback(() => {
    if (!inEditor) setIsOpen(!isOpen);
  }, [inEditor, isOpen]);

  const handleOnSelect = useCallback(
    (value: string, second: number) => {
      if (!inEditor) {
        setIsOpen(false);
        if (value !== selected) setSelected(value);
        if (isPlayingReversed) {
          onSpeedChange?.(second * -1, committer.id);
        } else {
          onSpeedChange?.(second, committer.id);
        }
      }
    },
    [committer.id, inEditor, isPlayingReversed, onSpeedChange, selected]
  );

  useEffect(() => {
    if (isSelected)
      setCommiter((prev) => {
        return { source: prev.source, id: blockId };
      });
  }, [blockId, isSelected]);

  const handleOnSpeedChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      onSpeedChange?.(parseInt(e.currentTarget.value, 10), committer.id);
    },
    [committer, onSpeedChange]
  );

  const handleOnPlay = useCallback(() => {
    if (!inEditor) {
      if (isPlayingReversed || isPause) {
        setIsPlayingReversed?.(false);
        setIsPause(false);
      }
      onPlay?.(committer);
      setIsActive(true);
      if (committer?.id) setActiveBlock(committer.id);
      onTimeChange?.(new Date(currentTime), committer.id);
      onSpeedChange?.(Math.abs(speed), committer.id);
      setIsPlaying(true);
    }
  }, [
    inEditor,
    isPlayingReversed,
    isPause,
    onPlay,
    committer,
    onTimeChange,
    currentTime,
    onSpeedChange,
    speed
  ]);

  const handleOnPlayReversed = useCallback(() => {
    if (!inEditor) {
      if (isPlaying || isPause) {
        setIsPause(false);
        setIsPlaying(false);
      }
      onPlay?.(committer);
      setIsActive(true);
      setIsPlayingReversed(true);
      if (committer?.id) setActiveBlock(committer.id);
      onTimeChange?.(new Date(currentTime), committer.id);
      onSpeedChange?.(Math.abs(speed) * -1, committer.id);
    }
  }, [
    committer,
    currentTime,
    inEditor,
    isPause,
    isPlaying,
    onPlay,
    onSpeedChange,
    onTimeChange,
    speed
  ]);

  const handleOnPause = useCallback(() => {
    if (!inEditor) {
      if (isPlayingReversed || isPlaying) {
        setIsPlayingReversed?.(false);
        setIsPlaying?.(false);
      }
      if (committer?.id) onPause?.(committer.id);
      setIsPause(true);
    }
  }, [committer.id, inEditor, isPlaying, isPlayingReversed, onPause]);

  const handleTick = useCallback(
    (current: Date) => {
      return setCurrentTime?.(current.getTime());
    },
    [setCurrentTime]
  );

  const handleOnReset = useCallback(() => {
    if (!range) return;
    onTimeChange?.(new Date(range?.start), committer.id);
    setCurrentTime?.(range?.start);
    if (isPlaying) setIsPlaying(false);
    if (isPlayingReversed) setIsPlayingReversed(false);
    if (committer.id) onPause(committer.id);
  }, [
    range,
    onTimeChange,
    committer.id,
    setCurrentTime,
    isPlaying,
    isPlayingReversed,
    onPause
  ]);

  const handleOnResetAndPlay = useCallback(() => {
    if (!range) return;
    onTimeChange?.(new Date(range?.start), committer.id);
    if (isPlayingReversed) onTimeChange?.(new Date(range?.end), committer.id);
  }, [range, onTimeChange, committer.id, isPlayingReversed]);

  const handleOnDrag: TimeEventHandler = useCallback(
    (time: Date, committerId: string) => {
      onTimeChange?.(time, committerId);
      setCurrentTime?.(getNewDate(new Date(time)).getTime());
      handleOnPause();
    },
    [handleOnPause, onTimeChange, setCurrentTime]
  );

  const [target, setTarget] = useState<HTMLElement | null>(null);
  const distX = useRef<number>(0);
  const distY = useRef<number>(0);

  const handleOnStartMove = (e: React.MouseEvent) => {
    const targetElement = e.currentTarget as HTMLElement;
    setTarget(targetElement);
    const evt = e;
    distX.current = Math.abs(targetElement.offsetLeft - evt.clientX);
    distY.current = Math.abs(targetElement.offsetTop - evt.clientY);
    targetElement.style.pointerEvents = "none";
  };

  const handleOnEndMove = useCallback(() => {
    if (target) {
      target.style.pointerEvents = "initial";
      setTarget(null);
    }
  }, [target]);

  const handleOnMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!handleOnDrag || !e.target || !range) {
        return;
      }
      if (target && target.style.pointerEvents === "none" && !inEditor) {
        const conv = convertPositionToTime(
          e as unknown as MouseEvent,
          range.start,
          range.end
        );
        if (committer?.id) handleOnDrag(new Date(conv), committer?.id);
      }
    },
    [committer?.id, handleOnDrag, inEditor, range, target]
  );

  const handleOnClick: MouseEventHandler = useCallback(
    (e) => {
      if (!inEditor && range) {
        const conv = convertPositionToTime(
          e as unknown as MouseEvent,
          range.start,
          range.end
        );
        if (committer?.id) handleOnDrag(new Date(conv), committer?.id);
      }
    },
    [inEditor, range, committer?.id, handleOnDrag]
  );

  const handleTimelineCommitterChange = useCallback(
    (committer: TimelineCommitter) => {
      if (
        isActive &&
        (committer.source !== "storyTimelineBlock" ||
          committer.id !== activeBlock) &&
        range
      ) {
        setActiveBlock(" ");
        setIsActive(false);
        setIsPlaying(false);
        setIsPlayingReversed(false);
        const currentTimeValue = timelineValues?.currentTime ?? "";
        if (timelineValues) {
          setCurrentTime?.(
            getNewDate(new Date(currentTimeValue.substring(0, 19))).getTime()
          );
        } else {
          setCurrentTime?.(range?.start);
        }
      }
      setIsPause(false);
    },
    [activeBlock, isActive, range, setCurrentTime, timelineValues]
  );

  useEffect(() => {
    if (
      (range &&
        isPlaying &&
        JSON.stringify(currentTime) >= JSON.stringify(range?.end)) ||
      (range &&
        isPlayingReversed &&
        JSON.stringify(currentTime) <= JSON.stringify(range.start))
    ) {
      if (playMode === "loop") {
        return handleOnResetAndPlay();
      } else {
        return handleOnReset();
      }
    }
  }, [
    current,
    currentTime,
    handleOnPause,
    handleOnPlay,
    handleOnReset,
    handleOnResetAndPlay,
    isPlaying,
    isPlayingReversed,
    playMode,
    range,
    timeRange.endTime,
    timeRange.startTime
  ]);

  useEffect(() => {
    if (isActive) onTick?.(handleTick);
    onCommit?.(handleTimelineCommitterChange);
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
    removeTickEventListener
  ]);
  const blockRef = useRef<HTMLDivElement>(null);

  const handleResize = useCallback(() => {
    if ((padding || panelSettings?.padding.value) && blockRef.current) {
      const blockWidth = blockRef.current.offsetWidth;
      const thresholdWidth = 360;
      setIsMinimized(blockWidth < thresholdWidth);
    }
  }, [padding, panelSettings?.padding.value]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  const sliderPosition = useMemo(() => {
    const initialPosition = (() => {
      if (!isMinimized) {
        return 4;
      }

      return 4.5;
    })();

    const finalPosition = isMinimized ? 94.5 : 93.5;

    if (range) {
      if (!inEditor) {
        const totalRange = range?.end - range.start;
        const currentPosition = currentTime - range.start;
        let positionPercentage =
          (currentPosition / totalRange) * 90 + initialPosition;

        positionPercentage = Math.round(positionPercentage);
        positionPercentage = Math.max(positionPercentage, initialPosition);
        positionPercentage = Math.min(positionPercentage, finalPosition);
        return positionPercentage;
      }
    }
    return initialPosition;
  }, [isMinimized, range, inEditor, currentTime]);

  return {
    formattedCurrentTime,
    timeRange,
    isPlaying: isPlaying,
    isPlayingReversed,
    isPause,
    sliderPosition,
    isOpen,
    selected,
    isActive,
    isMinimized,
    blockRef,
    handleOnSelect,
    handlePopOver,
    toggleIsPlaying: handleOnPlay,
    toggleIsPlayingReversed: handleOnPlayReversed,
    toggleIsPause: handleOnPause,
    handleOnSpeedChange,
    handleOnMouseMove,
    handleOnClick,
    handleOnEndMove,
    handleOnStartMove
  };
};
