import moment from "moment-timezone";
import { useCallback, useState } from "react";

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
  const [timezones] = useState(moment.tz.names());
  const [selectedTimezone, setSelectedTimezone] = useState("+0:00");

  const handleTimeChange = useCallback((newValue: string | undefined) => {
    if (newValue === undefined) return;
    setTime(newValue);
  }, []);

  const handleDateChange = useCallback((newValue: string | undefined) => {
    if (newValue === undefined) return;
    setDate(newValue);
  }, []);

  const getUniqueTimezones = useCallback((timezones: string[]): TimezoneInfo[] => {
    const uniqueTimezones: TimezoneInfo[] = [];
    const seenOffsets = new Set<string>();
    timezones.forEach(timezone => {
      const offset = moment.tz(timezone).utcOffset() / 60;

      if (Number.isInteger(offset)) {
        const offsetString = offset >= 0 ? `+${offset}` : `${offset}`;
        const offsetTimezone = `${offsetString}:00`;

        if (!seenOffsets.has(offsetTimezone)) {
          uniqueTimezones.push({ timezone, offset: offsetTimezone });
          seenOffsets.add(offsetTimezone);
        }
      }
    });

    uniqueTimezones.sort((a, b) => {
      const offsetA = parseInt(a.offset);
      const offsetB = parseInt(b.offset);
      return offsetA - offsetB;
    });

    return uniqueTimezones;
  }, []);

  const zones: string[] = moment.tz.names();
  const offsetFromUTC: TimezoneInfo[] = getUniqueTimezones(zones);

  const handleApplyChange = useCallback(() => {
    const selectedTimezoneInfo = offsetFromUTC.find(info => info.timezone === selectedTimezone);
    if (selectedTimezoneInfo) {
      const formattedDateTime = `${date}T${time}:00${selectedTimezoneInfo.offset.split(" ")[0]}`;
      onChange?.(formattedDateTime);
    }
  }, [date, time, selectedTimezone, onChange, offsetFromUTC]);

  return {
    timezones,
    date,
    time,
    selectedTimezone,
    getUniqueTimezones,
    onTimeChange: handleTimeChange,
    onTimezoneSelect: setSelectedTimezone,
    onDateChange: handleDateChange,
    onDateTimeApply: handleApplyChange,
  };
};
