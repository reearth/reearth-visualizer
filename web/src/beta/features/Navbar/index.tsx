import { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { styled } from "@reearth/services/theme";

type Tab = "scene" | "story" | "widgets" | "publish";

const tabs = ["scene", "story", "widgets", "publish"];

const Navbar: React.FC = () => {
  const [currentTab, setTab] = useState<Tab | undefined>();

  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = useCallback(
    (tab: Tab) => {
      navigate(tab !== "scene" ? `/scene/asdfasdf222/${tab}` : "");
    },
    [navigate],
  );

  useEffect(() => {
    const splitPathname = location.pathname.split("/");
    const tab = splitPathname[splitPathname.length - 1];

    if (!tabs.includes(tab)) {
      setTab("scene");
    } else {
      setTab(tab as Tab);
    }
  }, [location.pathname]);

  return (
    <Wrapper>
      Navbar
      <p>{location.pathname}</p>
      <p>{currentTab}</p>
      <div>
        <button
          onClick={() => handleNavigation("scene")}
          style={{ background: "white", marginRight: "3px" }}>
          Scene
        </button>
        <button
          onClick={() => handleNavigation("story")}
          style={{ background: "white", marginRight: "3px" }}>
          Storytelling
        </button>
        <button
          onClick={() => handleNavigation("widgets")}
          style={{ background: "white", marginRight: "3px" }}>
          Widgets
        </button>
        <button
          onClick={() => handleNavigation("publish")}
          style={{ background: "white", marginRight: "3px" }}>
          Publish
        </button>
      </div>
    </Wrapper>
  );
};

export default Navbar;

const Wrapper = styled.div`
  // flex: 1;
  display: flex;
  justify-content: space-between;
  height: 53px;
  background: #171618;
`;
