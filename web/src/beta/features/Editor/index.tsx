import Resizable from "@reearth/beta/components/Resizable";
import StoryPanel from "@reearth/beta/features/Editor/tabs/story/StoryPanel";
import { devices } from "@reearth/beta/features/Editor/tabs/widgets/Nav/Devices";
import useLeftPanel from "@reearth/beta/features/Editor/useLeftPanel";
import useRightPanel from "@reearth/beta/features/Editor/useRightPanel";
import useVisualizerNav from "@reearth/beta/features/Editor/useVisualizerNav";
import Visualizer from "@reearth/beta/features/Editor/Visualizer";
import Navbar, { Tab } from "@reearth/beta/features/Navbar";
import { Provider as DndProvider } from "@reearth/beta/utils/use-dnd";
import { metrics, styled } from "@reearth/services/theme";

import useHooks from "./hooks";

type Props = {
  sceneId: string;
  projectId?: string; // gotten through injection
  workspaceId?: string; // gotten through injection
  tab: Tab;
};

const Editor: React.FC<Props> = ({ sceneId, projectId, workspaceId, tab }) => {
  const { selectedDevice, showWidgetEditor, handleDeviceChange, handleWidgetEditorToggle } =
    useHooks();

  const { leftPanel } = useLeftPanel({ tab });
  const { rightPanel } = useRightPanel({ tab, sceneId });
  const { visualizerNav } = useVisualizerNav({
    tab,
    selectedDevice,
    showWidgetEditor,
    handleDeviceChange,
    handleWidgetEditorToggle,
  });

  const isStory = tab === "story";

  console.log("ASDFSDF", devices[selectedDevice]);

  return (
    <DndProvider>
      <Wrapper>
        <Navbar
          sceneId={sceneId}
          projectId={projectId}
          workspaceId={workspaceId}
          currentTab={tab}
        />
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
          <Center hasStory={isStory}>
            {isStory && <StoryPanel />}
            <VisualizerWrapper tab={tab}>
              {visualizerNav}
              <Visualizer deviceWidth={devices[selectedDevice]} />
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
  color: ${({ theme }) => theme.general.content.main};
`;

const MainSection = styled.div`
  display: flex;
  flex-grow: 1;
  height: 0;
  background-color: ${({ theme }) => theme.general.bg.veryStrong};
`;

const Center = styled.div<{ hasStory: boolean }>`
  height: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: ${hasStory => (hasStory ? "row" : "column")};
`;

const VisualizerWrapper = styled.div<{ tab?: Tab }>`
  height: ${({ tab }) =>
    tab === "widgets" ? "calc(100% - 64px)" : tab === "publish" ? "calc(100% - 48px)" : "100%"};
  border-radius: 4px;
  flex-grow: 1;
`;
