import { Placement as PopperPlacement } from "@popperjs/core";
import React, { useRef, useState, useEffect } from "react";
import { usePopper } from "react-popper";

import { styled } from "@reearth/theme";

import Balloon from "../Balloon";

export type Placement = PopperPlacement;

export type Props = {
  className?: string;
  descriptionTitle?: string;
  description?: string;
  balloonDirection?: Placement;
  gap?: number;
  img?: {
    imagePath: string;
    alt?: string;
  };
  children?: React.ReactNode;
};

const HelpButton: React.FC<Props> = ({
  className,
  descriptionTitle,
  description,
  balloonDirection,
  gap,
  img,
  children,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const referenceRef = useRef<HTMLDivElement>(null);
  const popperRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const { styles, attributes } = usePopper(referenceRef.current, popperRef.current, {
    placement: balloonDirection ? balloonDirection : "auto",
    modifiers: [
      {
        name: "arrow",
        options: {
          element: arrowRef.current,
        },
      },
      {
        name: "offset",
        options: {
          offset: [0, (balloonDirection && gap) || 10],
        },
      },
    ],
  });
  const [visible, setVisible] = useState(false);
  const [isMouseEnter, setIsMouseEnter] = useState(false);
  const mouseEnterSec = 500;

  useEffect(() => {
    if (isMouseEnter) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, mouseEnterSec);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
      return;
    }
  }, [isMouseEnter]);

  return (
    <div ref={wrapperRef} className={className}>
      <div ref={referenceRef}>
        <HelpArea
          onMouseEnter={() => {
            setIsMouseEnter(true);
          }}
          onMouseLeave={() => setIsMouseEnter(false)}>
          {children}
        </HelpArea>
      </div>
      <BalloonWrapper
        ref={popperRef}
        visible={visible}
        direction={balloonDirection}
        style={styles.popper}
        {...attributes.popper}>
        <BalloonArrow
          ref={arrowRef}
          style={styles.arrow}
          className="arrow"
          data-placement={balloonDirection}
        />
        <Balloon title={descriptionTitle} description={description} img={img} />
      </BalloonWrapper>
    </div>
  );
};

const HelpArea = styled.div`
  margin: 0;
  padding: 0;
`;

const BalloonWrapper = styled.div<{ visible: boolean; direction?: string }>`
  z-index: ${props => props.theme.zIndexes.descriptionBalloon};
  visibility: ${props => (props.visible ? "visible" : "hidden")};
`;

const BalloonArrow = styled.div<{ direction?: string }>`
  position: absolute;
  width: 10px;
  height: 10px;
  &:after {
    background-color: ${props => props.theme.descriptionBalloon.bg};
    content: " ";
    box-shadow: -1px -1px 1px rgba(0, 0, 0, 0.1);
    position: absolute;
    transform: rotate(45deg);
    width: 10px;
    height: 10px;
  }

  &[data-placement*="bottom"] {
    top: -5px;
  }

  &[data-placement*="top"] {
    bottom: -5px;
  }

  &[data-placement*="right"] {
    left: -5px;
  }

  &[data-placement*="left"] {
    right: -5px;
  }
`;

export default HelpButton;
