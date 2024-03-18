import React, { useMemo } from "react";

import Button from "@reearth/classic/components/atoms/Button";
import Text from "@reearth/classic/components/atoms/Text";
import WorkspaceCell, {
  type Workspace,
} from "@reearth/classic/components/molecules/Settings/WorkspaceList/WorkspaceCell";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

export type { Workspace } from "@reearth/classic/components/molecules/Settings/WorkspaceList/WorkspaceCell";

export type Props = {
  title?: string;
  workspaces?: Workspace[];
  currentWorkspace?: {
    id: string;
    name: string;
  };
  filterQuery?: string;
  onWorkspaceSelect?: (workspace: Workspace) => void;
  onCreationButtonClick?: () => void;
};

const WorkspaceList: React.FC<Props> = ({
  workspaces,
  currentWorkspace,
  title,
  filterQuery,
  onWorkspaceSelect,
  onCreationButtonClick,
}) => {
  const t = useT();
  const filteredWorkspaces = useMemo(
    () =>
      filterQuery
        ? workspaces?.filter(t => t.name.toLowerCase().indexOf(filterQuery.toLowerCase()) !== -1)
        : workspaces,
    [filterQuery, workspaces],
  );
  const theme = useTheme();

  return (
    <>
      <SubHeader>
        <Text size="m" color={theme.classic.main.text} weight="normal">
          {title || `${t("All workspaces")} (${filteredWorkspaces?.length || 0})`}
        </Text>
        <Button
          large
          buttonType="secondary"
          text={t("New Workspace")}
          onClick={onCreationButtonClick}
        />
      </SubHeader>
      <StyledListView>
        {filteredWorkspaces?.map(workspace => {
          return workspace.id === currentWorkspace?.id ? (
            <StyledWorkspaceCell
              workspace={workspace}
              key={workspace.id}
              onSelect={onWorkspaceSelect}
              personal={workspace.personal}
            />
          ) : (
            <WorkspaceCell
              workspace={workspace}
              key={workspace.id}
              onSelect={onWorkspaceSelect}
              personal={workspace.personal}
            />
          );
        })}
      </StyledListView>
    </>
  );
};

const SubHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: solid 1px ${({ theme }) => theme.classic.projectCell.divider};
`;

const StyledListView = styled.div`
  display: flex;
  flex-direction: column;
  > * {
    margin-bottom: 32px;
  }
`;

const StyledWorkspaceCell = styled(WorkspaceCell)`
  border: ${props => `2px solid ${props.theme.classic.main.select}`};
`;

export default WorkspaceList;
