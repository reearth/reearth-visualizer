import type { FC } from "react";

import { styled } from "@reearth/services/theme";

export type Props = {
  label: string;
  onClick?: () => void;
  selected?: boolean;
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
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  padding: 8px 12px;
  gap: 10px;
  width: 67px;
  height: 35px;
  border-radius: 4px;
  color: ${({ disabled, theme }) => (disabled ? theme.main.text : theme.main.weak)};
  background: ${({ disabled, theme }) => (disabled ? theme.main.lighterBg : theme.editorNavBar.bg)};
  font-weight: 700;
  font-size: 14px;
  line-height: 19px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  :hover {
    background: ${({ theme }) => theme.main.lighterBg};
    transition: all 0.5s ease;
  }
`;

export default TabButton;
