import { useEffect } from "react";

import Button from "@reearth/beta/components/Button";
import SecondaryNav from "@reearth/beta/features/Editor/SecondaryNav";
import { SketchType } from "@reearth/beta/lib/core/Map/Sketch/types";
import { styled } from "@reearth/services/theme";

type Props = {
  enable: boolean;
  sketchType: SketchType | undefined;
  onSketchTypeChange: (type: SketchType | undefined) => void;
};
const Toolbar: React.FC<Props> = ({ enable, sketchType, onSketchTypeChange }) => {
  useEffect(() => {
    if (!enable) onSketchTypeChange(undefined);
  }, [enable, onSketchTypeChange]);

  return (
    <StyledSecondaryNav>
      <ButtonGroup>
        <ToolButton
          icon="marker"
          disabled={!enable}
          selected={enable && sketchType === "marker"}
          onClick={() => onSketchTypeChange("marker")}
        />
        <ToolButton
          icon="polyline"
          disabled={!enable}
          selected={enable && sketchType === "polyline"}
          onClick={() => onSketchTypeChange("polyline")}
        />
        <ToolButton
          icon="circleOutline"
          disabled={!enable}
          selected={enable && sketchType === "circle"}
          onClick={() => onSketchTypeChange("circle")}
        />
        <ToolButton
          icon="squareOutline"
          disabled={!enable}
          selected={enable && sketchType === "rectangle"}
          onClick={() => onSketchTypeChange("rectangle")}
        />
        <ToolButton
          icon="polygon"
          disabled={!enable}
          selected={enable && sketchType === "polygon"}
          onClick={() => onSketchTypeChange("polygon")}
        />
        <ToolButton
          icon="cylinder"
          disabled={!enable}
          selected={enable && sketchType === "extrudedCircle"}
          onClick={() => onSketchTypeChange("extrudedCircle")}
        />
        <ToolButton
          icon="box"
          disabled={!enable}
          selected={enable && sketchType === "extrudedRectangle"}
          onClick={() => onSketchTypeChange("extrudedRectangle")}
        />
        <ToolButton
          icon="polygonExtruded"
          disabled={!enable}
          selected={enable && sketchType === "extrudedPolygon"}
          onClick={() => onSketchTypeChange("extrudedPolygon")}
        />
      </ButtonGroup>
    </StyledSecondaryNav>
  );
};

export default Toolbar;

const StyledSecondaryNav = styled(SecondaryNav)`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 4px;
  padding-right: 4px;
  padding-left: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  box-sizing: border-box;
  height: 36px;
  gap: 8px;
  padding: 4px;
  border-left: 2px solid ${({ theme }) => theme.outline.weaker};

  &:first-of-type {
    border-left: none;
  }
`;

const ToolButton = styled(Button)<{ selected?: boolean }>`
  padding: 10px;
  border: none;
  box-shadow: none;
  background-color: ${({ theme, selected }) => (selected ? theme.select.main : "none")};

  &:hover {
    background-color: ${({ theme, selected }) => (selected ? theme.select.main : theme.bg[2])};
  }
`;
