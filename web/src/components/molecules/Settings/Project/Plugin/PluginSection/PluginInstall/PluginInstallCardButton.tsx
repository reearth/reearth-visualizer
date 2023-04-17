import React from "react";

import Flex from "@reearth/components/atoms/Flex";
import Icon, { Icons } from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import { styled } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

export type Props = {
  className?: string;
  icon: Icons;
  text: string;
  onClick?: () => void;
};

const PluginInstallCardButton: React.FC<Props> = ({ className, icon, text, onClick }) => (
  <StyledButton onClick={onClick} className={className}>
    <Flex direction="column" align="center">
      <Icon icon={icon} size={126} />
      <Text size="l" customColor otherProperties={{ textAlign: "center" }}>
        {text}
      </Text>
    </Flex>
  </StyledButton>
);

const StyledButton = styled.div`
  box-sizing: border-box;
  min-width: 375px;
  background-color: ${props => props.theme.main.lighterBg};
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: ${props => props.theme.metrics.l}px;
  color: ${({ theme }) => theme.main.text};
  cursor: pointer;
  padding: 0 ${metricsSizes["3xl"]}px ${metricsSizes["3xl"]}px;
  &:hover {
    background-color: ${props => props.theme.main.paleBg};
    color: ${({ theme }) => theme.main.strongText};
  }
  transition: all 0.3s;
`;

export default PluginInstallCardButton;
