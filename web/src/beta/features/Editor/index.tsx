import Resizable from "@reearth/beta/components/Resizable";
import StoryPanel from "@reearth/beta/features/Editor/tabs/story/StoryPanel";
import useLeftPanel from "@reearth/beta/features/Editor/useLeftPanel";
import useRightPanel from "@reearth/beta/features/Editor/useRightPanel";
import useSecondaryNavbar from "@reearth/beta/features/Editor/useSecondaryNavbar";
import useStorytelling from "@reearth/beta/features/Editor/useStorytelling";
import Visualizer from "@reearth/beta/features/Editor/Visualizer";
import Navbar, { type Tab } from "@reearth/beta/features/Navbar";
import { Provider as DndProvider } from "@reearth/beta/utils/use-dnd";
import { StoryFragmentFragment } from "@reearth/services/gql";
import { metrics, styled } from "@reearth/services/theme";

import useHooks from "./hooks";
import { navbarHeight } from "./SecondaryNav";

type Props = {
  sceneId: string;
  tab: Tab;
  projectId?: string;
  workspaceId?: string;
  stories: StoryFragmentFragment[];
};

const Editor: React.FC<Props> = ({ sceneId, projectId, workspaceId, tab, stories }) => {
  const {
    selectedDevice,
    visualizerWidth,
    showWidgetEditor,
    handleDeviceChange,
    handleWidgetEditorToggle,
  } = useHooks({ tab });

  const {
    selectedStory,
    selectedPage,
    onPageSelect,
    onPageDuplicate,
    onPageDelete,
    onPageAdd,
    onPageMove,
  } = useStorytelling({
    sceneId,
    stories,
  });
  const { leftPanel } = useLeftPanel({
    tab,
    selectedStory,
    selectedPage,
    onPageSelect,
    onPageDuplicate,
    onPageDelete,
    onPageAdd,
    onPageMove,
  });
  const { rightPanel } = useRightPanel({ tab, sceneId });
  const { secondaryNavbar } = useSecondaryNavbar({
    tab,
    selectedDevice,
    showWidgetEditor,
    handleDeviceChange,
    handleWidgetEditorToggle,
  });

  const isStory = tab === "story";

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
              initialSize={metrics.propertyMenuWidth}
              minSize={metrics.propertyMenuMinWidth}>
              {leftPanel}
            </Resizable>
          )}
          <Center>
            {secondaryNavbar}
            <CenterContents hasNav={!!secondaryNavbar}>
              {isStory && (
                <StoryPanel
                  selectedStory={selectedStory}
                  selectedPage={selectedPage}
                  onPageSelect={onPageSelect}
                />
              )}
              <VisualizerWrapper tab={tab} visualizerWidth={visualizerWidth}>
                <Visualizer sceneId={sceneId} />
              </VisualizerWrapper>
            </CenterContents>
          </Center>
          {rightPanel && (
            <Resizable
              direction="vertical"
              gutter="start"
              initialSize={metrics.propertyMenuWidth}
              minSize={metrics.propertyMenuMinWidth}>
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
  color: ${({ theme }) => theme.content.main};
`;

const MainSection = styled.div`
  display: flex;
  flex-grow: 1;
  height: 0;
  background: ${({ theme }) => theme.bg[0]};
`;

const Center = styled.div`
  height: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const CenterContents = styled.div<{ hasNav?: boolean }>`
  display: flex;
  justify-content: center;
  height: ${({ hasNav }) => (hasNav ? `calc(100% - ${navbarHeight})` : "100%")};
`;

const VisualizerWrapper = styled.div<{ tab?: Tab; visualizerWidth?: string | number }>`
  border-radius: 4px;
  width: ${({ visualizerWidth }) =>
    typeof visualizerWidth === "number" ? `${visualizerWidth}px` : visualizerWidth};
`;
