import { Placement } from "@floating-ui/react";
import { Button, IconButton, IconName } from "@reearth/beta/lib/reearth-ui";
import ConfirmModal from "@reearth/beta/ui/components/ConfirmModal";
import { Panel } from "@reearth/beta/ui/layout";
import { SketchType } from "@reearth/core";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { FC, useCallback, useEffect, useMemo, useState } from "react";

import { useMapPage } from "../context";
import { SketchFeatureTooltipAtom } from "../state";

type SketchTool = {
  icon: IconName;
  selected: boolean;
  tooltipText: string;
  placement?: Placement;
  onClick: () => void;
};

const ToolsPanel: FC = () => {
  const {
    sketchEnabled,
    sketchType,
    selectedLayerId,
    selectedSketchFeature,
    sketchEditingFeature,
    handleSketchTypeChange,
    handleSketchGeometryEditStart,
    handleSketchGeometryEditCancel,
    handleGeoJsonFeatureDelete
  } = useMapPage();

  const t = useT();
  const [showDeleteFeatureConfirmModal, setShowDeleteFeatureConfirmModal] =
    useState(false);

  const setSketchLayerTooltip = useSetAtom(SketchFeatureTooltipAtom);

  const handleDrawSketchFeature = useCallback(
    (sketchType?: SketchType) => {
      handleSketchTypeChange(sketchType);
      setSketchLayerTooltip?.({
        description: [
          t("Click to place the point"),
          t("Double click or press Enter key to finish drawing"),
          t("Right click to cancel drawing"),
          t("Press ESC to undo the last step")
        ].join("\n")
      });
    },
    [handleSketchTypeChange, setSketchLayerTooltip, t]
  );

  const sketchTools: SketchTool[] = useMemo(
    () => [
      {
        icon: "mapPin",
        selected: sketchEnabled && sketchType === "marker",
        tooltipText: t("Marker"),
        placement: "top",
        onClick: () => handleDrawSketchFeature("marker")
      },
      {
        icon: "polyline",
        selected: sketchEnabled && sketchType === "polyline",
        tooltipText: t("Polyline"),
        placement: "top",
        onClick: () => handleDrawSketchFeature("polyline")
      },
      {
        icon: "circle",
        selected: sketchEnabled && sketchType === "circle",
        tooltipText: t("Circle"),
        placement: "top",
        onClick: () => handleDrawSketchFeature("circle")
      },
      {
        icon: "square",
        selected: sketchEnabled && sketchType === "rectangle",
        tooltipText: t("Rectangle"),
        placement: "top",
        onClick: () => handleDrawSketchFeature("rectangle")
      },
      {
        icon: "polygon",
        selected: sketchEnabled && sketchType === "polygon",
        tooltipText: t("Polygon"),
        placement: "top",
        onClick: () => handleDrawSketchFeature("polygon")
      },
      {
        icon: "cylinder",
        selected: sketchEnabled && sketchType === "extrudedCircle",
        tooltipText: t("Extruded circle"),
        placement: "top",
        onClick: () => handleDrawSketchFeature("extrudedCircle")
      },
      {
        icon: "cube",
        selected: sketchEnabled && sketchType === "extrudedRectangle",
        tooltipText: t("Extruded rectangle"),
        placement: "top",
        onClick: () => handleDrawSketchFeature("extrudedRectangle")
      },
      {
        icon: "extrude",
        selected: sketchEnabled && sketchType === "extrudedPolygon",
        tooltipText: t("Extruded polygon"),
        placement: "top",
        onClick: () => handleDrawSketchFeature("extrudedPolygon")
      }
    ],
    [sketchEnabled, sketchType, t, handleDrawSketchFeature]
  );

  const isEditingGeometry = useMemo(
    () =>
      selectedSketchFeature?.properties?.id ===
      sketchEditingFeature?.feature?.id,
    [selectedSketchFeature?.properties?.id, sketchEditingFeature?.feature?.id]
  );

  useEffect(() => {
    if (!sketchEnabled) {
      handleSketchTypeChange(undefined);
      setSketchLayerTooltip(RESET);
    }
  }, [sketchEnabled, handleSketchTypeChange, setSketchLayerTooltip]);

  useEffect(() => {
    if (!sketchType) setSketchLayerTooltip(RESET);
  }, [setSketchLayerTooltip, sketchType]);

  const handleEditSketchFeature = useCallback(() => {
    handleSketchGeometryEditStart();
    handleSketchTypeChange(undefined);
    setSketchLayerTooltip?.({
      description: [
        t("Drag and Drop to adjust the point position"),
        t("Select a point and press Delete key to remove it"),
        t("Double click or press Enter to save the edits"),
        t("Right click to cancel editing")
      ].join("\n")
    });
  }, [
    handleSketchGeometryEditStart,
    handleSketchTypeChange,
    setSketchLayerTooltip,
    t
  ]);

  const handleDeleteSketchFeature = useCallback(() => {
    if (!selectedLayerId || !selectedSketchFeature?.id) return;
    handleGeoJsonFeatureDelete?.({
      layerId: selectedLayerId,
      featureId: selectedSketchFeature.id
    });
    setShowDeleteFeatureConfirmModal(false);
    handleSketchTypeChange(undefined);
  }, [
    selectedLayerId,
    selectedSketchFeature?.id,
    handleGeoJsonFeatureDelete,
    handleSketchTypeChange
  ]);

  const handleShowDeleteFeatureConfirmModal = useCallback(() => {
    setShowDeleteFeatureConfirmModal(true);
    handleSketchTypeChange(undefined);
    if (isEditingGeometry) {
      handleSketchGeometryEditCancel();
    }
  }, [
    handleSketchGeometryEditCancel,
    handleSketchTypeChange,
    isEditingGeometry
  ]);

  return (
    <Panel
      dataTestid="editor-map-tools-panel"
      storageId="editor-map-tools-panel"
      extend
    >
      <SketchToolsWrapper>
        <SketchFeatureButtons>
          {sketchTools.map(
            ({ icon, selected, tooltipText, placement, onClick }) => (
              <IconButton
                key={icon}
                icon={icon}
                disabled={!sketchEnabled}
                appearance={"simple"}
                active={selected}
                tooltipText={tooltipText}
                placement={placement}
                onClick={onClick}
              />
            )
          )}
        </SketchFeatureButtons>
        <Divider />
        <SketchFeatureButtons>
          <IconButton
            icon="pencilLine"
            disabled={!selectedSketchFeature}
            appearance={"simple"}
            active={isEditingGeometry}
            placement="top"
            onClick={handleEditSketchFeature}
            tooltipText={t("Edit Geometry")}
          />
          <IconButton
            icon="trash"
            disabled={!selectedSketchFeature}
            appearance={"simple"}
            tooltipText={t("Delete Feature")}
            placement="top"
            onClick={handleShowDeleteFeatureConfirmModal}
          />
        </SketchFeatureButtons>
      </SketchToolsWrapper>
      {showDeleteFeatureConfirmModal && (
        <ConfirmModal
          visible={true}
          title={t("Delete this feature?")}
          description={t(
            "Are you sure you want to delete this feature? If deleted, you can not recover it again."
          )}
          actions={
            <>
              <Button
                size="normal"
                title={t("Cancel")}
                onClick={() => setShowDeleteFeatureConfirmModal(false)}
              />
              <Button
                size="normal"
                title={t("Delete")}
                appearance="dangerous"
                onClick={handleDeleteSketchFeature}
              />
            </>
          }
        />
      )}
    </Panel>
  );
};

export default ToolsPanel;

const SketchToolsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  gap: theme.spacing.smallest
}));

const Divider = styled("div")(({ theme }) => ({
  borderLeft: `1px solid ${theme.outline.weak}`,
  height: "24px"
}));

const SketchFeatureButtons = styled("div")(({ theme }) => ({
  display: "flex",
  padding: theme.spacing.smallest,
  gap: theme.spacing.small
}));
