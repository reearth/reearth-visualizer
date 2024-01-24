import { useCallback, useMemo, useState } from "react";

import { TimelineFieldProp } from "..";

type Props = {
  timelineValues?: TimelineFieldProp;
  onChange?: (value?: TimelineFieldProp) => void;
  onClose?: () => void;
  setTimelineValues?: (value?: TimelineFieldProp) => void;
};

export default ({ timelineValues, onChange, onClose, setTimelineValues }: Props) => {
  const [warning, setWarning] = useState(false);

  const handleOnChange = useCallback(
    (newValue: string, fieldId: string) => {
      const updatedData: TimelineFieldProp = {
        ...timelineValues,
        currentTime: timelineValues?.currentTime || "",
        startTime: timelineValues?.startTime || "",
        endTime: timelineValues?.endTime || "",
      };

      switch (fieldId) {
        case "startTime":
          updatedData.startTime = newValue || "";
          break;
        case "currentTime":
          updatedData.currentTime = newValue;
          if (
            updatedData.startTime &&
            new Date(updatedData.currentTime.substring(0, 19)) <
              new Date(updatedData.startTime.substring(0, 19))
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

      setTimelineValues?.(updatedData);
    },
    [timelineValues, setTimelineValues],
  );

  const [disabledFields, setDisabledFields] = useState<string[]>([]);

  const handlePopoverOpen = useCallback((fieldId?: string) => {
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

  const handleApplyChange = useCallback(() => {
    if (
      timelineValues?.currentTime !== "" &&
      timelineValues?.startTime !== "" &&
      timelineValues?.endTime !== ""
    ) {
      onChange?.(timelineValues);
      onClose?.();
    }
  }, [timelineValues, onChange, onClose]);

  const isDisabled = useMemo(() => {
    if (timelineValues) {
      return Object.values(timelineValues).every(value => value !== "");
    }
    return false;
  }, [timelineValues]);

  return {
    warning,
    isDisabled,
    disabledFields,
    setDisabledFields,
    handleOnChange,
    handlePopoverOpen,
    onAppyChange: handleApplyChange,
  };
};
