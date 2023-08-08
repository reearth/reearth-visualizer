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
  isSelected?: boolean;
  children?: ReactNode;
  onClick: (() => void) | undefined;
};

const BlockWrapper: React.FC<Props> = ({ padding, isSelected, children, onClick }) => {
  return (
    <Wrapper onClick={onClick} isSelected={isSelected}>
      <Block padding={padding}>{children}</Block>
    </Wrapper>
  );
};

export default BlockWrapper;

const Wrapper = styled.div<{ isSelected?: boolean }>`
  border-width: 1px;
  border-style: solid;
  border-color: ${({ isSelected, theme }) => (isSelected ? theme.select.main : "transparent")};
  transition: all 0.3s;
  cursor: pointer;
  padding: 1px;

  :hover {
    border-color: ${({ isSelected, theme }) => !isSelected && theme.select.weaker};
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
