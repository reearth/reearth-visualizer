import { useCallback, useMemo, useState } from "react";

import { TimePeriodFieldProp } from ".";

type Props = {
  timePeriodValues?: TimePeriodFieldProp;
  onChange?: (value?: TimePeriodFieldProp) => void;
  onClose?: () => void;
};

export default ({
  timePeriodValues,
  onChange,
  onClose,
}: Props) => {
  const [warning, setWarning] = useState(false);

  const handleChange = useCallback(
    (newValue: string, fieldId: string) => {
      const updatedData: TimePeriodFieldProp = {
        ...timePeriodValues,
        currentTime: timePeriodValues?.currentTime || "",
        startTime: timePeriodValues?.startTime || "",
        endTime: timePeriodValues?.endTime || ""
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
      onChange?.(updatedData);
    },
    [timePeriodValues, onChange]
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
      timePeriodValues?.currentTime !== "" &&
      timePeriodValues?.startTime !== "" &&
      timePeriodValues?.endTime !== ""
    ) {
      onChange?.(timePeriodValues);
      onClose?.();
    }
  }, [timePeriodValues, onChange, onClose]);

  const isDisabled = useMemo(() => {
    if (timePeriodValues) {
      return Object.values(timePeriodValues).every((value) => value !== "");
    }
    return false;
  }, [timePeriodValues]);

  return {
    warning,
    isDisabled,
    disabledFields,
    setDisabledFields,
    handleChange,
    handleTimePointPopup,
    handleSubmit,
  };
};
