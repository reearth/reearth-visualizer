import moment from "moment-timezone";
import { useCallback, useMemo, useState } from "react";

import { getUniqueTimezones } from "@reearth/beta/utils/moment-timezone";

type Props = {
  onChange?: (value?: string | undefined) => void;
};

type TimezoneInfo = {
  timezone: string;
  offset: string;
};

export default ({ onChange }: Props) => {
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [selectedTimezone, setSelectedTimezone] = useState("+0:00");

  const handleTimeChange = useCallback((newValue: string | undefined) => {
    if (newValue === undefined) return;
    setTime(newValue);
  }, []);

  const handleDateChange = useCallback((newValue: string | undefined) => {
    if (newValue === undefined) return;
    setDate(newValue);
  }, []);

  const offsetFromUTC: TimezoneInfo[] = useMemo(() => {
    return getUniqueTimezones(moment.tz.names());
  }, []);

  const handleApplyChange = useCallback(() => {
    const selectedTimezoneInfo = offsetFromUTC.find(info => info.timezone === selectedTimezone);
    if (selectedTimezoneInfo) {
      const formattedDateTime = `${date}T${time}:00${selectedTimezoneInfo.offset}`;
      onChange?.(formattedDateTime);
    }
  }, [date, time, selectedTimezone, onChange, offsetFromUTC]);

  return {
    date,
    time,
    selectedTimezone,
    offsetFromUTC,
    onTimeChange: handleTimeChange,
    onTimezoneSelect: setSelectedTimezone,
    onDateChange: handleDateChange,
    onDateTimeApply: handleApplyChange,
  };
};
