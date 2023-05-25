import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { styled } from "@reearth/services/theme";

export type Tab = "scene" | "story" | "widgets" | "publish";

type Props = {
  currentTab?: Tab;
};

const Navbar: React.FC<Props> = ({ currentTab }) => {
  const navigate = useNavigate();

  const handleNavigation = useCallback(
    (tab: Tab) => {
      navigate(tab !== "scene" ? `/scene/asdfasdf222/${tab}` : "");
    },
    [navigate],
  );

  return (
    <Wrapper>
      <p>Navbar</p>
      <div>
        <p>current path: {location.pathname}</p>
        <p> current tab: {currentTab}</p>
      </div>
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
  display: flex;
  justify-content: space-between;
  height: 53px;
  background: #171618;
`;
