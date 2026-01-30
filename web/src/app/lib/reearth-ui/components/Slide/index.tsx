import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import React, { FC, ReactNode } from "react";

export type SlideProps = {
  className?: string;
  children?: ReactNode;
  pos?: number;
};

export const Slide: FC<SlideProps> = ({ className, children, pos }) => {
  return (
    <Wrapper className={className}>
      <Inner pos={pos} data-testid="slide-inner">
        {React.Children.map(children, (child) =>
          React.isValidElement(child) ? (
            <Page key={child.key ?? undefined}>{child}</Page>
          ) : null
        )}
      </Inner>
    </Wrapper>
  );
};

const Wrapper = styled("div")(() => ({
  width: "100%",
  height: "100%",
  overflow: css.overflow.hidden
}));

const Inner = styled.div<{ pos?: number }>(({ pos }) => ({
  position: css.position.relative,
  transform: `translateX(-${(pos ?? 0) * 100}%)`,
  transition: "transform 0.1s ease",
  display: css.display.flex,
  flexWrap: "nowrap",
  alignItems: "stretch",
  width: "100%",
  height: "100%"
}));

const Page = styled("div")(() => ({
  flex: "0 0 100%",
  width: "100%",
  display: css.display.flex,
  justifyContent: "space-between"
}));
