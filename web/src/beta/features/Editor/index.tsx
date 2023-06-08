import Resizable from "@reearth/beta/components/Resizable";
import useLeftPanel from "@reearth/beta/features/Editor/useLeftPanel";
import useRightPanel from "@reearth/beta/features/Editor/useRightPanel";
import useVisualizerNav from "@reearth/beta/features/Editor/useVisualizerNav";
import Visualizer from "@reearth/beta/features/Editor/Visualizer";
import Navbar, { Tab } from "@reearth/beta/features/Navbar";
import { Provider as DndProvider } from "@reearth/beta/utils/use-dnd";
import { metrics, styled } from "@reearth/services/theme";

type Props = {
  sceneId: string;
  tab: Tab;
};

const Editor: React.FC<Props> = ({ sceneId, tab }) => {
  const { leftPanel } = useLeftPanel({ tab });
  const { rightPanel } = useRightPanel({ tab });
  const { visualizerNav } = useVisualizerNav({ tab });

  return (
    <DndProvider>
      <Wrapper>
        <Navbar sceneId={sceneId} currentTab={tab} />
        <MainSection>
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
            <VisualizerWrapper hasNav={!!visualizerNav}>
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

const MainSection = styled.div`
  display: flex;
  flex-grow: 1;
  height: 100%;
  background-color: ${({ theme }) => theme.main.deepestBg};
`;

const Center = styled.div`
  height: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const VisualizerWrapper = styled.div<{ hasNav: boolean }>`
  ${({ hasNav, theme }) => hasNav && `border: 1px solid ${theme.main.deepBg}`};
  height: 100%;
  border-radius: 4px;
  flex-grow: 1;
`;
