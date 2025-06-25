import {
  type ParsedDateTime,
  getLocalTimezoneOffset,
  isValidDateTimeFormat,
  isValidTimezone,
  parseDateTime,
  TimeZoneOffset
} from "@reearth/app/utils/time";
import { useCallback, useEffect, useMemo, useState } from "react";

type Props = {
  value?: string;
  onChange?: (value?: string | undefined) => void;
  onClose: () => void;
};

export default ({ value, onChange, onClose }: Props) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timezone, setTimezone] = useState<TimeZoneOffset>(
    getLocalTimezoneOffset()
  );

  const handleTimeChange = useCallback((newValue: string) => {
    if (!newValue) return;
    setTime(newValue);
  }, []);

  const handleDateChange = useCallback((newValue: string) => {
    if (!newValue) return;
    setDate(newValue);
  }, []);

  const handleTimezoneSelect = useCallback((newValue: string | string[]) => {
    if (typeof newValue !== "string") return;
    setTimezone(newValue as TimeZoneOffset);
  }, []);

  const handleApply = useCallback(() => {
    const formattedDateTime = `${date}T${time}${timezone}`;
    onChange?.(formattedDateTime);
    onClose?.();
  }, [onClose, date, time, timezone, onChange]);

  useEffect(() => {
    if (value && isValidDateTimeFormat(value)) {
      //Since isValidDateTimeFormat already validates the input, it's safe to assert the type as ParsedDateTime.
      const { parsedDate, timeWithOffset, parsedTime, timezoneOffset } =
        parseDateTime(value) as ParsedDateTime;

      setDate(parsedDate);
      setTime(parsedTime);
      setTimezone(
        (timeWithOffset.includes("-")
          ? `-${timezoneOffset}`
          : `+${timezoneOffset}`) as TimeZoneOffset
      );
    } else {
      setDate("");
      setTime("");
      setTimezone(getLocalTimezoneOffset());
    }
  }, [value]);

  const applyDisabled = useMemo(
    () => !date || !time || !isValidTimezone(timezone),
    [date, time, timezone]
  );

  return {
    date,
    time,
    timezone,
    applyDisabled,
    handleTimeChange,
    handleTimezoneSelect,
    handleDateChange,
    handleApply
  };
};
