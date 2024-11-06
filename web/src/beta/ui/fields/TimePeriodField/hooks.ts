import { useCallback, useEffect, useMemo, useState } from "react";

import { TimePeriodFieldProp } from ".";

type Props = {
  timePeriodValues?: TimePeriodFieldProp;
  onChange?: (value?: TimePeriodFieldProp) => void;
  onClose?: () => void;
};

export default ({ timePeriodValues, onChange, onClose }: Props) => {
  const [warning, setWarning] = useState(false);

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
            setWarning(true);
          } else {
            setWarning(false);
          }
          break;
        case "endTime":
          updatedData.endTime = newValue;
          if (
            updatedData.endTime &&
            new Date(updatedData.currentTime.substring(0, 19)) >
              new Date(updatedData?.endTime?.substring(0, 19))
          ) {
            setWarning(true);
          } else {
            setWarning(false);
          }
          break;
        default:
          break;
      }
      setLocalValue(updatedData);
    },
    [localValue]
  );

  const [disabledFields, setDisabledFields] = useState<string[]>([]);

  const handleTimePointPopup = useCallback((fieldId?: string) => {
    switch (fieldId) {
      case "startTime":
        setDisabledFields(["endTime", "currentTime"]);
        break;
      case "endTime":
        setDisabledFields(["startTime", "currentTime"]);
        break;
      case "currentTime":
        setDisabledFields(["startTime", "endTime"]);
        break;
      default:
        setDisabledFields([]);
        break;
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (
      localValue?.currentTime !== "" &&
      localValue?.startTime !== "" &&
      localValue?.endTime !== ""
    ) {
      onChange?.(localValue);
    }
    onClose?.();
  }, [localValue, onChange, onClose]);

  const isDisabled = useMemo(() => {
    if (localValue) {
      return Object.values(localValue).every((value) => value !== "");
    }
    return false;
  }, [localValue]);

  return {
    warning,
    isDisabled,
    disabledFields,
    localValue,
    setDisabledFields,
    handleChange,
    handleTimePointPopup,
    handleSubmit
  };
};
