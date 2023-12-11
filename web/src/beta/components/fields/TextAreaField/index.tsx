import { debounce } from "lodash-es";
import { useCallback, useLayoutEffect, useRef, useMemo, useState, useEffect } from "react";

import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import Property from "..";

export type Props = {
  value: string;
  onChange: (text: string) => void;
  minHeight?: number;
  placeholder?: string;
  name?: string;
  description?: string;
  disabled?: boolean;
  debounceBy?: number;
};

const TextAreaField: React.FC<Props> = ({
  name,
  description,
  value,
  onChange,
  placeholder,
  minHeight = 0,
  disabled,
  debounceBy = 1000,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const t = useT();

  const [text, setText] = useState(value);

  const debouncedHandleTextUpdate = useMemo(
    () => debounce(onChange, debounceBy),
    [onChange, debounceBy],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setText(e.currentTarget.value);
      debouncedHandleTextUpdate(e.currentTarget.value);
    },
    [debouncedHandleTextUpdate],
  );

  useLayoutEffect(() => {
    if (!textareaRef?.current) return;
    // Reset height - important to shrink on delete
    textareaRef.current.style.height = "inherit";
    // Set height
    textareaRef.current.style.height = `${Math.max(minHeight, textareaRef.current.scrollHeight)}px`;
  }, [text, minHeight]);

  useEffect(() => {
    setText(value);
  }, [value]);

  return (
    <Property name={name} description={description}>
      <StyledTextArea
        ref={textareaRef}
        placeholder={placeholder ?? t("Add text here")}
        value={text}
        onChange={handleChange}
        minHeight={minHeight}
        disabled={!!disabled}
      />
    </Property>
  );
};

const StyledTextArea = styled.textarea<{ minHeight: number; disabled: boolean }>`
  padding: 4px 8px;
  width: 100%;
  resize: none;
  overflow: hidden;
  min-height: ${({ minHeight }) => minHeight};
  border-radius: 4px;
  border: ${({ theme }) => `1px solid ${theme.outline.weak}`};
  font-size: 14px;
  outline: none;
  color: ${({ theme }) => theme.content.main};
  background: inherit;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? "not-allowed" : "inherit")};
  box-sizing: border-box;
`;

export default TextAreaField;
