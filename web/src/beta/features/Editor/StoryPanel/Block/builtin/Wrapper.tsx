import { ReactNode } from "react";

import { styled } from "@reearth/services/theme";

type Spacing = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

type Props = {
  padding?: Spacing;
  children?: ReactNode;
};

const BlockWrapper: React.FC<Props> = ({ padding, children }) => {
  return (
    <Wrapper>
      <Block padding={padding}>{children}</Block>
    </Wrapper>
  );
};

export default BlockWrapper;

const Wrapper = styled.div`
  border-width: 1px;
  border-style: solid;
  border-color: transparent;
  transition: all 0.3s;

  :hover {
    padding: 1px;
    border-color: ${({ theme }) => theme.select.weaker};
  }
`;

const Block = styled.div<{ padding?: Spacing }>`
  display: flex;
  min-height: 255px;
  padding-top: ${({ padding }) => padding?.top + "px" ?? 0};
  padding-bottom: ${({ padding }) => padding?.bottom + "px" ?? 0};
  padding-left: ${({ padding }) => padding?.left + "px" ?? 0};
  padding-right: ${({ padding }) => padding?.right + "px" ?? 0};
`;
