import { FC } from "react";

import { styled } from "@reearth/services/theme";

import { Workspace } from "../type";

import { Assets } from "./Assets";
import { Members } from "./Members";
import { Projects } from "./Projects";

export type ContainerProps = {
  workspaceId?: string;
  tab?: string;
  currentWorkspace?: Workspace;
};
const ContentsContainer: FC<ContainerProps> = ({ tab, workspaceId, currentWorkspace }) => {
  return (
    <Wrapper>
      {tab === "project" && <Projects workspaceId={workspaceId} />}
      {tab === "asset" && <Assets workspaceId={workspaceId} />}
      {tab === "members" && <Members currentWorkspace={currentWorkspace} />}
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  padding: `${theme.spacing.largest}px ${theme.spacing.largest}px 0 ${theme.spacing.largest}px`,
  flex: 1,
  background: theme.bg[0],
}));

export default ContentsContainer;
