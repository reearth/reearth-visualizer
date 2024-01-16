import { useMemo } from "react";

import Button from "@reearth/beta/components/Button";
import SecondaryNav from "@reearth/beta/features/Editor/SecondaryNav";
import {
  type SketchToolType,
  type InteractionModeType,
} from "@reearth/beta/features/Editor/useInteractionMode";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { styled } from "@reearth/services/theme";

type Props = {
  interactionMode: InteractionModeType;
  selectedSketchTool: SketchToolType;
  sketchModeDisabled: boolean;
  selectedLayer: NLSLayer | undefined;
  onInteractionModeChange: (mode: InteractionModeType) => void;
  onSelectedSketchToolChange: (tool: SketchToolType) => void;
};
const Toolbar: React.FC<Props> = ({
  interactionMode,
  selectedSketchTool,
  sketchModeDisabled,
  selectedLayer,
  onInteractionModeChange,
  onSelectedSketchToolChange,
}) => {
  const isSketchLayerSelected = useMemo(
    () => selectedLayer?.config?.data?.isSketchLayer,
    [selectedLayer],
  );
  const isSketchMode = useMemo(() => interactionMode === "sketch", [interactionMode]);
  return (
    isSketchLayerSelected && (
      <StyledSecondaryNav>
        <ButtonGroup>
          <ToolButton
            icon="pointer"
            selected={interactionMode === "default"}
            onClick={() => onInteractionModeChange("default")}
          />
          <ToolButton
            icon="sketch"
            disabled={sketchModeDisabled}
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
            selected={selectedSketchTool === "free-style"}
            onClick={() => onSelectedSketchToolChange("free-style")}
          />
          <ToolButton
            icon="cylinder"
            disabled={!isSketchMode}
            selected={selectedSketchTool === "circle-extruded"}
            onClick={() => onSelectedSketchToolChange("circle-extruded")}
          />
          <ToolButton
            icon="box"
            disabled={!isSketchMode}
            selected={selectedSketchTool === "rectangle-extruded"}
            onClick={() => onSelectedSketchToolChange("rectangle-extruded")}
          />
          <ToolButton
            icon="polygonExtruded"
            disabled={!isSketchMode}
            selected={selectedSketchTool === "free-style-extruded"}
            onClick={() => onSelectedSketchToolChange("free-style-extruded")}
          />
        </ButtonGroup>
      </StyledSecondaryNav>
    )
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
