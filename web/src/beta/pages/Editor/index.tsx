import { useParams } from "react-router-dom";

import NotFound from "@reearth/beta/components/NotFound";
import LeftPanel from "@reearth/beta/features/LeftPanel";
import Navbar, { isTab } from "@reearth/beta/features/Navbar";
import RightPanel from "@reearth/beta/features/RightPanel";
import Visualizer from "@reearth/beta/features/Visualizer";
import { Provider as DndProvider } from "@reearth/beta/utils/use-dnd";
import { styled } from "@reearth/services/theme";

type Props = {};

const Editor: React.FC<Props> = () => {
  const { sceneId, tab } = useParams<{ sceneId: string; tab: string }>();

  if (!sceneId || !tab || !isTab(tab)) {
    return <NotFound />;
  }

  return (
    <DndProvider>
      <Wrapper>
        <Navbar sceneId={sceneId} currentTab={tab} />
        <MainSection>
          <LeftPanel />
          <Visualizer />
          <RightPanel />
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
`;

const MainSection = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  width: 100%;
`;
