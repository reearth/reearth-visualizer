import { FC } from "react";

import { styled } from "@reearth/services/theme";

export type SwitcherProps = {
  isOn: boolean;
  onClick: () => void;
  disabled?: boolean;
};

export const Switcher: FC<SwitcherProps> = ({ isOn, onClick, disabled }) => {
  return (
    <SwitcherContainer onClick={onClick} isOn={isOn} disabled={disabled}>
      <SwitcherCircle isOn={isOn} disabled={disabled} />
    </SwitcherContainer>
  );
};

const SwitcherContainer = styled.div<{ isOn: boolean; disabled?: boolean }>(
  ({ isOn, theme, disabled }) => ({
    width: "24px",
    height: "14px",
    borderRadius: theme.radius.large,
    backgroundColor: disabled
      ? theme.outline.weaker
      : isOn
      ? theme.primary.main
      : theme.outline.weaker,
    display: "flex",
    alignItems: "center",
    cursor: disabled ? "not-allowed" : "pointer",
  }),
);

const SwitcherCircle = styled.div<{ isOn: boolean; disabled?: boolean }>(
  ({ isOn, theme, disabled }) => ({
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    backgroundColor: disabled ? theme.outline.weak : theme.content.withBackground,
    transition: "transform 0.3s",
    transform: isOn ? "translateX(12px)" : "translateX(0)",
  }),
);
