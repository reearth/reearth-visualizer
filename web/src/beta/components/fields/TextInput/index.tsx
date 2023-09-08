import { useCallback, useEffect, useRef, useState } from "react";

import { styled } from "@reearth/services/theme";

import Property from "..";

type Props = {
  name?: string;
  description?: string;
  value?: string;
  timeout?: number;
  onChange?: (text: string) => void;
  onBlur?: () => void;
  onExit?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

const TextInput: React.FC<Props> = ({
  name,
  description,
  value,
  timeout = 1000,
  onChange,
  onBlur,
  onExit,
}) => {
  const [currentValue, setCurrentValue] = useState(value ?? "");
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setCurrentValue(value ?? "");
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const newValue = e.currentTarget.value;

      setCurrentValue(newValue);

      timeoutRef.current = setTimeout(() => {
        if (newValue === undefined) return;
        onChange?.(newValue);
      }, timeout);
    },
    [onChange, timeout],
  );

  const handleBlur = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onChange?.(currentValue);
    onBlur?.();
  }, [currentValue, onChange, onBlur]);

  const handleExit = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if ((e.key === "Enter" || e.key === "Return") && currentValue !== value) {
        onChange?.(currentValue);
        onExit?.(e);
      }
    },
    [value, currentValue, onChange, onExit],
  );

  return (
    <Property name={name} description={description}>
      <StyledInput
        value={currentValue ?? ""}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyUp={handleExit}
      />
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
