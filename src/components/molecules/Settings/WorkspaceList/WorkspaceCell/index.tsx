import React from "react";

import Avatar from "@reearth/components/atoms/Avatar";
import Flex from "@reearth/components/atoms/Flex";
import Text from "@reearth/components/atoms/Text";
import { useT } from "@reearth/i18n";
import { styled, useTheme } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

import { Workspace as WorkspaceType } from "../WorkspaceList";

export type Workspace = WorkspaceType;

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
      <Text size="xl" color={theme.main.text} otherProperties={{ userSelect: "none" }}>
        {workspace.name ? workspace.name : t("No Title Workspace")}
      </Text>
      {personal ? (
        <Text size="m" color={theme.main.weak}>
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
  background: ${props => props.theme.main.lighterBg};
  box-sizing: border-box;
  box-shadow: 0 0 5px ${props => props.theme.projectCell.shadow};
  padding: ${metricsSizes["l"]}px ${metricsSizes["2xl"]}px;
  height: 240px;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.main.paleBg};
  }
`;

const StyleAvatar = styled(Avatar)`
  margin-right: ${metricsSizes["s"]}px;
`;

export default WorkspaceCell;
