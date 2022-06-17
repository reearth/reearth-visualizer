import React, { ReactNode } from "react";

import { styled } from "@reearth/theme";

export type Props = {
  className?: string;
  children?: ReactNode;
  pos?: number;
};

const Slide: React.FC<Props> = ({ className, children, pos }) => {
  return (
    <Wrapper className={className}>
      <Inner pos={pos}>
        {React.Children.map(children, child =>
          React.isValidElement(child) ? <Page key={child.key ?? undefined}>{child}</Page> : null,
        )}
      </Inner>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const Inner = styled.div<{ pos?: number }>`
  position: relative;
  transform: translateX(${({ pos }) => `-${(pos ?? 0) * 100}%`});
  transition: transform 0.1s ease;
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  width: 100%;
  height: 100%;
`;

const Page = styled.div`
  flex: 0 0 100%;
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

export default Slide;
