import { FC } from "react";

import { styled } from "@reearth/services/theme";

import { Workspace } from "../type";

import Assets from "./Assets";
import Members from "./Members";
import Projects from "./Projects";

export type ContainerProps = {
  workspaceId?: string;
  tab?: string;
  currentWorkspace?: Workspace;
};
const ContentsContainer: FC<ContainerProps> = ({ tab, workspaceId, currentWorkspace }) => {
  return (
    <Wrapper>
      {tab === "projects" && <Projects workspaceId={workspaceId} />}
      {tab === "asset" && <Assets workspaceId={workspaceId} />}
      {tab === "members" && <Members currentWorkspace={currentWorkspace} />}
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  flex: 1,
  background: theme.bg[0],
  width: "100%",
}));

export default ContentsContainer;
