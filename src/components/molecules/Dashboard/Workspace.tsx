import React from "react";
import { useIntl } from "react-intl";
import { Link } from "@reach/router";
import DashboardBlock from "@reearth/components/atoms/DashboardBlock";
import Icon from "@reearth/components/atoms/Icon";
import { styled, useTheme, metrics } from "@reearth/theme";
import Text from "@reearth/components/atoms/Text";
import { useMedia } from "react-use";
import Flex from "@reearth/components/atoms/Flex";
import { metricsSizes } from "@reearth/theme/metrics";

import { Team as TeamType } from "@reearth/components/molecules/Dashboard/types";

export interface Props {
  className?: string;
  team?: TeamType;
}

const Workspace: React.FC<Props> = ({ className, team }) => {
  const intl = useIntl();
  const theme = useTheme();
  const isSmallWindow = useMedia("(max-width: 1024px)");

  return (
    <StyledDashboardBlock className={className} grow={5}>
      <Content direction="column" justify="space-between">
        <Text size={isSmallWindow ? "m" : "l"} color={theme.main.text} weight="bold">
          {team?.name}
          {intl.formatMessage({ defaultMessage: "'s workspace" })}
        </Text>
        <Flex>
          <TeamWrapper flex={4}>
            {team?.members?.map((member, i) => (
              <Text key={i} size="m" color={theme.main.text}>
                {member?.user.name}
              </Text>
            ))}
          </TeamWrapper>
          <StyledLink to={`/settings/workspace/${team?.id}`}>
            <Icon icon="settings" />
          </StyledLink>
        </Flex>
      </Content>
    </StyledDashboardBlock>
  );
};

const StyledDashboardBlock = styled(DashboardBlock)`
  flex-grow: 5;
  @media only screen and (max-width: 1024px) {
    order: 3;
  }
`;

const Content = styled(Flex)`
  letter-spacing: 1px;
  min-width: ${metrics.dashboardWorkspaceMinWidth}px;
  height: ${metrics.dashboardContentHeight}px;
  padding: ${metricsSizes.xl}px;
  color: ${({ theme }) => theme.main.text};

  @media only screen and (max-width: 1024px) {
    order: 3;
    height: ${metrics.dashboardContentSmallHeight}px;
  }
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.main.text};
  text-decoration: none;
  padding: ${metricsSizes["2xs"]}px;
  border-radius: ${metricsSizes.xs}px;
  align-self: flex-end;

  &:hover {
    text-decoration: none;
    background: ${({ theme }) => theme.main.bg};
  }
`;

const TeamWrapper = styled(Flex)`
  * {
    margin-right: ${metricsSizes.xl}px;
  }
`;

export default Workspace;
