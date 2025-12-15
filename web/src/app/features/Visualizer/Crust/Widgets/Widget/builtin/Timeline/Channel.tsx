import { Button } from "@reearth/app/lib/reearth-widget-ui/components/ui/button";
import { Eye, EyeSlash } from "@reearth/app/lib/reearth-widget-ui/icons";
import { FC } from "react";

import { TIMELINE_CHANNEL_LABEL_WIDTH } from "./constants";
import { TimelineChannel } from "./types";

type ChannelProps = {
  channel: TimelineChannel;
  startTime: number;
  endTime: number;
  onToggleVisibility: (id: string) => void;
};

const LABEL_STYLE = {
  width: `${TIMELINE_CHANNEL_LABEL_WIDTH}px`,
  left: `-${TIMELINE_CHANNEL_LABEL_WIDTH + 4}px`
};

const Channel: FC<ChannelProps> = ({
  channel,
  startTime,
  endTime,
  onToggleVisibility
}) => {
  const channelStart = new Date(channel.startTime).getTime();
  const channelEnd = new Date(channel.endTime).getTime();

  const width = ((channelEnd - channelStart) / (endTime - startTime)) * 100;

  const left = ((channelStart - startTime) / (endTime - startTime)) * 100;

  const style = {
    width: `${width}%`,
    left: `${left}%`
  };

  return (
    <div className="relative flex h-6">
      <div
        className={`absolute border-r border-accent py-1 px-2 flex items-center justify-between h-6 gap-2 z-10 ${channel.hidden ? "opacity-50" : ""}`}
        style={LABEL_STYLE}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`flex-1 overflow-hidden whitespace-nowrap text-ellipsis select-none ${channel.valid ? "" : "text-red-500"}`}
          title={channel.title}
        >
          {channel.title}
        </div>
        <div className="flex items-center shrink-0">
          {channel.id !== "default" && (
            <Button
              variant="ghost"
              className="w-5 h-5 rounded-sm"
              onClick={() => onToggleVisibility(channel.id)}
            >
              {channel.hidden ? (
                <EyeSlash className="w-3 h-3" />
              ) : (
                <Eye className="w-3 h-3" />
              )}
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="relative w-full h-6 py-px pointer-events-none">
          <div
            className={`absolute h-5.5 rounded-sm opacity-50 transition-all min-w-0.5 ${channel.valid ? (channel.hidden ? "bg-accent" : "bg-primary") : ""}`}
            style={style}
          />
        </div>
      </div>
    </div>
  );
};

export default Channel;
