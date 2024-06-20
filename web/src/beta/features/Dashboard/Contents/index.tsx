import { FC } from "react";

import { styled } from "@reearth/services/theme";

import { DashboardProps } from "..";

import { Projects } from "./Projects";

const DashboardContents: FC<DashboardProps> = ({ tab, workspaceId }) => {
  return <Wrapper>{tab === "project" && <Projects workspaceId={workspaceId} />}</Wrapper>;
};

const Wrapper = styled("div")(({ theme }) => ({
  padding: `${theme.spacing.largest}px ${theme.spacing.largest}px 0 ${theme.spacing.largest}px`,
  flex: 1,
  background: theme.bg[0],
}));

export default DashboardContents;
