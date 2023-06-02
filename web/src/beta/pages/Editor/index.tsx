import React, { ReactNode, useMemo } from "react";
import { useParams } from "react-router-dom";

import NotFound from "@reearth/beta/components/NotFound";
import Resizable from "@reearth/beta/components/Resizable";
import LeftPanelScene from "@reearth/beta/features/LeftPanelScene";
import LeftPanelStory from "@reearth/beta/features/LeftPanelStory";
import Navbar, { isTab, Tab } from "@reearth/beta/features/Navbar";
import RightPanelScene from "@reearth/beta/features/RightPanelScene";
import RightPanelStory from "@reearth/beta/features/RightPanelStory";
import RightPanelWidgets from "@reearth/beta/features/RightPanelWidgets";
import Visualizer from "@reearth/beta/features/Visualizer";
import VisualizerNav from "@reearth/beta/features/VisualizerNav";
import { metrics, styled, Theme, useTheme } from "@reearth/services/theme";

type Props = {};

const Editor: React.FC<Props> = () => {
  const { sceneId, tab } = useParams<{ sceneId: string; tab: string }>();
  const theme = useTheme();

  const leftPanel = useMemo<ReactNode | undefined>(() => {
    // need to wrap with page component
    switch (tab as Tab | string) {
      case "scene":
        return <LeftPanelScene />;
      case "story":
        return <LeftPanelStory />;
      case "widgets":
      case "publish":
      default:
        return undefined;
    }
  }, [tab]);

  const rightPanel = useMemo<ReactNode | undefined>(() => {
    switch (tab as Tab | string) {
      case "scene":
        return <RightPanelScene />;
      case "story":
        return <RightPanelStory />;
      case "widgets":
        return <RightPanelWidgets />;
      case "publish":
      default:
        return undefined;
    }
  }, [tab]);

  const visualizerNav = useMemo<ReactNode | undefined>(() => {
    switch (tab as Tab | string) {
      case "widgets":
        return <VisualizerNav />;
      case "publish":
        return <VisualizerNav />;
      case "scene":
      case "story":
      default:
        return undefined;
    }
  }, [tab]);

  if (!sceneId || !tab || !isTab(tab)) {
    return <NotFound />;
  }

  return (
    <Wrapper theme={theme}>
      <Navbar sceneId={sceneId} currentTab={tab} />
      <MainSection theme={theme}>
        {leftPanel && (
          <Resizable
            direction="vertical"
            gutter="end"
            size={metrics.propertyMenuMinWidth}
            minSize={metrics.propertyMenuMinWidth}
            maxSize={metrics.propertyMenuMaxWidth}>
            {leftPanel}
          </Resizable>
        )}
        <Center>
          <VisualizerWrapper theme={theme} hasNav={!!visualizerNav}>
            {visualizerNav && <div>{visualizerNav}</div>}
            <Visualizer />
          </VisualizerWrapper>
        </Center>
        {rightPanel && (
          <Resizable
            direction="vertical"
            gutter="start"
            size={metrics.propertyMenuMinWidth}
            minSize={metrics.propertyMenuMinWidth}
            maxSize={metrics.propertyMenuMaxWidth}>
            {rightPanel}
          </Resizable>
        )}
      </MainSection>
    </Wrapper>
  );
};

export default Editor;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  color: ${({ theme }) => theme.main.text};
`;

const Center = styled.div`
  display: flex;
  flex-flow: column;
  align-items: stretch;
  flex: auto;
`;

const MainSection = styled.div<{ theme: Theme }>`
  display: flex;
  flex: 1;
  background-color: ${({ theme }) => theme.main.deepestBg};
`;

const VisualizerWrapper = styled.div<{ theme: Theme; hasNav: boolean }>`
  ${({ hasNav, theme }) => hasNav && `border: 1px solid ${theme.main.deepBg}`};
  border-radius: 4px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;
