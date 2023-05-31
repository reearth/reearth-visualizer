import { useEditorNavigation, Tab } from "@reearth/beta/hooks";
import { styled } from "@reearth/services/theme";

export type { Tab };

type Props = {
  sceneId: string;
  currentTab: Tab;
};

export const Tabs = ["scene", "story", "widgets", "publish"] as const;
export type Tab = (typeof Tabs)[number];

export function isTab(tab: string): tab is Tab {
  return Tabs.includes(tab as never);
}

const Navbar: React.FC<Props> = ({ sceneId, currentTab }) => {
  const handleEditorNavigation = useEditorNavigation({ sceneId });

  return (
    <Wrapper>
      <p>Navbar</p>
      <div>
        <p>current path: {location.pathname}</p>
        <p> current tab: {currentTab}</p>
      </div>
      <div>
        <button
          onClick={() => handleEditorNavigation("scene")}
          style={{ background: "white", marginRight: "3px" }}>
          Scene
        </button>
        <button
          onClick={() => handleEditorNavigation("story")}
          style={{ background: "white", marginRight: "3px" }}>
          Storytelling
        </button>
        <button
          onClick={() => handleEditorNavigation("widgets")}
          style={{ background: "white", marginRight: "3px" }}>
          Widgets
        </button>
        <button
          onClick={() => handleEditorNavigation("publish")}
          style={{ background: "white", marginRight: "3px" }}>
          Publish
        </button>
      </div>
    </Wrapper>
  );
};

export default Navbar;

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  height: 53px;
  background: #171618;
`;
