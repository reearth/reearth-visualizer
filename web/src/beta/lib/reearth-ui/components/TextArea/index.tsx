import { FC, useCallback, useEffect, useState, ChangeEvent, useRef } from "react";

import { fonts, styled } from "@reearth/services/theme";

export type TextAreaProps = {
  value?: string;
  placeholder?: string;
  resizable?: "autoSize" | "default";
  disabled?: boolean;
  rows?: number;
  counter?: boolean;
  onChange?: (text: string) => void;
  onBlur?: (text: string) => void;
};

export const TextArea: FC<TextAreaProps> = ({
  value,
  placeholder,
  resizable,
  rows,
  disabled,
  counter,
  onChange,
  onBlur,
}) => {
  const [currentValue, setCurrentValue] = useState(value ?? "");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCurrentValue(value ?? "");
    if (resizable === "autoSize" && textareaRef.current) {
      adjustHeight();
    }
  }, [value, resizable]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      let newValue = e.currentTarget.value;
      if (newValue.length > 200 && counter) {
        newValue = newValue.substring(0, 200);
      }
      setCurrentValue(newValue);
      onChange?.(newValue);
      if (resizable === "autoSize" && textareaRef.current) {
        adjustHeight();
      }
    },
    [counter, onChange, resizable],
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
    <Wrapper>
      <TextAreaWrapper status={isFocused ? "active" : "default"}>
        <StyledTextArea
          resizable={resizable}
          ref={textareaRef}
          rows={rows ? rows : 3}
          value={currentValue}
          disabled={disabled}
          placeholder={placeholder}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
        />
      </TextAreaWrapper>
      {counter && <CharacterCount>{currentValue.length} / 200</CharacterCount>}
    </Wrapper>
  );
};

const Wrapper = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
}));

const TextAreaWrapper = styled("div")<{
  status: "default" | "active";
}>(({ theme, status }) => ({
  border:
    status === "default" ? `1px solid ${theme.outline.weak}` : `1px solid ${theme.select.main}`,
  borderRadius: theme.radius.small,
  background: theme.bg[1],
  display: "flex",
  boxShadow: theme.shadow.input,
}));

const StyledTextArea = styled.textarea<{ resizable?: "default" | "autoSize"; disabled?: boolean }>(
  ({ theme, resizable, disabled }) => ({
    outline: "none",
    border: "none",
    background: "none",
    resize: resizable === "autoSize" ? "vertical" : "none",
    overflow: resizable === "autoSize" ? "hidden" : "auto",
    color: disabled ? theme.content.weaker : theme.content.main,
    flex: 1,
    cursor: disabled ? "not-allowed" : "auto",
    colorScheme: theme.colorSchema,
    "::placeholder": {
      color: theme.content.weak,
    },
    fontSize: fonts.sizes.body,
    lineHeight: `${fonts.lineHeights.body}px`,
    padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  }),
);

const CharacterCount = styled.span(({ theme }) => ({
  alignSelf: "flex-end",
  fontSize: fonts.sizes.body,
  color: theme.content.weak,
  marginLeft: theme.spacing.small,
}));
