import { getUniqueTimezones } from "@reearth/beta/utils/moment-timezone";
import moment from "moment-timezone";
import { useCallback, useEffect, useMemo, useState } from "react";

type Props = {
  value?: string;
  onChange?: (value?: string | undefined) => void;
  setDateTime?: (value?: string | undefined) => void;
  onClose: () => void;
};

type TimezoneInfo = {
  timezone: string;
  offset: string;
};

export default ({ value, onChange, setDateTime, onClose }: Props) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState<TimezoneInfo>({
    offset: "+00:00",
    timezone: "Africa/Abidjan",
  });

  const handleTimeChange = useCallback((newValue: string) => {
    if (!newValue) return;
    setTime(newValue);
  }, []);

  const handleDateChange = useCallback((newValue: string) => {
    if (!newValue) return;
    setDate(newValue);
  }, []);

  const offsetFromUTC: TimezoneInfo[] = useMemo(() => {
    return getUniqueTimezones(moment.tz.names());
  }, []);

  const handleTimezoneSelect = useCallback(
    (newValue: string | string[]) => {
      const updatedTimezone = offsetFromUTC.find(
        (info) => info.timezone === newValue,
      );
      setSelectedTimezone(updatedTimezone || selectedTimezone);
    },
    [offsetFromUTC, selectedTimezone],
  );

  const handleApply = useCallback(() => {
    const selectedTimezoneInfo = offsetFromUTC.find(
      (info) => info.timezone === selectedTimezone.timezone,
    );
    if (selectedTimezoneInfo) {
      const formattedDateTime = `${date}T${time}${selectedTimezoneInfo.offset}`;
      setDateTime?.(formattedDateTime);
      onChange?.(formattedDateTime);
    }
    onClose?.();
  }, [
    offsetFromUTC,
    onClose,
    selectedTimezone.timezone,
    date,
    time,
    setDateTime,
    onChange,
  ]);

  useEffect(() => {
    if (value) {
      const [parsedDate, timeWithOffset] = value.split("T");
      const [parsedTime, timezoneOffset] = timeWithOffset.split(/[-+]/);
      const [timezoneOffsetHour, timezoneOffsetMinute] =
        timezoneOffset.split(":");
      const formattedTimezoneOffset =
        timezoneOffsetHour.length === 2
          ? timezoneOffset
          : `${timezoneOffsetHour.padStart(2, "0")}:${timezoneOffsetMinute}`;

      setTime(parsedTime);
      setDate(parsedDate);

      const updatedTimezone = offsetFromUTC.find(
        (info) =>
          info.offset ===
          (timeWithOffset.includes("-")
            ? `-${formattedTimezoneOffset}`
            : `+${formattedTimezoneOffset}`),
      );
      if (updatedTimezone) setSelectedTimezone(updatedTimezone);
    } else {
      setDate("");
      setTime("");
      setSelectedTimezone({ offset: "+00:00", timezone: "Africa/Abidjan" });
    }
  }, [value, offsetFromUTC]);

  return {
    date,
    time,
    selectedTimezone,
    offsetFromUTC,
    handleTimeChange,
    handleTimezoneSelect,
    handleDateChange,
    handleApply,
  };
};
