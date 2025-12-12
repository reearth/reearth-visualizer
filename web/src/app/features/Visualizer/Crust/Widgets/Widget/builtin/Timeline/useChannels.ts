import { useT } from "@reearth/services/i18n";
import { useEffect, useState } from "react";

import { TimelineChannel } from "./types";
import { isTimelineValid } from "./utils";

import { TimelineProps } from ".";

export default ({ widget }: TimelineProps) => {
  const [channels, setChannels] = useState<TimelineChannel[] | null>(null);
  const [hiddenChannelIds, setHiddenChannelIds] = useState<string[]>([]);

  const t = useT();

  useEffect(() => {
    if (widget.property?.timeline_channels) {
      const newChannels = widget.property.timeline_channels.map((channel) => ({
        id: channel.id,
        title: channel.timeline_title || t("New Channel"),
        startTime: channel.timeline_range?.startTime || "",
        endTime: channel.timeline_range?.endTime || "",
        currentTime: channel.timeline_range?.currentTime || "",
        valid: isTimelineValid(channel.timeline_range || {}),
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
  }, [widget.property?.timeline_channels, t, hiddenChannelIds]);

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
