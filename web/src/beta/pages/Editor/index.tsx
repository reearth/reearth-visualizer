import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import LeftPanel from "@reearth/beta/features/LeftPanel";
import Navbar, { Tab } from "@reearth/beta/features/Navbar";
import RightPanel from "@reearth/beta/features/RightPanel";
import Visualizer from "@reearth/beta/features/Visualizer";
import { styled } from "@reearth/services/theme";

type Props = {};

const tabs = ["scene", "story", "widgets", "publish"];

const Editor: React.FC<Props> = () => {
  const [currentTab, setTab] = useState<Tab | undefined>();
  const location = useLocation();
  const { sceneId } = useParams();

  useEffect(() => {
    const splitPathname = location.pathname.split("/");
    const tab =
      splitPathname[
        splitPathname.length === 4 ? splitPathname.length - 1 : splitPathname.length - 2
      ];

    if (!tabs.includes(tab)) {
      setTab("scene");
    } else {
      setTab(tab as Tab);
    }
  }, [location.pathname]);

  return (
    <Wrapper>
      <Navbar sceneId={sceneId} currentTab={currentTab} />
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
