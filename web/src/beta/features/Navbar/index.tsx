import { useEditorNavigation } from "@reearth/beta/hooks";
import { styled, Theme, useTheme } from "@reearth/services/theme";

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
  const theme = useTheme();

  return (
    <Wrapper theme={theme}>
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

const Wrapper = styled.div<{ theme: Theme }>`
  display: flex;
  justify-content: space-between;
  height: 53px;
  background: ${({ theme }) => theme.editorNavBar.bg};
`;
