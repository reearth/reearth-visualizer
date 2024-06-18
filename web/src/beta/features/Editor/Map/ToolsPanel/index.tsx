import { FC, useEffect, useMemo } from "react";

import { IconButton, IconName } from "@reearth/beta/lib/reearth-ui";
import { Panel } from "@reearth/beta/ui/layout";
import { SketchType } from "@reearth/core";
import { styled } from "@reearth/services/theme";

export type ToolsPanelProps = {
  sketchEnabled: boolean;
  sketchType: SketchType | undefined;
  onSketchTypeChange: (type: SketchType | undefined) => void;
};

type SketchTool = {
  icon: IconName;
  selected: boolean;
  onClick: () => void;
};

const ToolsPanel: FC<ToolsPanelProps> = ({ sketchEnabled, sketchType, onSketchTypeChange }) => {
  const sketchTools: SketchTool[] = useMemo(
    () => [
      {
        icon: "mapPin",
        selected: sketchEnabled && sketchType === "marker",
        onClick: () => onSketchTypeChange("marker"),
      },
      {
        icon: "polyline",
        selected: sketchEnabled && sketchType === "polyline",
        onClick: () => onSketchTypeChange("polyline"),
      },
      {
        icon: "circle",
        selected: sketchEnabled && sketchType === "circle",
        onClick: () => onSketchTypeChange("circle"),
      },
      {
        icon: "square",
        selected: sketchEnabled && sketchType === "rectangle",
        onClick: () => onSketchTypeChange("rectangle"),
      },
      {
        icon: "polygon",
        selected: sketchEnabled && sketchType === "polygon",
        onClick: () => onSketchTypeChange("polygon"),
      },
      {
        icon: "cylinder",
        selected: sketchEnabled && sketchType === "extrudedCircle",
        onClick: () => onSketchTypeChange("extrudedCircle"),
      },
      {
        icon: "cube",
        selected: sketchEnabled && sketchType === "extrudedRectangle",
        onClick: () => onSketchTypeChange("extrudedRectangle"),
      },
      {
        icon: "extrude",
        selected: sketchEnabled && sketchType === "extrudedPolygon",
        onClick: () => onSketchTypeChange("extrudedPolygon"),
      },
    ],
    [sketchEnabled, sketchType, onSketchTypeChange],
  );

  useEffect(() => {
    if (!sketchEnabled) onSketchTypeChange(undefined);
  }, [sketchEnabled, onSketchTypeChange]);

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
  padding: theme.spacing.smallest,
}));
