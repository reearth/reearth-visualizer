import { Button, CodeInput } from "@reearth/beta/lib/reearth-ui";
import { useLayerStylesFetcher } from "@reearth/services/api";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useState, useEffect } from "react";

import { LayerStyleValueUpdateProps } from "../../hooks/useLayerStyles";

type LayerStyleEditorProps = {
  selectedLayerStyleId?: string;
  sceneId?: string;
  onLayerStyleValueUpdate?: (inp: LayerStyleValueUpdateProps) => void;
};

const LayerStyleEditor: FC<LayerStyleEditorProps> = ({
  selectedLayerStyleId,
  sceneId,
  onLayerStyleValueUpdate,
}) => {
  const t = useT();
  const [styleCode, setStyleCode] = useState<string | undefined>("{}");

  const { useGetLayerStylesQuery } = useLayerStylesFetcher();
  const { layerStyles = [] } = useGetLayerStylesQuery({ sceneId });

  useEffect(() => {
    const selectedLayerStyle = layerStyles.find(
      (a) => a.id === selectedLayerStyleId,
    );
    if (selectedLayerStyle?.value) {
      setStyleCode(JSON.stringify(selectedLayerStyle.value, null, 2));
    }
  }, [selectedLayerStyleId, layerStyles]);

  const handleSubmit = useCallback(() => {
    if (onLayerStyleValueUpdate && styleCode && JSON.parse(styleCode)) {
      if (selectedLayerStyleId)
        onLayerStyleValueUpdate({
          styleId: selectedLayerStyleId,
          value: JSON.parse(styleCode),
        });
    }
  }, [onLayerStyleValueUpdate, styleCode, selectedLayerStyleId]);

  return (
    <EditorContainer>
      <CodeInput value={styleCode} onChange={setStyleCode} language="json" />
      <Button
        title={t("Save")}
        extendWidth
        size="small"
        appearance="primary"
        onClick={handleSubmit}
      />
    </EditorContainer>
  );
};

const EditorContainer = styled("div")(({ theme }) => ({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing.small,
}));

export default LayerStyleEditor;
