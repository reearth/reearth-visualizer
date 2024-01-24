import { HTMLInputTypeAttribute, useCallback, useEffect, useState } from "react";

import { styled } from "@reearth/services/theme";

export type Props = {
  className?: string;
  value?: string;
  placeholder?: string;
  autoFocus?: boolean;
  type?: HTMLInputTypeAttribute;
  step?: number;
  onChange?: (text: string) => void;
  onBlur?: () => void;
  onExit?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
};

const TextInput: React.FC<Props> = ({
  className,
  value,
  placeholder,
  autoFocus,
  step,
  onChange,
  onBlur,
  onExit,
  disabled,
  type,
}) => {
  const [currentValue, setCurrentValue] = useState(value ?? "");

  useEffect(() => {
    setCurrentValue(value ?? "");
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.currentTarget.value;
      if (newValue === undefined) return;
      setCurrentValue(newValue);
    },
    [],
  );

  const handleBlur = useCallback(() => {
    onChange?.(currentValue);
    onBlur?.();
  }, [currentValue, onChange, onBlur]);

  const handleExit = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        onExit?.(e);
      } else if (e.key === "Enter" || e.key === "Return") {
        onChange?.(currentValue);
        onExit?.(e);
      }
    },
    [currentValue, onChange, onExit],
  );

  return (
    <StyledInput
      className={className}
      type={type}
      value={currentValue ?? ""}
      placeholder={placeholder}
      autoFocus={autoFocus}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyUp={handleExit}
      disabled={!!disabled}
      step={step}
    />
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
  flex: 1;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? "none" : "inherit")};
  :focus {
    border-color: ${({ theme }) => theme.outline.main};
  }
  color-scheme: dark;
`;
