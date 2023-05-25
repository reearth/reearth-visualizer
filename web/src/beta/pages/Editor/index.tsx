import LeftPanel from "@reearth/beta/features/LeftPanel";
import Navbar from "@reearth/beta/features/Navbar";
import RightPanel from "@reearth/beta/features/RightPanel";
import Visualizer from "@reearth/beta/features/Visualizer";
import { styled } from "@reearth/services/theme";

const Editor: React.FC = () => {
  return (
    <Wrapper>
      {/* <h1>Re:Earth Beta Editor</h1> */}
      <Navbar />
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
