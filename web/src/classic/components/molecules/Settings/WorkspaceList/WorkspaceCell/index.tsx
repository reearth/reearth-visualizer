import React from "react";

import Avatar from "@reearth/classic/components/atoms/Avatar";
import Flex from "@reearth/classic/components/atoms/Flex";
import Text from "@reearth/classic/components/atoms/Text";
import { metricsSizes } from "@reearth/classic/theme";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

export type Workspace = {
  id: string;
  name: string;
  personal: boolean;
  members: { userId: string; user?: { name: string } }[];
};

export type Props = {
  className?: string;
  workspace: Workspace;
  personal: boolean;
  onSelect?: (workspace: Workspace) => void;
};

const WorkspaceCell: React.FC<Props> = ({ className, workspace, personal, onSelect }) => {
  const t = useT();
  const workspaceMembers = workspace.members;
  const theme = useTheme();

  return (
    <Wrapper
      className={className}
      direction="column"
      justify="space-between"
      onClick={() => onSelect?.(workspace)}>
      <Text size="xl" color={theme.classic.main.text} otherProperties={{ userSelect: "none" }}>
        {workspace.name ? workspace.name : t("No Title Workspace")}
      </Text>
      {personal ? (
        <Text size="m" color={theme.classic.main.weak}>
          {t(
            "This is your personal workspace. Your projects and resources will be managed in this workspace.",
          )}
        </Text>
      ) : (
        <Flex align="center" justify="flex-start">
          <Flex wrap="wrap">
            {workspaceMembers.map(member => (
              <StyleAvatar key={member.userId} innerText={member.user?.name} />
            ))}
          </Flex>
        </Flex>
      )}
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  background: ${props => props.theme.classic.main.lighterBg};
  box-sizing: border-box;
  box-shadow: 0 0 5px ${props => props.theme.classic.projectCell.shadow};
  padding: ${metricsSizes["l"]}px ${metricsSizes["2xl"]}px;
  height: 240px;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.classic.main.paleBg};
  }
`;

const StyleAvatar = styled(Avatar)`
  margin-right: ${metricsSizes["s"]}px;
`;

export default WorkspaceCell;
