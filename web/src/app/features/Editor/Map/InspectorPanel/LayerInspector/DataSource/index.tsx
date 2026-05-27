import {
  LayerConfigUpdateProps,
  LayerNameUpdateProps
} from "@reearth/app/features/Editor/hooks/useLayers";
import { Collapse } from "@reearth/app/lib/reearth-ui";
import { InputField, SwitchField } from "@reearth/app/ui/fields";
import type { NLSLayer } from "@reearth/services/api/layer";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useEffect, useMemo, useState } from "react";

import ResourceUrl from "./ResourceUrl";
import CustomPropertiesSchema from "./SketchCustomProperties";

type Props = {
  selectedLayer: NLSLayer;
  onLayerNameUpdate?: (inp: LayerNameUpdateProps) => void;
  onLayerConfigUpdate?: (inp: LayerConfigUpdateProps) => void;
};

const DataSource: FC<Props> = ({
  selectedLayer,
  onLayerNameUpdate,
  onLayerConfigUpdate
}) => {
  const t = useT();
  const theme = useTheme();
  const [localUrl, setLocalUrl] = useState(selectedLayer.config?.data?.url);

  useEffect(() => {
    setLocalUrl(selectedLayer.config?.data?.url);
  }, [selectedLayer.config?.data?.url]);

  const initialCollapsedStates = useMemo(() => {
    const storedStates: Record<string, boolean> = {};
    ["dataSource", "customProperties"].forEach((id) => {
      storedStates[id] =
        localStorage.getItem(`reearth-visualizer-info-${id}-collapsed`) ===
        "true";
    });
    return storedStates;
  }, []);

  const [collapsedStates, setCollapsedStates] = useState<
    Record<string, boolean>
  >(initialCollapsedStates);

  const saveCollapseState = useCallback((storageId: string, state: boolean) => {
    localStorage.setItem(
      `reearth-visualizer-info-${storageId}-collapsed`,
      JSON.stringify(state)
    );
  }, []);

  const handleCollapse = useCallback(
    (storageId: string, state: boolean) => {
      saveCollapseState(storageId, state);
      setCollapsedStates((prevState) => ({
        ...prevState,
        [storageId]: state
      }));
    },
    [saveCollapseState]
  );

  const handleTitleUpdate = useCallback(
    (name: string) => {
      onLayerNameUpdate?.({ layerId: selectedLayer.id, name });
    },
    [onLayerNameUpdate, selectedLayer.id]
  );

  const handleLayerUrlUpdate = useCallback(
    (url: string) => {
      onLayerConfigUpdate?.({
        layerId: selectedLayer.id,
        config: {
          data: {
            ...selectedLayer.config.data,
            url
          }
        }
      });
    },
    [onLayerConfigUpdate, selectedLayer.config, selectedLayer.id]
  );

  const handleCzmlUpdateClockOnLoadChange = useCallback(
    (updateClockOnLoad: boolean) => {
      onLayerConfigUpdate?.({
        layerId: selectedLayer.id,
        config: {
          data: {
            ...selectedLayer.config.data,
            time: {
              ...selectedLayer.config.data?.time,
              updateClockOnLoad
            }
          }
        }
      });
    },
    [onLayerConfigUpdate, selectedLayer.config, selectedLayer.id]
  );

  return (
    <Wrapper data-testid="data-source-wrapper">
      <Collapse
        title={t("Layer")}
        size="small"
        background={theme.relative.dim}
        headerBg={theme.relative.dim}
        collapsed={collapsedStates.dataSource}
        onCollapse={(state) => handleCollapse("dataSource", state)}
        data-testid="data-source-collapse"
      >
        <InputWrapper data-testid="data-source-input-wrapper">
          <InputField
            title={t("Layer Name")}
            value={selectedLayer.title}
            onChangeComplete={handleTitleUpdate}
            data-testid="data-source-layer-name-input"
          />
          <InputField
            title={t("Format")}
            value={selectedLayer.config?.data?.type}
            appearance="present"
            disabled
            data-testid="data-source-format-input"
          />
          {localUrl && (
            <ResourceUrl
              title={t("Resource URL")}
              value={localUrl}
              onSubmit={handleLayerUrlUpdate}
              disabled={!!selectedLayer.dataSourceName}
              data-testid="data-source-resource-url"
            />
          )}
          {selectedLayer.config?.data?.type === "czml" && (
            <SwitchField
              title={t("Auto Update Time")}
              value={selectedLayer.config?.data?.time?.updateClockOnLoad}
              onChange={(v) => handleCzmlUpdateClockOnLoadChange(v)}
              data-testid="data-source-czml-auto-update-time-switcher"
              description={t(
                "When enabled, the simulation clock will be updated to the time interval defined in the CZML file once it is loaded. Warning: If multiple CZML layers with this option enabled are loaded, the final simulation time will be set by the last loaded layer."
              )}
            />
          )}
        </InputWrapper>
      </Collapse>
      {selectedLayer.isSketch && (
        <Collapse
          title={t("Custom property schema")}
          size="small"
          background={theme.relative.dim}
          headerBg={theme.relative.dim}
          collapsed={collapsedStates.customProperties}
          onCollapse={(state) => handleCollapse("customProperties", state)}
          data-testid="custom-property-schema-collapse"
        >
          <CustomPropertiesSchema
            customPropertySchema={selectedLayer.sketch?.customPropertySchema}
            layerId={selectedLayer.id}
            data-testid="custom-property-schema"
          />
        </Collapse>
      )}
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small
}));

const InputWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.large
}));

export default DataSource;
