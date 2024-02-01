import { useEffect, useMemo } from "react";

import Button from "@reearth/beta/components/Button";
import { SketchType } from "@reearth/beta/lib/core/Map/Sketch/types";
import { styled } from "@reearth/services/theme";

type Props = {
  enable: boolean;
  sketchType: SketchType | undefined;
  onSketchTypeChange: (type: SketchType | undefined) => void;
};
const Toolbar: React.FC<Props> = ({ enable, sketchType, onSketchTypeChange }) => {
  const sketchTools = useMemo(
    () => [
      {
        icon: "marker",
        selected: enable && sketchType === "marker",
        onClick: () => onSketchTypeChange("marker"),
      },
      {
        icon: "polyline",
        selected: enable && sketchType === "polyline",
        onClick: () => onSketchTypeChange("polyline"),
      },
      {
        icon: "circleOutline",
        selected: enable && sketchType === "circle",
        onClick: () => onSketchTypeChange("circle"),
      },
      {
        icon: "squareOutline",
        selected: enable && sketchType === "rectangle",
        onClick: () => onSketchTypeChange("rectangle"),
      },
      {
        icon: "polygon",
        selected: enable && sketchType === "polygon",
        onClick: () => onSketchTypeChange("polygon"),
      },
      {
        icon: "cylinder",
        selected: enable && sketchType === "extrudedCircle",
        onClick: () => onSketchTypeChange("extrudedCircle"),
      },
      {
        icon: "box",
        selected: enable && sketchType === "extrudedRectangle",
        onClick: () => onSketchTypeChange("extrudedRectangle"),
      },
      {
        icon: "polygonExtruded",
        selected: enable && sketchType === "extrudedPolygon",
        onClick: () => onSketchTypeChange("extrudedPolygon"),
      },
    ],
    [enable, sketchType, onSketchTypeChange],
  );

  useEffect(() => {
    if (!enable) onSketchTypeChange(undefined);
  }, [enable, onSketchTypeChange]);

  return (
    <Wrapper>
      {sketchTools.map(({ icon, selected, onClick }) => (
        <ToolButton
          key={icon}
          icon={icon}
          disabled={!enable}
          selected={selected}
          onClick={onClick}
        />
      ))}
    </Wrapper>
  );
};

export default Toolbar;

const Wrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 32px;
  gap: 8px;
  padding-left: 4px;
  padding-right: 4px;
  margin: 2px 1px 1px 1px;
  border-radius: 8px;
  background: ${({ theme }) => theme.bg[0]};
`;

const ToolButton = styled(Button)<{ selected?: boolean }>`
  height: 24px;
  width: 24px;
  padding: 0;
  border: none;
  box-shadow: none;
  background-color: ${({ theme, selected }) => (selected ? theme.select.main : "none")};

  &:hover {
    background-color: ${({ theme, selected }) => (selected ? theme.select.main : theme.bg[2])};
  }
`;
