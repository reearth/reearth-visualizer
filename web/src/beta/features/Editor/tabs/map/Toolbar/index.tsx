import { useMemo } from "react";

import Button from "@reearth/beta/components/Button";
import SecondaryNav from "@reearth/beta/features/Editor/SecondaryNav";
import { InteractionModeType } from "@reearth/beta/lib/core/Crust";
import { SketchType } from "@reearth/beta/lib/core/Map/Sketch/types";
import { styled } from "@reearth/services/theme";

type Props = {
  interactionMode: InteractionModeType;
  selectedSketchTool: SketchType | undefined;
  onInteractionModeChange: (mode: InteractionModeType) => void;
  onSelectedSketchToolChange: (tool: SketchType) => void;
};
const Toolbar: React.FC<Props> = ({
  interactionMode,
  selectedSketchTool,
  onInteractionModeChange,
  onSelectedSketchToolChange,
}) => {
  const isSketchMode = useMemo(() => interactionMode === "sketch", [interactionMode]);
  return (
    <StyledSecondaryNav>
      <ButtonGroup>
        <ToolButton
          icon="pointer"
          selected={interactionMode === "default"}
          onClick={() => onInteractionModeChange("default")}
        />
        <ToolButton
          icon="sketch"
          selected={interactionMode === "sketch"}
          onClick={() => onInteractionModeChange("sketch")}
        />
      </ButtonGroup>
      <ButtonGroup>
        <ToolButton
          icon="marker"
          disabled={!isSketchMode}
          selected={selectedSketchTool === "marker"}
          onClick={() => onSelectedSketchToolChange("marker")}
        />
        <ToolButton
          icon="polyline"
          disabled={!isSketchMode}
          selected={selectedSketchTool === "polyline"}
          onClick={() => onSelectedSketchToolChange("polyline")}
        />
        <ToolButton
          icon="circleOutline"
          disabled={!isSketchMode}
          selected={selectedSketchTool === "circle"}
          onClick={() => onSelectedSketchToolChange("circle")}
        />
        <ToolButton
          icon="squareOutline"
          disabled={!isSketchMode}
          selected={selectedSketchTool === "rectangle"}
          onClick={() => onSelectedSketchToolChange("rectangle")}
        />
        <ToolButton
          icon="polygon"
          disabled={!isSketchMode}
          selected={selectedSketchTool === "polygon"}
          onClick={() => onSelectedSketchToolChange("polygon")}
        />
        <ToolButton
          icon="cylinder"
          disabled={!isSketchMode}
          selected={selectedSketchTool === "extrudedCircle"}
          onClick={() => onSelectedSketchToolChange("extrudedCircle")}
        />
        <ToolButton
          icon="box"
          disabled={!isSketchMode}
          selected={selectedSketchTool === "extrudedRectangle"}
          onClick={() => onSelectedSketchToolChange("extrudedRectangle")}
        />
        <ToolButton
          icon="polygonExtruded"
          disabled={!isSketchMode}
          selected={selectedSketchTool === "extrudedPolygon"}
          onClick={() => onSelectedSketchToolChange("extrudedPolygon")}
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
