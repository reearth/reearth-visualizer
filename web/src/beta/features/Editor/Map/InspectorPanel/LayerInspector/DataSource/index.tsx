import { Collapse } from "@reearth/beta/lib/reearth-ui";
import { InputField, TextareaField } from "@reearth/beta/ui/fields";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useMemo, useState } from "react";

import CustomPropertiesSchema from "./SketchCustomProperties";

type Props = {
  selectedLayer: NLSLayer;
};

const DataSource: FC<Props> = ({ selectedLayer }) => {
  const t = useT();
  const theme = useTheme();

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
            appearance="readonly"
            disabled
          />
          <InputField
            title={t("Format")}
            value={selectedLayer.config?.data?.type}
            appearance="readonly"
            disabled
          />
          {selectedLayer.config?.data?.url && (
            <TextareaField
              title={t("Resource URL")}
              value={selectedLayer.config?.data?.url}
              appearance="readonly"
              disabled
              rows={3}
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
