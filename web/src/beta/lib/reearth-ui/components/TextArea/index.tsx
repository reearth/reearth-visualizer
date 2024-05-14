import { FC, useCallback, useEffect, useState, ChangeEvent } from "react";

import { fonts, styled } from "@reearth/services/theme";

export type TextAreaProps = {
  value?: string;
  placeholder?: string;
  resizable?: "none" | "height";
  disabled?: boolean;
  rows?: number;
  counter?: boolean;
  maxLength?: number;
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
  maxLength,
  onChange,
  onBlur,
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
    [onChange],
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
      <TextAreaWrapper status={isFocused ? "active" : "default"}>
        <StyledTextArea
          resizable={resizable}
          rows={rows ? rows : 3}
          value={currentValue}
          disabled={disabled}
          placeholder={placeholder}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          maxLength={maxLength}
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

const StyledTextArea = styled.textarea<{ resizable?: "none" | "height"; disabled?: boolean }>(
  ({ theme, resizable, disabled }) => ({
    outline: "none",
    border: "none",
    background: "none",
    resize: resizable === "height" ? "vertical" : "none",
    overflow: resizable === "height" ? "scroll" : "auto",
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
