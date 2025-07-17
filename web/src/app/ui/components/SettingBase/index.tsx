import Navbar from "@reearth/app/features/Navbar";
import { IconName } from "@reearth/app/lib/reearth-ui";
import {
  DEFAULT_SIDEBAR_WIDTH,
  SidebarMenuItem,
  SidebarMainSection,
  SidebarVersion,
  SidebarWrapper,
  SidebarButtonsWrapper
} from "@reearth/app/ui/components/Sidebar";
import { styled } from "@reearth/services/theme";
import { FC, ReactNode } from "react";

type Props = {
  tab: string;
  tabs: {
    id: string;
    text?: string;
    icon?: IconName;
    path?: string;
    disabled?: boolean;
  }[];
  workspaceId?: string;
  children: ReactNode;
};

const SettingBase: FC<Props> = ({ tabs, tab, children, workspaceId }) => {
  return (
    <Wrapper>
      <Navbar page="settings" workspaceId={workspaceId} />
      <MainSection>
        <LeftSidePanel>
          <SidebarWrapper>
            <SidebarMainSection>
              <SidebarButtonsWrapper>
                {tabs?.map((t) => (
                  <SidebarMenuItem
                    key={t.id}
                    path={t.path}
                    text={t.text}
                    active={t.id === tab}
                    icon={t.icon}
                    disabled={t.disabled}
                  />
                ))}
              </SidebarButtonsWrapper>
            </SidebarMainSection>
            <SidebarVersion />
          </SidebarWrapper>
        </LeftSidePanel>
        <Content>{children}</Content>
      </MainSection>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  width: "100%",
  color: theme.content.main,
  backgroundColor: theme.bg[0],
  ["*"]: {
    boxSizing: "border-box"
  },
  ...theme.scrollBar
}));

const MainSection = styled("div")({
  display: "flex",
  flex: 1,
  overflow: "auto",
  position: "relative"
});

const LeftSidePanel = styled("div")(({ theme }) => ({
  width: DEFAULT_SIDEBAR_WIDTH,
  height: "100%",
  backgroundColor: theme.bg[1],
  display: "flex",
  padding: `${theme.spacing.large}px 0`,
  boxSizing: "border-box"
}));

const Content = styled("div")(({ theme }) => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  alignItems: "center",
  overflow: "auto",
  padding: `${theme.spacing.super}px`
}));

export default SettingBase;
