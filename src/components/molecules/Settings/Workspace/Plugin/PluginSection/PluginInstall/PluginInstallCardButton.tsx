import Flex from "@reearth/components/atoms/Flex";
import Icon, { Icons } from "@reearth/components/atoms/Icon";
import React from "react";
import Text from "@reearth/components/atoms/Text";
import { styled, useTheme } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

export type Props = {
  className?: string;
  onClick?: () => void;
  icon: Icons;
  text: string;
};

const PluginInstallCardButton: React.FC<Props> = ({ className, onClick, icon, text }) => {
  const theme = useTheme();
  return (
    <StyledButton onClick={onClick} className={className}>
      <Flex direction="column" align="center">
        <StyledIcon icon={icon} size={126} color={theme.colors.text.strong} />
        <Text size="l" color={theme.colors.text.strong} otherProperties={{ textAlign: "center" }}>
          {text}
        </Text>
      </Flex>
    </StyledButton>
  );
};

const StyledButton = styled.div`
  background-color: ${props => props.theme.colors.bg[3]};
  min-width: 280px;
  border-radius: ${props => props.theme.metrics.l}px;
  &:hover {
    background-color: ${props => props.theme.colors.bg[4]};
  }
  cursor: pointer;
  box-sizing: border-box;
  padding: ${metricsSizes["3xl"]}px;
`;

const StyledIcon = styled(Icon)`
  stroke: ${({ theme }) => theme.colors.text.strong};
  fill: ${({ theme }) => theme.colors.text.strong};
`;

export default PluginInstallCardButton;
