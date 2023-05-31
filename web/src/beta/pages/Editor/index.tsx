import React, { useMemo } from "react";
import { useParams } from "react-router-dom";

import NotFound from "@reearth/beta/components/NotFound";
import Resizable from "@reearth/beta/components/Resizable";
import LeftPanel from "@reearth/beta/features/LeftPanel";
import Navbar, { Tab } from "@reearth/beta/features/Navbar";
import RightPanel from "@reearth/beta/features/RightPanel";
import Visualizer from "@reearth/beta/features/Visualizer";
import { metrics, styled } from "@reearth/services/theme";

type Props = {};

function isTab(tab: string): tab is Tab {
  return ["scene", "story", "widgets", "publish"].includes(tab);
}

const Editor: React.FC<Props> = () => {
  const { sceneId, tab } = useParams<{ sceneId: string; tab: string }>();

  const showLeftPanel = useMemo(() => {
    return ["scene", "story"].includes(tab || "");
  }, [tab]);

  const showRightPanel = useMemo(() => {
    return ["scene", "story", "widgets"].includes(tab || "");
  }, [tab]);

  const showWidgetNav = useMemo(() => {
    return ["widgets", "publish"].includes(tab || "");
  }, [tab]);

  if (!sceneId || !tab || !isTab(tab)) {
    return <NotFound />;
  }

  return (
    <Wrapper>
      <Navbar sceneId={sceneId} currentTab={tab} />
      <MainSection>
        {showLeftPanel && (
          // TODO: need to copy, and then delete gutter and change theme values
          <Resizable
            direction="vertical"
            gutter="end"
            size={metrics.propertyMenuMinWidth}
            minSize={metrics.propertyMenuMinWidth}
            maxSize={metrics.propertyMenuMaxWidth}>
            <LeftPanel tab={tab} />
          </Resizable>
        )}
        <Center>
          {showWidgetNav && <div style={{ height: "48px" }}>Widget/Publish Nav</div>}
          <Visualizer />
        </Center>
        {showRightPanel && (
          <Resizable
            direction="vertical"
            gutter="start"
            size={metrics.propertyMenuMinWidth}
            minSize={metrics.propertyMenuMinWidth}
            maxSize={metrics.propertyMenuMaxWidth}>
            <RightPanel tab={tab} />
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
`;

const Center = styled.div`
  display: flex;
  flex-flow: column;
  align-items: stretch;
  flex: auto;
`;

const MainSection = styled.div`
  display: flex;
  flex: 1;
  background-color: #070707;
`;
