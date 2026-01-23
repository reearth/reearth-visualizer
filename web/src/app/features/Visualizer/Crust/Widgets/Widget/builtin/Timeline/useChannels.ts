import { useT } from "@reearth/services/i18n/hooks";
import { useEffect, useState } from "react";

import { TimelineChannel } from "./types";
import { isTimelineValid } from "./utils";

import { TimelineProps } from ".";

export default ({ widget }: TimelineProps) => {
  const [channels, setChannels] = useState<TimelineChannel[] | null>(null);
  const [hiddenChannelIds, setHiddenChannelIds] = useState<string[]>([]);

  const t = useT();

  useEffect(() => {
    if (widget.property?.timelineChannels) {
      const newChannels = widget.property.timelineChannels.map((channel) => ({
        id: channel.id,
        title: channel.channelTitle || t("New Channel"),
        startTime: channel.channelRange?.startTime || "",
        endTime: channel.channelRange?.endTime || "",
        currentTime: channel.channelRange?.currentTime || "",
        valid: isTimelineValid(channel.channelRange || {}),
        hidden: hiddenChannelIds.includes(channel.id)
      }));
      setChannels(newChannels);
    } else {
      setChannels([
        {
          title: t("Default Channel"),
          id: "default",
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 86400000).toISOString(),
          currentTime: new Date().toISOString(),
          valid: true,
          hidden: false
        }
      ]);
    }
  }, [widget.property?.timelineChannels, t, hiddenChannelIds]);

  const toggleChannelVisibility = (id: string) => {
    setHiddenChannelIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  return {
    channels,
    toggleChannelVisibility
  };
};
