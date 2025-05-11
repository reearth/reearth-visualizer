import {
  LayerConfigUpdateProps,
  LayerNameUpdateProps
} from "@reearth/beta/features/Editor/hooks/useLayers";
import { Collapse } from "@reearth/beta/lib/reearth-ui";
import { InputField } from "@reearth/beta/ui/fields";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { useT } from "@reearth/services/i18n";
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

  return (
    <Wrapper>
      <Collapse
        title={t("Data source")}
        size="small"
        background={theme.relative.dim}
        headerBg={theme.relative.dim}
        collapsed={collapsedStates.dataSource}
        onCollapse={(state) => handleCollapse("dataSource", state)}
      >
        <InputWrapper>
          <InputField
            title={t("Layer Name")}
            value={selectedLayer.title}
            onChangeComplete={handleTitleUpdate}
          />
          <InputField
            title={t("Format")}
            value={selectedLayer.config?.data?.type}
            appearance="present"
            disabled
          />
          {localUrl && (
            <ResourceUrl
              title={t("Resource URL")}
              value={localUrl}
              onSubmit={handleLayerUrlUpdate}
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
        >
          <CustomPropertiesSchema
            customPropertySchema={selectedLayer.sketch?.customPropertySchema}
            layerId={selectedLayer.id}
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
