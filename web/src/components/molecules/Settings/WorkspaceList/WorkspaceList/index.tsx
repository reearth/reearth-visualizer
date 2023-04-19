import React, { useMemo } from "react";

import Button from "@reearth/components/atoms/Button";
import Text from "@reearth/components/atoms/Text";
import WorkspaceCell from "@reearth/components/molecules/Settings/WorkspaceList/WorkspaceCell";
import { Team as WorkspaceType } from "@reearth/gql/graphql-client-api";
import { useT } from "@reearth/i18n";
import { styled, useTheme } from "@reearth/theme";

export type Workspace = WorkspaceType;

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
        <Text size="m" color={theme.main.text} weight="normal">
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
  border-bottom: solid 1px ${({ theme }) => theme.projectCell.divider};
`;

const StyledListView = styled.div`
  display: flex;
  flex-direction: column;
  > * {
    margin-bottom: 32px;
  }
`;

const StyledWorkspaceCell = styled(WorkspaceCell)`
  border: ${props => `2px solid ${props.theme.main.select}`};
`;

export default WorkspaceList;
