import { FC, ReactNode } from "react";

import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { styled } from "@reearth/services/theme";

type Props = {
  children: ReactNode;
  pageCount: number;
  isSwipeable: boolean;
};

const StorySidePanelPageWrapper: FC<Props> = ({ children, pageCount, isSwipeable }) => {
  return (
    <Wrapper>
      <Left>
        <div>
          <Text size="footnote">{pageCount}</Text>
        </div>
        <div>
          <Icon icon={isSwipeable ? "swiper" : "square"} color="#4A4A4A" size={12} />
        </div>
      </Left>
      <Right>{children}</Right>
    </Wrapper>
  );
};

export default StorySidePanelPageWrapper;

const Wrapper = styled.div`
  display: flex;
  gap: 4px;
`;
const Left = styled.div``;
const Right = styled.div`
  flex-grow: 1;
  width: 0;
`;
