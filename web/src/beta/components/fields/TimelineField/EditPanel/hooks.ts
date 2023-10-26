import { useCallback, useState } from "react";

type Props = {
  value?: string;
  onChange?: (value?: string | undefined) => void;
};

type TimelineFieldProp = {
  currentTime: string;
  startTime: string;
  stopTime: string;
};

export default ({ onChange }: Props) => {
  const [data, setData] = useState<TimelineFieldProp>({
    currentTime: "",
    startTime: "",
    stopTime: "",
  });

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
    }
  }, [onChange, data]);

  return {
    data,
    handleOnChange,
    onAppyChange: handleApplyChange,
  };
};
