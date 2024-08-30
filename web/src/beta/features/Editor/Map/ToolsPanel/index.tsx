
import { IconButton, IconName } from "@reearth/beta/lib/reearth-ui";
import { Panel } from "@reearth/beta/ui/layout";
import { styled } from "@reearth/services/theme";
import { FC, useEffect, useMemo } from "react";

import { useMapPage } from "../context";

type SketchTool = {
  icon: IconName;
  selected: boolean;
  onClick: () => void;
};

const ToolsPanel: FC = () => {
  const { sketchEnabled, sketchType, handleSketchTypeChange } = useMapPage();

  const sketchTools: SketchTool[] = useMemo(
    () => [
      {
        icon: "mapPin",
        selected: sketchEnabled && sketchType === "marker",
        onClick: () => handleSketchTypeChange("marker")
      },
      {
        icon: "polyline",
        selected: sketchEnabled && sketchType === "polyline",
        onClick: () => handleSketchTypeChange("polyline")
      },
      {
        icon: "circle",
        selected: sketchEnabled && sketchType === "circle",
        onClick: () => handleSketchTypeChange("circle")
      },
      {
        icon: "square",
        selected: sketchEnabled && sketchType === "rectangle",
        onClick: () => handleSketchTypeChange("rectangle")
      },
      {
        icon: "polygon",
        selected: sketchEnabled && sketchType === "polygon",
        onClick: () => handleSketchTypeChange("polygon")
      },
      {
        icon: "cylinder",
        selected: sketchEnabled && sketchType === "extrudedCircle",
        onClick: () => handleSketchTypeChange("extrudedCircle")
      },
      {
        icon: "cube",
        selected: sketchEnabled && sketchType === "extrudedRectangle",
        onClick: () => handleSketchTypeChange("extrudedRectangle")
      },
      {
        icon: "extrude",
        selected: sketchEnabled && sketchType === "extrudedPolygon",
        onClick: () => handleSketchTypeChange("extrudedPolygon")
      }
    ],
    [sketchEnabled, sketchType, handleSketchTypeChange]
  );

  useEffect(() => {
    if (!sketchEnabled) handleSketchTypeChange(undefined);
  }, [sketchEnabled, handleSketchTypeChange]);

  return (
    <Panel storageId="editor-map-tools-panel" extend>
      <SketchToolsWrapper>
        {sketchTools.map(({ icon, selected, onClick }) => (
          <IconButton
            key={icon}
            icon={icon}
            disabled={!sketchEnabled}
            appearance={"simple"}
            active={selected}
            onClick={onClick}
          />
        ))}
      </SketchToolsWrapper>
    </Panel>
  );
};

export default ToolsPanel;

const SketchToolsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  gap: theme.spacing.smallest,
  padding: theme.spacing.smallest
}));
