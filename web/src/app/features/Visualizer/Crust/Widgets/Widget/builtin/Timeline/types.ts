export type WidgetTimelineChannelsProperty = {
  id: string;
  timeline_title: string;
  timeline_range: {
    startTime: string;
    endTime: string;
    currentTime: string;
  };
};

export type TimelineChannel = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  currentTime: string;
  valid: boolean;
  hidden: boolean;
};
