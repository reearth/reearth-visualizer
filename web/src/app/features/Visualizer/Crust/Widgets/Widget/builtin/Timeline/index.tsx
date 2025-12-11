import { FC, useMemo } from "react";

import { ComponentProps } from "../..";
import { CommonBuiltInWidgetProperty } from "../types";

type Property = CommonBuiltInWidgetProperty & {
  general?: {
    initial_time?: string;
    display_timezone?: string;
  };
  timeline_channels?: {
    timeline_title?: string;
    timeline_range?: {
      start?: string;
      end?: string;
      current?: string;
    };
  }[];
};
type TimelineProps = ComponentProps<Property>;

const Timeline: FC<TimelineProps> = ({ widget }) => {
  const theme = useMemo(
    () => widget.property?.appearance?.theme ?? "light",
    [widget.property?.appearance?.theme]
  );

  return (
    <div className={theme}>
      <div className="w-full min-w-[700px] bg-background text-foreground rounded-md overflow-hidden">
        123
      </div>
    </div>
  );
};

export default Timeline;
