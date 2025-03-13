import "react18-json-view/src/style.css";
import "react18-json-view/src/dark.css";

import { SelectedFeature } from "@reearth/beta/features/Editor/hooks/useLayers";
import { GeoJsonFeatureUpdateProps } from "@reearth/beta/features/Editor/hooks/useSketch";
import {
  Button,
  CodeInput,
  Collapse,
  Typography
} from "@reearth/beta/lib/reearth-ui";
import { NLSLayer, SketchFeature } from "@reearth/services/api/layersApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC } from "react";
import JsonView from "react18-json-view";

import { FieldComponent } from "./CustomPropertField";
import useHooks from "./hooks";
import PhotoOverlayCollapse from "./PhotoOverlayCollapse";

export type FeatureDataProps = {
  selectedFeature?: SelectedFeature;
  layer?: NLSLayer;
  sketchFeature?: SketchFeature;
  onGeoJsonFeatureUpdate?: (inp: GeoJsonFeatureUpdateProps) => void;
};

export type ValueProp = string | number | boolean | undefined;
export type FieldProp = {
  id: string;
  type: string;
  title: string;
  value?: ValueProp;
};

const FeatureData: FC<FeatureDataProps> = ({
  selectedFeature,
  layer,
  sketchFeature,
  onGeoJsonFeatureUpdate
}) => {
  const t = useT();
  const theme = useTheme();
  const {
    fields,
    editMode,
    collapsedStates,
    jsonStyle,
    geometryValue,
    editGeometry,
    setEditGeometry,
    setFields,
    setGeometryValue,
    handleCollapse,
    handleSubmit,
    handleDeletePhotoOverlay,
    handleEditCustomProperties,
    handleCancelEditCustomProperties,
    handleUpdateGeometry,
    handleCancelEditGeometry
  } = useHooks({
    layer,
    sketchFeature,
    selectedFeature,
    onGeoJsonFeatureUpdate
  });

  return (
    <Wrapper>
      {!!layer?.isSketch && (
        <Collapse
          title={t("Custom Properties")}
          size="small"
          background={theme.relative.dim}
          headerBg={theme.relative.dim}
          collapsed={collapsedStates.customProperties}
          onCollapse={(state) => handleCollapse("customProperties", state)}
        >
          <FieldsWrapper>
            {fields.map((f) => (
              <FieldComponent
                field={f}
                key={f.id}
                setFields={setFields}
                editMode={editMode}
              />
            ))}
            <SketchFeatureButtons>
              {fields.length > 0 &&
                (editMode ? (
                  <>
                    <Button
                      onClick={handleCancelEditCustomProperties}
                      size="small"
                      icon="close"
                      extendWidth
                    />
                    <Button
                      extendWidth
                      icon="check"
                      size="small"
                      appearance="primary"
                      onClick={handleSubmit}
                    />
                  </>
                ) : (
                  <Button
                    onClick={handleEditCustomProperties}
                    size="small"
                    icon="pencilSimple"
                    title={t("Edit")}
                    extendWidth
                  />
                ))}
            </SketchFeatureButtons>
          </FieldsWrapper>
          {fields.length === 0 && (
            <Typography size="body" color={theme.content.weak}>
              {t("No custom properties")}
            </Typography>
          )}
        </Collapse>
      )}
      {!!layer?.isSketch && selectedFeature && sketchFeature && (
        <PhotoOverlayCollapse
          layerId={layer.id}
          dataFeatureId={sketchFeature.id}
          feature={selectedFeature}
          value={selectedFeature?.properties?.["_reearth"]?.["photoOverlay"]}
          collapsedStates={collapsedStates}
          onCollapse={handleCollapse}
          onDelete={handleDeletePhotoOverlay}
        />
      )}
      <Collapse
        title={t("Geometry")}
        size="small"
        background={theme.relative.dim}
        headerBg={theme.relative.dim}
        collapsed={collapsedStates.geometry}
        onCollapse={(state) => handleCollapse("geometry", state)}
      >
        {!!layer?.isSketch && selectedFeature && sketchFeature ? (
          <GeometryWrapper>
            <CodeWrapper>
              <CodeInput
                value={geometryValue}
                onChange={setGeometryValue}
                language="json"
                showLines={false}
                disabled={!editGeometry}
              />
            </CodeWrapper>
            {editGeometry ? (
              <SketchFeatureButtons>
                <Button
                  onClick={handleCancelEditGeometry}
                  size="small"
                  icon="close"
                  extendWidth
                />
                <Button
                  extendWidth
                  icon="check"
                  size="small"
                  appearance="primary"
                  onClick={handleUpdateGeometry}
                />
              </SketchFeatureButtons>
            ) : (
              <Button
                onClick={() => setEditGeometry(true)}
                size="small"
                icon="bracketsCurly"
                title={t("Update JSON")}
                extendWidth
              />
            )}
          </GeometryWrapper>
        ) : (
          <ValueWrapper>
            <JsonView
              src={selectedFeature?.geometry}
              theme="vscode"
              dark
              style={jsonStyle}
            />
          </ValueWrapper>
        )}
      </Collapse>
      <Collapse
        title={t("Properties")}
        size="small"
        background={theme.relative.dim}
        headerBg={theme.relative.dim}
        collapsed={collapsedStates.properties}
        onCollapse={(state) => handleCollapse("properties", state)}
      >
        <ValueWrapper>
          <JsonView
            src={selectedFeature?.properties}
            theme="vscode"
            dark
            style={jsonStyle}
          />
        </ValueWrapper>
      </Collapse>
    </Wrapper>
  );
};

export default FeatureData;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
  padding: `${theme.spacing.small}px 0`,
  wordBreak: "break-all"
}));

const FieldsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.normal,
  userSelect: "none"
}));

const ValueWrapper = styled("div")(({ theme }) => ({
  border: `1px solid ${theme.outline.weak}`,
  borderRadius: theme.radius.small,
  background: theme.bg[1],
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`
}));

const SketchFeatureButtons = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.small
}));

const GeometryWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small
}));

const CodeWrapper = styled("div")(() => ({
  minHeight: "200px"
}));
