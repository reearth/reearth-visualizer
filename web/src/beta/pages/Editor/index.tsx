import { useParams } from "react-router-dom";

import LeftPanel from "@reearth/beta/features/LeftPanel";
import Navbar, { Tab } from "@reearth/beta/features/Navbar";
import RightPanel from "@reearth/beta/features/RightPanel";
import Visualizer from "@reearth/beta/features/Visualizer";
import NotFound from "@reearth/classic/components/atoms/NotFound";
import { styled } from "@reearth/services/theme";

type Props = {};

function isTab(tab: string): tab is Tab {
  return ["scene", "story", "widgets", "publish"].includes(tab);
}

const Editor: React.FC<Props> = () => {
  const { sceneId, tab } = useParams<{ sceneId: string; tab: string }>();

  if (!sceneId || !tab || !isTab(tab)) {
    return <NotFound />;
  }

  return (
    <Wrapper>
      <Navbar sceneId={sceneId} currentTab={tab} />
      <MainSection>
        <LeftPanel />
        <Visualizer />
        <RightPanel />
      </MainSection>
    </Wrapper>
  );
};

export default Editor;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const MainSection = styled.div`
  display: flex;
  flex: 1;
`;
