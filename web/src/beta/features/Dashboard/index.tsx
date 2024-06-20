import { FC, useMemo } from "react";
import { useParams } from "react-router-dom";

import { Typography } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import DashboardContents from "./ContentsSection";
import LeftSidePanel from "./LeftSidePanel";

export type DashboardProps = {
  workspaceId?: string;
  tab?: string;
};
const Dashboard: FC<Omit<DashboardProps, "tab">> = ({ workspaceId }) => {
  const t = useT();
  const theme = useTheme();

  const { tab } = useParams<{
    tab?: string;
  }>();
  const currentTab = useMemo(() => tab ?? "project", [tab]);

  return (
    <Wrapper>
      <LeftSideWrapper>
        <Header>
          <Typography size="body" weight="bold" color={theme.dangerous.strong}>
            {t("Re:Earth Visualizer")}
          </Typography>
        </Header>
        <LeftSidePanel tab={currentTab} workspaceId={workspaceId} />
      </LeftSideWrapper>
      <DashboardContents tab={currentTab} workspaceId={workspaceId} />
    </Wrapper>
  );
};

export default Dashboard;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  height: "100%",
  width: "100%",
  background: theme.bg.transparentBlack,
}));

const LeftSideWrapper = styled("div")(({ theme }) => ({
  background: theme.bg[1],
  display: "flex",
  flexDirection: "column",
  width: "213px",
  gap: theme.spacing.super,
}));

const Header = styled("div")(({ theme }) => ({
  borderBottom: `1px solid ${theme.outline.weaker}`,
  alignContent: "center",
  padding: theme.spacing.normal,
}));
