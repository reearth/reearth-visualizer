import { Button } from "@reearth/app/lib/reearth-widget-ui/components/ui/button";
import {
  resolveTheme,
  useSystemTheme
} from "@reearth/app/lib/reearth-widget-ui/hooks/useSystemTheme";
import {
  Play,
  Repeat,
  RepeatOnce,
  SkipBack,
  SkipForward
} from "@reearth/app/lib/reearth-widget-ui/icons";
import { FC, useMemo } from "react";

import { ComponentProps } from "../..";
import { CommonBuiltInWidgetProperty } from "../types";

import Channel from "./Channel";
import {
  TIMELINE_CHANNEL_DISPLAY_MAX,
  TIMELINE_CHANNEL_LABEL_WIDTH,
  TIMELINE_MIN_WIDTH
} from "./constants";
import useHooks from "./hooks";
import TicksBar from "./TicksBar";
import { WidgetTimelineChannelsProperty } from "./types";
import { formatTimelineTime } from "./utils";

const TIMELINE_MIN_WIDTH_STYLE = {
  minWidth: `${TIMELINE_MIN_WIDTH}px`
};

const CHANNEL_STYLE = {
  maxHeight: `${TIMELINE_CHANNEL_DISPLAY_MAX * 24}px`,
  paddingLeft: `${TIMELINE_CHANNEL_LABEL_WIDTH}px`
};

type Property = CommonBuiltInWidgetProperty & {
  general?: {
    displayTimezone?: string;
  };
  timelineChannels?: WidgetTimelineChannelsProperty[];
};

export type TimelineProps = ComponentProps<Property>;

const Timeline: FC<TimelineProps> = ({ widget, context }) => {
  const systemTheme = useSystemTheme();
  const themeClass = useMemo(
    () =>
      resolveTheme(widget.property?.appearance?.theme ?? "light", systemTheme),
    [widget.property?.appearance?.theme, systemTheme]
  );

  const {
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
  } = useHooks({
    widget,
    context
  });

  return (
    <div className={themeClass}>
      <div
        className={
          "w-full bg-background text-foreground rounded-md overflow-hidden text-xs"
        }
        style={TIMELINE_MIN_WIDTH_STYLE}
      >
        <div className="flex items-center justify-between px-2 py-1 border-b border-accent">
          <div>{formatTimelineTime(currentTime, displayTimezoneOffset)}</div>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="w-6 h-6 rounded-sm"
              onClick={skipBack}
            >
              <SkipBack />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              active={isPlaying}
              className="w-6 h-6 rounded-sm"
              onClick={togglePlay}
            >
              <Play />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="w-6 h-6 rounded-sm"
              onClick={toggleLoop}
            >
              {isLooping ? <Repeat /> : <RepeatOnce />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="w-6 h-6 rounded-sm"
              onClick={skipForward}
            >
              <SkipForward />
            </Button>
          </div>
        </div>
        <div className="relative">
          <div
            className={`absolute flex top-0 right-0 w-full h-full pl-[186px] pointer-events-none`}
          >
            <div className="relative" style={panelWidthStyle}>
              <TicksBar
                startTime={startTime}
                endTime={endTime}
                timezone={displayTimezoneOffset}
              />
            </div>
          </div>
          <div className="overflow-y-auto" style={CHANNEL_STYLE}>
            <div className="relative float-right w-full px-1">
              <div
                className="relative flex flex-col w-full "
                ref={timelinePanelRef}
                onMouseDown={handleTimelinePanelMouseDown}
                onMouseMove={handleTimelinePanelMouseMove}
                onMouseUp={handleTimelinePanelMouseUp}
              >
                {channels &&
                  channels.map((channel, index) => (
                    <Channel
                      key={index}
                      channel={channel}
                      startTime={startTime}
                      endTime={endTime}
                      onToggleVisibility={toggleChannelVisibility}
                    />
                  ))}
                <div
                  ref={indicatorRef}
                  className={`absolute w-0.5 h-full top-0 -translate-x-px rounded-xs bg-[#4770FF] ${
                    isDragging ? "bg-[#4770FF] shadow-lg" : ""
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
