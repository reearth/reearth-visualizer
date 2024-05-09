import { FC, useCallback, useEffect, useState, ChangeEvent, useRef } from "react";

import { fonts, styled } from "@reearth/services/theme";

export type TextAreaProps = {
  value?: string;
  placeholder?: string;
  filled?: "default" | "autoSize";
  onChange?: (text: string) => void;
  onBlur?: (text: string) => void;
};

export const TextArea: FC<TextAreaProps> = ({
  value,
  placeholder,
  filled = "default",
  onChange,
  onBlur,
}) => {
  const [currentValue, setCurrentValue] = useState(value ?? "");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCurrentValue(value ?? "");
    if (filled === "autoSize" && textareaRef.current) {
      adjustHeight();
    }
  }, [value, filled]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.currentTarget.value;
      setCurrentValue(newValue);
      onChange?.(newValue);
      if (filled === "autoSize" && textareaRef.current) {
        adjustHeight();
      }
    },
    [onChange, filled],
  );

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onChange?.(currentValue);
    onBlur?.(currentValue);
  }, [currentValue, onChange, onBlur]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const adjustHeight = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  };

  return (
    <Wrapper status={isFocused ? "active" : "default"}>
      <StyledTextArea
        filled={filled}
        ref={textareaRef}
        rows={filled === "default" ? 3 : undefined}
        value={currentValue}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
      />
    </Wrapper>
  );
};

const Wrapper = styled("div")<{
  status: "default" | "active";
}>(({ theme, status }) => ({
  border:
    status === "default" ? `1px solid ${theme.outline.weak}` : `1px solid ${theme.select.main}`,
  borderRadius: theme.radius.small,
  background: theme.bg[1],
  display: "flex",
}));

const StyledTextArea = styled.textarea<{ filled: "default" | "autoSize" }>(({ theme, filled }) => ({
  outline: "none",
  border: "none",
  background: "none",
  resize: "none",
  overflow: filled === "autoSize" ? "hidden" : "auto",
  color: theme.content.main,
  flex: 1,
  colorScheme: theme.colorSchema,
  "::placeholder": {
    color: theme.content.weak,
  },
  fontSize: fonts.sizes.body,
  lineHeight: `${fonts.lineHeights.body}px`,
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`,
}));
