import { styled } from "@reearth/services/theme";

import CanvasArea from "./CanvasArea";

type Props = {
  deviceWidth?: string | number;
  hasNav?: boolean;
};

const Visualizer: React.FC<Props> = ({ deviceWidth, hasNav }) => {
  return (
    <Wrapper hasNav={hasNav}>
      <InnerWrapper deviceWidth={deviceWidth}>
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

const InnerWrapper = styled.div<{ deviceWidth?: string | number }>`
  width: ${({ deviceWidth }) =>
    typeof deviceWidth === "number" ? `${deviceWidth}px` : deviceWidth};
`;
