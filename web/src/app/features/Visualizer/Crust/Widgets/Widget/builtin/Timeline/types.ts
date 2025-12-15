export type WidgetTimelineChannelsProperty = {
  id: string;
  channelTitle: string;
  channelRange: {
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
