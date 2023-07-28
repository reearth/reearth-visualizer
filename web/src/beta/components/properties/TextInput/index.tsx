import { useCallback, useEffect, useRef, useState } from "react";

import { styled } from "@reearth/services/theme";

import Property from "..";

type Props = {
  name?: string;
  description?: string;
  value?: string;
  onChange?: (text: string) => void;
};

const TextInput: React.FC<Props> = ({ name, description, value, onChange }) => {
  const [currentValue, setCurrentValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (currentValue === undefined) return;
      onChange?.(currentValue);
    }, 3000);
  }, [currentValue, onChange]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      clearTimeout(timeoutRef.current);
      const newValue = e.currentTarget.value;

      setCurrentValue(newValue);
    },
    [],
  );

  return (
    <Property name={name} description={description}>
      <StyledInput onChange={handleChange} />
    </Property>
  );
};

export default TextInput;

const StyledInput = styled.input`
  outline: none;
  background: ${({ theme }) => theme.bg[1]};
  color: ${({ theme }) => theme.content.main};
  border: 1px solid ${({ theme }) => theme.outline.weak};
  border-radius: 4px;
  padding: 4px 8px;
  transition: all 0.3s;

  :focus {
    border-color: ${({ theme }) => theme.outline.main};
  }
`;
