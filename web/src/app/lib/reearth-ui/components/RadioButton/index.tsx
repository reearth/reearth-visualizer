import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC } from "react";

import { Icon, IconName } from "../Icon";

export type RadioButtonItem = {
  id: string;
  label: string;
  disabled?: boolean;
  icon?: IconName;
};

export type RadioButtonProps = {
  items: RadioButtonItem[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
  "data-testid"?: string;
};

const RadioButtonGroup = styled("div")(({ theme }) => ({
  display: css.display.flex,
  borderRadius: theme.radius.normal,
  overflow: css.overflow.hidden,
  width: "fit-content",
  boxShadow: theme.shadow.button
}));

const RadioButtonItem = styled("label", {
  shouldForwardProp: (prop) => !["selected", "disabled"].includes(prop)
})<{
  selected?: boolean;
  disabled?: boolean;
}>(({ theme, selected, disabled }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.smallest,
  padding: `${theme.spacing.smallest - 1}px ${theme.spacing.small}px`,
  backgroundColor: theme.bg[1],
  border: `1px solid ${selected ? theme.primary.main : theme.outline.weak}`,
  color: selected ? theme.primary.main : theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  lineHeight: 1.5,
  cursor: disabled ? "not-allowed" : "pointer",
  userSelect: css.userSelect.none,
  boxSizing: css.boxSizing.borderBox,

  "&:first-of-type": {
    borderTopLeftRadius: theme.radius.normal,
    borderBottomLeftRadius: theme.radius.normal
  },

  "&:last-of-type": {
    borderTopRightRadius: theme.radius.normal,
    borderBottomRightRadius: theme.radius.normal
  },

  "&:focus-visible": {
    outline: `2px solid ${theme.primary.main}`,
    outlineOffset: "2px",
    zIndex: 1
  },

  ...(disabled && {
    opacity: 0.6,
    color: theme.content.weaker,
    backgroundColor: theme.bg[1]
  })
}));

const HiddenRadioInput = styled("input")({
  position: css.position.absolute,
  opacity: 0,
  pointerEvents: css.pointerEvents.none,
  width: 0,
  height: 0
});

const IconWrapper = styled("span")<{ disabled?: boolean }>(
  ({ theme, disabled }) => ({
    display: css.display.flex,
    alignItems: css.alignItems.center,
    color: disabled ? theme.content.weaker : "inherit"
  })
);

export const RadioButton: FC<RadioButtonProps> = ({
  items,
  value,
  onChange,
  disabled = false,
  ariaLabel,
  "data-testid": dataTestid
}) => {
  const handleItemClick = (itemId: string, itemDisabled?: boolean) => {
    if (disabled || itemDisabled) return;
    onChange?.(itemId);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent,
    itemId: string,
    itemDisabled?: boolean
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleItemClick(itemId, itemDisabled);
    }
  };

  return (
    <RadioButtonGroup
      role="radiogroup"
      aria-label={ariaLabel}
      data-testid={dataTestid}
    >
      {items.map((item) => {
        const isSelected = value === item.id;
        const isDisabled = disabled || item.disabled;

        return (
          <RadioButtonItem
            key={item.id}
            selected={isSelected}
            disabled={isDisabled}
            onClick={() => handleItemClick(item.id, item.disabled)}
            onKeyDown={(event: React.KeyboardEvent) => handleKeyDown(event, item.id, item.disabled)}
            tabIndex={isDisabled ? -1 : 0}
            role="radio"
            aria-checked={isSelected}
            aria-disabled={isDisabled}
            aria-label={item.label}
          >
            <HiddenRadioInput
              type="radio"
              name="radio-button-group"
              value={item.id}
              checked={isSelected}
              disabled={isDisabled}
              tabIndex={-1}
              onChange={() => {}}
            />
            {item.icon && (
              <IconWrapper disabled={isDisabled}>
                <Icon icon={item.icon} size={12} aria-hidden="true" />
              </IconWrapper>
            )}
            {item.label}
          </RadioButtonItem>
        );
      })}
    </RadioButtonGroup>
  );
};
