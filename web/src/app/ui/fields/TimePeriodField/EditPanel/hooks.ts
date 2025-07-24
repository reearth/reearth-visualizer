import { getTimeZone, isValidDateTimeFormat } from "@reearth/app/utils/time";
import { useCallback, useEffect, useMemo, useState } from "react";

import { TimePeriodFieldProp } from "..";

type Props = {
  timePeriodValues?: TimePeriodFieldProp;
  onChange?: (value?: TimePeriodFieldProp) => void;
  onClose?: () => void;
};

export default ({ timePeriodValues, onChange, onClose }: Props) => {
  const [timeRangeInvalid, setTimeRangeInvalid] = useState(false);

  const [localValue, setLocalValue] = useState(timePeriodValues);

  useEffect(() => {
    setLocalValue(timePeriodValues);
  }, [timePeriodValues]);

  const handleChange = useCallback(
    (newValue: string, fieldId: string) => {
      const updatedData: TimePeriodFieldProp = {
        ...(localValue ?? {}),
        currentTime: localValue?.currentTime || "",
        startTime: localValue?.startTime || "",
        endTime: localValue?.endTime || ""
      };

      switch (fieldId) {
        case "startTime":
          updatedData.startTime = newValue || "";
          break;
        case "currentTime":
          updatedData.currentTime = newValue;
          if (
            (updatedData.startTime &&
              new Date(updatedData.currentTime.substring(0, 19)) <
                new Date(updatedData.startTime.substring(0, 19))) ||
            new Date(updatedData.currentTime.substring(0, 19)) >
              new Date(updatedData.endTime.substring(0, 19))
          ) {
            setTimeRangeInvalid(true);
          } else {
            setTimeRangeInvalid(false);
          }
          break;
        case "endTime":
          updatedData.endTime = newValue;
          if (
            updatedData.endTime &&
            new Date(updatedData.currentTime.substring(0, 19)) >
              new Date(updatedData?.endTime?.substring(0, 19))
          ) {
            setTimeRangeInvalid(true);
          } else {
            setTimeRangeInvalid(false);
          }
          break;
        default:
          break;
      }
      setLocalValue(updatedData);
    },
    [localValue]
  );

  const handleSubmit = useCallback(() => {
    if (
      localValue &&
      isValidDateTimeFormat(localValue?.startTime) &&
      isValidDateTimeFormat(localValue?.currentTime) &&
      isValidDateTimeFormat(localValue?.endTime)
    ) {
      onChange?.(localValue);
    }
    onClose?.();
  }, [localValue, onChange, onClose]);

  const submitDisabled = useMemo(() => {
    if (
      !localValue?.startTime ||
      !localValue?.currentTime ||
      !localValue?.endTime ||
      timeRangeInvalid
    ) {
      return true;
    }

    const startTimezone = getTimeZone(localValue?.startTime);
    const currentTimezone = getTimeZone(localValue?.currentTime);
    const endTimezone = getTimeZone(localValue?.endTime);
    if (startTimezone !== currentTimezone || currentTimezone !== endTimezone) {
      return true;
    }

    return false;
  }, [localValue, timeRangeInvalid]);

  return {
    timeRangeInvalid,
    submitDisabled,
    localValue,
    handleChange,
    handleSubmit
  };
};
