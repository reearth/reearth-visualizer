import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, ReactNode } from "react";

export type RadioProps = {
  value?: string;
  label?: string;
  disabled?: boolean;
  checked?: boolean;
  content?: ReactNode;
  onChange?: (value: string) => void;
  ariaLabel?: string;
  dataTestid?: string;
};

export const Radio: FC<RadioProps> = ({
  value,
  label,
  disabled,
  checked,
  content,
  onChange,
  ariaLabel,
  dataTestid
}) => {
  const handleChange = () => {
    if (disabled) return;
    onChange?.(value || "");
  };

  return (
    <Wrapper data-testid={dataTestid}>
      <RadioWrapper onClick={handleChange}>
        <RadioInput
          type="radio"
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          aria-label={!label ? ariaLabel : undefined}
        />
        <RadioButton checked={checked} disabled={disabled} aria-hidden="true">
          {checked && !disabled && <RadioIndicator checked={checked} />}
        </RadioButton>
        {label && <RadioLabel disabled={disabled}>{label}</RadioLabel>}
      </RadioWrapper>
      {content && <RadioContent>{content}</RadioContent>}
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  gap: theme.spacing.smallest,
  flexDirection: css.flexDirection.column,
  alignItems: css.alignItems.flexStart
}));

const RadioWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  gap: theme.spacing.smallest,
  alignItems: css.alignItems.center
}));

const RadioIndicator = styled("div")<{ checked?: boolean }>(
  ({ checked, theme }) => ({
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: checked ? theme.select.main : theme.content.main
  })
);

const RadioLabel = styled("div")<{ disabled?: boolean }>(
  ({ disabled, theme }) => ({
    color: disabled ? theme.content.weak : theme.content.main,
    fontSize: theme.fonts.sizes.body,
    fontWeight: theme.fonts.weight.regular,
    minWidth: "40px",
    cursor: disabled ? "not-allowed" : "pointer",
    flexGrow: 1
  })
);

const RadioInput = styled("input")(() => ({
  position: css.position.absolute,
  opacity: 0,
  width: 0,
  height: 0
}));

const RadioButton = styled("div")<{ checked?: boolean; disabled?: boolean }>(
  ({ checked, disabled, theme }) => ({
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    border: disabled
      ? `1px solid ${theme.content.weak}`
      : checked
        ? `1px solid ${theme.select.main}`
        : `1px solid ${theme.content.main}`,
    display: css.display.flex,
    alignItems: css.alignItems.center,
    justifyContent: css.justifyContent.center,
    cursor: disabled ? "not-allowed" : "pointer"
  })
);

const RadioContent = styled("div")(({ theme }) => ({
  padding: `${theme.spacing.small}px ${theme.spacing.large}px 0 ${theme.spacing.large}px`,
  width: "100%"
}));
