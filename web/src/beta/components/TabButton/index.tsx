import type { FC } from "react";

import Text from "@reearth/beta/components/Text";
import { styled } from "@reearth/services/theme";

import Icon, { Icons } from "../Icon";

export type Props = {
  label: string;
  icon?: Icons;
  onClick?: () => void;
  selected?: boolean;
};

const TabButton: FC<Props> = ({ label, icon, onClick, selected }) => {
  return (
    <Button onClick={onClick} disabled={selected}>
      {icon && <Icon icon={icon} size={20} />}
      <Text size="body" customColor>
        {label}
      </Text>
    </Button>
  );
};

type ButtonProps = {
  selected?: boolean;
};

const Button = styled.button<ButtonProps>`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  padding: 4px 8px;
  gap: 8px;
  border-radius: 4px;
  color: ${({ selected, theme }) =>
    selected ? theme.general.content.main : theme.general.content.weak};
  background: ${({ selected, theme }) => (selected ? theme.general.bg.weak : theme.navbar.bg.main)};
  line-height: 19px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  :hover {
    background: ${({ theme }) => theme.general.bg.weak};
    transition: all 0.4s;
  }
`;

export default TabButton;
