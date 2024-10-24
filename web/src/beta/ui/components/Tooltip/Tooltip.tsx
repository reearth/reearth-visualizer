import { styled } from "@reearth/services/theme";
import React from "react";

type Position = "top" | "bottom" | "left" | "right";
type Props = {
  text: string;
  position?: Position;
  children: React.ReactNode;
};

const Tooltip = ({ text, position = "top", children }: Props) => {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <TooltipContainer
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <TooltipContent visible={isVisible} position={position}>
        {text}
      </TooltipContent>
    </TooltipContainer>
  );
};

const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const TooltipContent = styled.span`
  visibility: ${(props: { visible: boolean; position: Position }) =>
    props.visible ? "visible" : "hidden"};
  position: absolute;
  z-index: 10;
  padding: 8px;
  background: #333;
  color: white;
  border-radius: 4px;
  font-size: 14px;
  white-space: nowrap;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: opacity 0.3s;

  /* Position the tooltip based on the position prop */
  ${(props) => {
    switch (props.position) {
      case "top":
        return `
          bottom: 120%;
          left: 50%;
          transform: translateX(-50%);
          &::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: #333 transparent transparent transparent;
          }
        `;
      case "bottom":
        return `
          top: 120%;
          left: 50%;
          transform: translateX(-50%);
          &::after {
            content: '';
            position: absolute;
            bottom: 100%;
            left: 50%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: transparent transparent #333 transparent;
          }
        `;
      case "left":
        return `
          top: 50%;
          right: 120%;
          transform: translateY(-50%);
          &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 100%;
            margin-top: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: transparent transparent transparent #333;
          }
        `;
      case "right":
        return `
          top: 50%;
          left: 120%;
          transform: translateY(-50%);
          &::after {
            content: '';
            position: absolute;
            top: 50%;
            right: 100%;
            margin-top: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: transparent #333 transparent transparent;
          }
        `;
      default:
        return `
          bottom: 120%;
          left: 50%;
          transform: translateX(-50%);
        `;
    }
  }}
`;

export default Tooltip;
