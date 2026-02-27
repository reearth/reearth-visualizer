import { useTheme } from "@emotion/react";
import { Button, Collapse, TextInput } from "@reearth/app/lib/reearth-ui";
import Tooltip from "@reearth/app/lib/reearth-ui/components/Tooltip";
import {
  getPhotoOverlayValue,
  PhotoOverlayValue
} from "@reearth/app/utils/sketch";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { useSetAtom } from "jotai";
import { FC, useCallback, useMemo } from "react";

import { InspectorFeature } from "..";
import { photoOverlayEditingFeatureAtom } from "../../../state";

type PhotoOverlayCollapseProps = {
  layerId: string;
  dataFeatureId: string;
  feature: InspectorFeature;
  value: PhotoOverlayValue | undefined;
  collapsedStates: Record<string, boolean>;
  onCollapse: (key: string, state: boolean) => void;
  onDelete?: () => void;
};

const PhotoOverlayCollapse: FC<PhotoOverlayCollapseProps> = ({
  layerId,
  dataFeatureId,
  feature,
  collapsedStates,
  onCollapse,
  onDelete
}) => {
  const theme = useTheme();
  const t = useT();

  const setPhotoOverlayEditingFeature = useSetAtom(
    photoOverlayEditingFeatureAtom
  );

  const handleEdit = useCallback(() => {
    setPhotoOverlayEditingFeature({
      layerId,
      dataFeatureId,
      feature
    });
  }, [layerId, dataFeatureId, feature, setPhotoOverlayEditingFeature]);

  const value = useMemo(
    () => getPhotoOverlayValue(feature.properties),
    [feature.properties]
  );

  return (
    <Collapse
      title={t("Photo Overlay")}
      titleSuffix={<Tooltip type="experimental" />}
      size="small"
      background={theme.relative.dim}
      headerBg={theme.relative.dim}
      collapsed={collapsedStates.photoOverlay}
      onCollapse={(state) => onCollapse("photoOverlay", state)}
    >
      <FieldWrapper>
        <TextInput
          value={value && t("Photo Overlay Set")}
          placeholder={t("Not set")}
          appearance="readonly"
          disabled
          actions={[
            <Button
              key="delete"
              icon="trash"
              size="small"
              iconButton
              appearance="simple"
              disabled={!value}
              onClick={onDelete}
              iconColor={value ? theme.content.main : theme.content.weak}
              data-testid="photooverlay-delete-btn"
            />
          ]}
        />
        <Button
          appearance="secondary"
          title={t("Edit")}
          icon="pencilSimple"
          size="small"
          onClick={handleEdit}
          data-testid="photooverlay-edit-btn"
        />
      </FieldWrapper>
    </Collapse>
  );
};

export default PhotoOverlayCollapse;

const FieldWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: `${theme.spacing.smallest}px`,
  width: "100%"
}));
