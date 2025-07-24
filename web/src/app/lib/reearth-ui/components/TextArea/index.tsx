import { fonts, styled } from "@reearth/services/theme";
import { FC, useCallback, useEffect, useState, ChangeEvent } from "react";

export type TextAreaProps = {
  value?: string;
  placeholder?: string;
  resizable?: "none" | "height";
  appearance?: "readonly" | "present";
  disabled?: boolean;
  rows?: number;
  counter?: boolean;
  maxLength?: number;
  onChange?: (text: string) => void;
  onBlur?: (text: string) => void;
  ariaLabel?: string;
  dataTestid?: string;
};

export const TextArea: FC<TextAreaProps> = ({
  value,
  placeholder,
  resizable,
  rows = 5,
  disabled,
  counter,
  maxLength,
  appearance,
  onChange,
  onBlur,
  ariaLabel,
  dataTestid
}) => {
  const [currentValue, setCurrentValue] = useState(value ?? "");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setCurrentValue(value ?? "");
  }, [value, resizable]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.currentTarget.value;
      setCurrentValue(newValue);
      onChange?.(newValue);
    },
    [onChange]
  );

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.(currentValue);
  }, [currentValue, onBlur]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  return (
    <Wrapper>
      <TextAreaWrapper
        appearance={appearance}
        status={isFocused ? "active" : "default"}
      >
        <StyledTextArea
          resizable={resizable}
          rows={rows}
          value={currentValue}
          disabled={disabled}
          placeholder={placeholder}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          maxLength={maxLength}
          appearance={appearance}
          aria-label={ariaLabel}
          data-testid={dataTestid}
        />
      </TextAreaWrapper>
      {counter && maxLength ? (
        <CharacterCount>
          {currentValue.length} / {maxLength}
        </CharacterCount>
      ) : (
        counter && <CharacterCount>{currentValue.length}</CharacterCount>
      )}
    </Wrapper>
  );
};

const Wrapper = styled("div")(() => ({
  display: "flex",
  flexDirection: "column"
}));

const TextAreaWrapper = styled("div")<{
  status: "default" | "active";
  appearance?: "readonly" | "present";
}>(({ appearance, theme, status }) => ({
  border:
    appearance === "present"
      ? `1px solid transparent`
      : status === "default" || appearance === "readonly"
        ? `1px solid ${theme.outline.weak}`
        : `1px solid ${theme.select.main}`,
  borderRadius: theme.radius.small,
  background: "transparent",
  display: "flex",
  boxShadow: theme.shadow.input
}));

const StyledTextArea = styled.textarea<{
  resizable?: "none" | "height";
  disabled?: boolean;
  appearance?: "readonly" | "present";
}>(({ theme, resizable, disabled, appearance }) => ({
  outline: "none",
  border: "none",
  background: theme.bg[1],
  resize: resizable === "height" ? "vertical" : "none",
  overflow: "auto",
  flex: 1,
  color:
    disabled && appearance !== "readonly"
      ? theme.content.weaker
      : theme.content.main,
  cursor: disabled || appearance === "readonly" ? "not-allowed" : "auto",
  colorScheme: theme.colorSchema,
  fontSize: fonts.sizes.body,
  lineHeight: `${fonts.lineHeights.body}px`,
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  minHeight: fonts.lineHeights.body * 2 + theme.spacing.smallest * 2,
  overflowX: "hidden",
  boxSizing: "border-box",
  "::placeholder": {
    color: theme.content.weak
  }
}));

const CharacterCount = styled.span(({ theme }) => ({
  alignSelf: "flex-end",
  fontSize: fonts.sizes.body,
  color: theme.content.weak,
  marginLeft: theme.spacing.small
}));
