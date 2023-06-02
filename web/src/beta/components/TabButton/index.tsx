import type { FC } from "react";

import { styled } from "@reearth/services/theme";

export type Props = {
  label: string;
  onClick: () => void;
  selected: boolean;
};

const TabButton: FC<Props> = ({ label, onClick, selected }) => {
  return (
    <Button onClick={onClick} disabled={selected}>
      {label}
    </Button>
  );
};

type ButtonProps = {
  disabled?: boolean;
};

const Button = styled.button<ButtonProps>`
  // Button Settings
  background: ${({ disabled }) => (disabled ? "#232226" : "inherit")};
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
    background: #232226;
    transition: all 0.5s ease;
  }

  // Text Settings
  color: ${({ disabled }) => (disabled ? "#C7C5C5" : "#4A4A4A")};
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 19px;
  text-align: center;
`;

export default TabButton;
