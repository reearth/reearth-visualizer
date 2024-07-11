import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMedia } from "react-use";

import Avatar from "@reearth/classic/components/atoms/Avatar";
import DashboardBlock from "@reearth/classic/components/atoms/DashboardBlock";
import Flex from "@reearth/classic/components/atoms/Flex";
import Icon from "@reearth/classic/components/atoms/Icon";
import Text from "@reearth/classic/components/atoms/Text";
import Policy from "@reearth/classic/components/molecules/Common/Policy";
import { Workspace as WorkspaceType } from "@reearth/classic/components/molecules/Dashboard/types";
import { metrics, metricsSizes } from "@reearth/classic/theme";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import { Member } from "./types";

export type Props = {
  className?: string;
  workspace?: WorkspaceType;
  isPersonal?: boolean;
};

const Workspace: React.FC<Props> = ({ className, workspace, isPersonal }) => {
  const theme = useTheme();
  const t = useT();
  const isSmallWindow = useMedia("(max-width: 1024px)");

  const [policyModalOpen, setPolicyModal] = useState(false);

  const { name, members, policy } = workspace ?? {};

  const workspaceMemberCount = useMemo(() => workspace?.members?.length ?? 0, [workspace?.members]);
  const excessMembers = useMemo(() => workspaceMemberCount - 5 ?? 0, [workspaceMemberCount]);

  const shownMembers: Member[] | undefined = useMemo(() => members?.slice(0, 5), [members]);

  const handlePolicyModalOpen = useCallback(() => setPolicyModal(true), []);

  const handlePolicyModalClose = useCallback(() => setPolicyModal(false), []);

  return (
    <StyledDashboardBlock className={className} grow={5}>
      <Content direction="column" justify="space-between">
        <WorkspaceHeader align="center" gap={12} wrap="wrap">
          <Text size={isSmallWindow ? "m" : "xl"} color={theme.classic.main.text} weight="bold">
            {name}
            {isPersonal && t("'s workspace")}
          </Text>
          {policy && (
            <Policy
              policy={policy}
              modalOpen={policyModalOpen}
              onModalOpen={handlePolicyModalOpen}
              onModalClose={handlePolicyModalClose}
            />
          )}
        </WorkspaceHeader>
        <Flex>
          <Flex flex={4}>
            {shownMembers?.map((member: Member) => (
              <StyledAvatar key={member?.user.id} innerText={member?.user.name} />
            ))}
            {excessMembers > 0 && <Avatar innerText={excessMembers} />}
          </Flex>
          <StyledLink to={`/settings/workspaces/${workspace?.id}`}>
            <StyledIcon icon="settings" />
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

const WorkspaceHeader = styled(Flex)``;

const Content = styled(Flex)`
  letter-spacing: 1px;
  min-width: ${metrics.dashboardWorkspaceMinWidth}px;
  height: ${metrics.dashboardContentHeight}px;
  padding: ${metricsSizes.xl}px;
  color: ${({ theme }) => theme.classic.main.text};

  @media only screen and (max-width: 1024px) {
    order: 3;
    height: ${metrics.dashboardContentSmallHeight}px;
  }
`;

const StyledIcon = styled(Icon)`
  border-radius: 5px;
  padding: ${metricsSizes["2xs"]}px;
  color: ${props => props.theme.classic.main.text};

  &:hover {
    background: ${props => props.theme.classic.main.bg};
  }
`;

const StyledLink = styled(Link)`
  color: ${props => props.theme.classic.main.text};
  text-decoration: none;
  display: flex;
  align-items: center;

  &:hover {
    text-decoration: none;
  }
`;

const StyledAvatar = styled(Avatar)`
  margin-right: ${metricsSizes["s"]}px;
`;

export default Workspace;
