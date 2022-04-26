import { Link } from "@reach/router";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { useMedia } from "react-use";

import Avatar from "@reearth/components/atoms/Avatar";
import DashboardBlock from "@reearth/components/atoms/DashboardBlock";
import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import { Team as TeamType } from "@reearth/components/molecules/Dashboard/types";
import { styled, useTheme, metrics } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

import { Member } from "./types";

export interface Props {
  className?: string;
  team?: TeamType;
}

const Workspace: React.FC<Props> = ({ className, team }) => {
  const intl = useIntl();
  const theme = useTheme();
  const isSmallWindow = useMedia("(max-width: 1024px)");

  const teamLength = team?.members?.length ?? 0;
  const excessMembers = teamLength - 5 ?? 0;

  const shownMembers: Member[] | undefined = useMemo(
    () => team?.members?.slice(0, 5),
    [team?.members],
  );

  return (
    <StyledDashboardBlock className={className} grow={5}>
      <Content direction="column" justify="space-between">
        <Text size={isSmallWindow ? "m" : "l"} color={theme.main.text} weight="bold">
          {team?.name}
          {intl.formatMessage({ defaultMessage: "'s workspace" })}
        </Text>
        <Flex>
          <Flex flex={4}>
            {shownMembers?.map((member: Member) => (
              <StyledAvatar key={member?.user.id} innerText={member?.user.name} />
            ))}
            {excessMembers > 0 && <Avatar innerText={excessMembers} />}
          </Flex>
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
  display: flex;

  &:hover {
    text-decoration: none;
    background: ${({ theme }) => theme.main.bg};
  }
`;

const StyledAvatar = styled(Avatar)`
  margin-right: ${metricsSizes["s"]}px;
`;

export default Workspace;
