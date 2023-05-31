import type { FC } from "react";

import { styled } from "@reearth/services/theme";

export type Props = {
  label: string;
  onClick: () => void;
  disabled: boolean;
};

const TabButton: FC<Props> = ({ label, onClick, disabled }) => {
  return (
    <Button data-testid="atoms-tabbutton" disabled={disabled} onClick={onClick}>
      {label}
    </Button>
  );
};

type ButtonProps = {
  disabled?: boolean;
};

const Button = styled.button<ButtonProps>`
  // Button Settings
  background: ${({ disabled }) => (disabled ? "#232226" : "#232226")};
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 8px 12px;
  gap: 10px;
  position: absolute;
  height: 35px;
  left: 0px;
  top: 0px;
  border-radius: 4px;
  :hover {
    background: ${({ disabled }) => (disabled ? "lightgrey" : "#232226")};
  }
  // Text Settings
  color: ${({ disabled }) => (disabled ? "#4A4A4A" : "#C7C5C5")};
  font-family: "Noto Sans";
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 19px;
  text-align: center;
`;

export default TabButton;
