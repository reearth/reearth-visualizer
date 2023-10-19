import { useMemo } from "react";

import { formatDateForSliderTimeline, formatDateForTimeline } from "../../../utils";
import { Range } from "../../types";

type TimelineProps = {
  currentTime: number;
  range?: Range;
};

export default ({ currentTime, range }: TimelineProps) => {
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
  };
};
