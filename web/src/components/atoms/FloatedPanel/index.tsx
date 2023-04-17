import { SerializedStyles } from "@emotion/react";
import { useTransition, TransitionStatus } from "@rot1024/use-transition";
import React, { useRef, useEffect } from "react";
import { useClickAway } from "react-use";

import { styled } from "@reearth/theme";
import useBuffered from "@reearth/util/use-buffered";

export type Props = {
  className?: string;
  visible?: boolean;
  styles?: SerializedStyles;
  onClose?: () => void;
  onHover?: (hovered: boolean) => void;
  onClickAway?: (e: Event) => void;
  onEnter?: () => void;
  onEntered?: () => void;
  onExit?: () => void;
  onExited?: () => void;
} & React.HTMLAttributes<HTMLDivElement>;

const FloatedPanel: React.FC<Props> = ({
  className,
  visible,
  styles,
  children,
  onHover,
  onClick,
  onClickAway,
  onEnter,
  onEntered,
  onExit,
  onExited,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useClickAway(ref, e => onClickAway?.(e));
  const transition = useTransition(!!visible, 200, {
    mountOnEnter: true,
    unmountOnExit: true,
  });

  // visibleがtrueの時のみ更新することで、InfoBoxを閉じるアニメーションが走る際に中身が消えないようにする
  const bChildren = useBuffered<typeof children>(children, !!visible);
  const bStyles = useBuffered(styles, !!visible);

  useEffect(() => {
    if (transition === "entering") onEnter?.();
    if (transition === "entered") onEntered?.();
    if (transition === "exiting") onExit?.();
    if (transition === "exited") onExited?.();
  }, [transition, onEnter, onEntered, onExit, onExited]);

  return transition === "unmounted" ? null : (
    <Wrapper
      ref={ref}
      className={className}
      onClick={onClick}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      transition={transition}
      styles={bStyles}>
      {bChildren}
    </Wrapper>
  );
};

const Wrapper = styled.div<{
  transition?: TransitionStatus;
  styles?: SerializedStyles;
}>`
  position: absolute;
  transition: ${({ transition }) =>
    transition === "entering" || transition === "exiting" ? "all 0.2s ease" : ""};
  transform: ${({ transition }) =>
    transition === "entering" || transition === "entered" ? "translateX(0%)" : "translateX(100%)"};
  opacity: ${({ transition }) =>
    transition === "entering" || transition === "entered" ? "1" : "0"};
  ${({ styles }) => styles}
`;

export default FloatedPanel;
