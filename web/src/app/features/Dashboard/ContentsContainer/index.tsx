import { styled } from "@reearth/services/theme";
import { FC } from "react";

import { Workspace } from "../type";

import Members from "./Members";
import Projects from "./Projects";
import RecycleBin from "./RecycleBin";

export type ContainerProps = {
  workspaceId?: string;
  tab?: string;
  currentWorkspace?: Workspace;
};
const ContentsContainer: FC<ContainerProps> = ({
  tab,
  workspaceId,
  currentWorkspace
}) => {
  return (
    <Wrapper>
      {tab === "projects" && <Projects workspaceId={workspaceId} />}
      {tab === "bin" && <RecycleBin workspaceId={workspaceId} />}
      {tab === "members" && <Members currentWorkspace={currentWorkspace} />}
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  flex: 1,
  background: theme.bg[0],
  minWidth: 760,
  minHeight: 0
}));

export default ContentsContainer;
