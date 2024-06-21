import { FC, useState } from "react";

import { styled } from "@reearth/services/theme";

import { DashboardProps } from "..";

import { Assets } from "./Assets";
import { Projects } from "./Projects";

export type TabProps = {
  workspaceId?: string;
  viewState?: string;
  onChangeView?: (v?: string) => void;
};

const ContentsContainer: FC<DashboardProps> = ({ tab, workspaceId }) => {
  const state = localStorage.getItem("viewState");
  const [viewState, setViewState] = useState(state ? state : "grid");

  const handleViewChange = (newView?: string) => {
    if (!newView) return;
    localStorage.setItem("viewState", newView);
    setViewState(newView);
  };
  return (
    <Wrapper>
      {tab === "project" && (
        <Projects workspaceId={workspaceId} viewState={viewState} onChangeView={handleViewChange} />
      )}
      {tab === "asset" && (
        <Assets workspaceId={workspaceId} viewState={viewState} onChangeView={handleViewChange} />
      )}
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  padding: `${theme.spacing.largest}px ${theme.spacing.largest}px 0 ${theme.spacing.largest}px`,
  flex: 1,
  background: theme.bg[0],
}));

export default ContentsContainer;
