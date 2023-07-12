import { styled } from "@reearth/services/theme";

import { Layout } from "../types";

import CanvasArea from "./CanvasArea";

type Props = {
  layout?: Layout;
  hasNav?: boolean;
};

const Visualizer: React.FC<Props> = ({ layout, hasNav }) => {
  return (
    <Wrapper hasNav={hasNav}>
      <InnerWrapper layout={layout}>
        <CanvasArea isBuilt={false} inEditor={true} />
      </InnerWrapper>
    </Wrapper>
  );
};

export default Visualizer;

const Wrapper = styled.div<{ hasNav?: boolean }>`
  display: flex;
  justify-content: center;
  background: ${({ theme }) => theme.general.bg.strong};
  height: ${({ hasNav }) => (hasNav ? "calc(100% - 64px)" : "100%")};
`;

const InnerWrapper = styled.div<{ layout?: Layout }>`
  width: ${({ layout }) => (layout === "mobile" ? "437px" : "100%")};
`;
