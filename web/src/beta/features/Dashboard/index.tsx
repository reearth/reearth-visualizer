import { FC } from "react";

import { Typography } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import useHooks from "./hooks";
import LeftSidePanel from "./LeftSide";

export type DashboardProps = {
  workspaceId?: string;
};
const Dashboard: FC<DashboardProps> = ({ workspaceId }) => {
  const t = useT();
  const theme = useTheme();
  const { currentUser } = useHooks(workspaceId);

  return (
    <Wrapper>
      <LeftSideWrapper>
        <Header>
          <Typography size="body" weight="bold" color={theme.dangerous.strong}>
            {t("Re:Earth Visualizer")}
          </Typography>
        </Header>
        <LeftSidePanel currentUser={currentUser.name} workspaceId={workspaceId} />
      </LeftSideWrapper>
      <Content>Content side</Content>
    </Wrapper>
  );
};

export default Dashboard;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  height: "100%",
  width: "100%",
  overflow: "auto",
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

const Content = styled("div")(() => ({
  flex: 1,
}));
