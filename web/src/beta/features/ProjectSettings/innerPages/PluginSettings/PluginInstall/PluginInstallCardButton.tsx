import React from "react";

import Icon, { Icons } from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { styled } from "@reearth/services/theme";

export type Props = {
  className?: string;
  icon: Icons;
  text: string;
  onClick?: () => void;
};

const PluginInstallCardButton: React.FC<Props> = ({ className, icon, text, onClick }) => (
  <StyledButton onClick={onClick} className={className}>
    <Icon icon={icon} size={126} />
    <Text size="h4">{text}</Text>
  </StyledButton>
);

const StyledButton = styled.div`
  box-sizing: border-box;
  flex: 1;
  min-width: 375px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.bg[1]};
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: ${({ theme }) => theme.metrics.l}px;
  color: ${({ theme }) => theme.content.main};
  cursor: pointer;
  padding: 0 20px 20px;
  &:hover {
    background-color: ${({ theme }) => theme.bg[2]};
  }
  transition: all 0.3s;
`;

export default PluginInstallCardButton;
