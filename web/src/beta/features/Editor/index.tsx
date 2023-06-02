import { FC } from "react";

import Resizable from "@reearth/beta/components/Resizable";
import useLeftPanel from "@reearth/beta/features/Editor/useLeftPanel";
import useRightPanel from "@reearth/beta/features/Editor/useRightPanel";
import useVisualizerNav from "@reearth/beta/features/Editor/useVisualizerNav";
import Navbar, { Tab } from "@reearth/beta/features/Navbar";
import Visualizer from "@reearth/beta/features/Visualizer";
import { Provider as DndProvider } from "@reearth/beta/utils/use-dnd";
import { metrics, styled, Theme, useTheme } from "@reearth/services/theme";

type Props = {
  sceneId: string;
  tab: Tab;
};

const Editor: FC<Props> = ({ sceneId, tab }) => {
  const theme = useTheme();

  const { leftPanel } = useLeftPanel({ tab });
  const { rightPanel } = useRightPanel({ tab });
  const { visualizerNav } = useVisualizerNav({ tab });

  return (
    <DndProvider>
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
    </DndProvider>
  );
};

export default Editor;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
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
