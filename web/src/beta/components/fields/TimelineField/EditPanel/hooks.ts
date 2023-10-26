import { useCallback, useMemo, useState } from "react";

type Props = {
  value?: string;
  onChange?: (value?: string | undefined) => void;
  onClose?: () => void;
};

type TimelineFieldProp = {
  currentTime: string;
  startTime: string;
  stopTime: string;
};

export default ({ onChange, onClose }: Props) => {
  const [data, setData] = useState<TimelineFieldProp>({
    currentTime: "",
    startTime: "",
    stopTime: "",
  });
  const [warning, setWarning] = useState(false);

  const handleOnChange = useCallback(
    (newValue: string, fieldId: string) => {
      const updatedData: TimelineFieldProp = { ...data };
      switch (fieldId) {
        case "startTime":
          updatedData.startTime = newValue;
          break;
        case "stopTime":
          updatedData.stopTime = newValue;
          break;
        case "currentTime":
          updatedData.currentTime = newValue;

          if (
            (updatedData.startTime &&
              updatedData.stopTime &&
              new Date(updatedData.currentTime.substring(0, 19)) <
                new Date(updatedData.startTime.substring(0, 19))) ||
            new Date(updatedData.currentTime.substring(0, 19)) >
              new Date(updatedData.stopTime.substring(0, 19))
          ) {
            setWarning(true);
          } else {
            setWarning(false);
          }
          break;
        default:
          break;
      }

      setData(updatedData);
    },
    [data],
  );

  const handleApplyChange = useCallback(() => {
    if (data.currentTime !== "" && data.startTime !== "" && data.stopTime !== "") {
      onChange?.(data.startTime);
      onChange?.(data.stopTime);
      onChange?.(data.currentTime);
      onClose?.();
    }
  }, [data.currentTime, data.startTime, data.stopTime, onChange, onClose]);

  const isDisabled = useMemo(() => {
    return Object.values(data).every(value => value !== "");
  }, [data]);

  return {
    warning,
    data,
    isDisabled,
    handleOnChange,
    onAppyChange: handleApplyChange,
  };
};
