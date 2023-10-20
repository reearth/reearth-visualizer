import { useCallback, useEffect, useState } from "react";

import { styled } from "@reearth/services/theme";

import Property from "..";
import TextInput from "../common/TextInput";

export type Props = {
  name?: string;
  description?: string;
  value?: string;
  onChange?: (value?: string | undefined) => void;
};

const DateTimeField: React.FC<Props> = ({ name, description, value, onChange }) => {
  const [time, setTime] = useState<string>();
  const [date, setDate] = useState<string>();

  const handleTimeChange = useCallback(
    (newValue: string | undefined) => {
      if (newValue === undefined) return;

      setTime(newValue + ":00 000");
      onChange?.(date + " " + newValue);
    },
    [date, onChange],
  );

  const handleDateChange = useCallback(
    (newValue: string | undefined) => {
      if (newValue === undefined) return;

      setDate(newValue);
      onChange?.(newValue + " " + time);
    },
    [time, onChange],
  );

  useEffect(() => {
    if (value) {
      const [dateString, timeString] = value.split(" ");
      setTime(timeString);
      setDate(dateString);
    }
  }, [value]);

  return (
    <Property name={name} description={description}>
      <Wrapper>
        <TextInput type="date" value={date} onChange={handleDateChange} />
        <TextInput type="time" value={time} onChange={handleTimeChange} />
      </Wrapper>
    </Property>
  );
};

export default DateTimeField;

const Wrapper = styled.div`
  display: flex;
  align-items: stretch;
  gap: 4px;
`;
