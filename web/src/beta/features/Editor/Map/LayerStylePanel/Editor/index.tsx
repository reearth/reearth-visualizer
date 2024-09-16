import { Button, TabItem, Tabs } from "@reearth/beta/lib/reearth-ui";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useEffect, useState } from "react";

import { LayerStyleValueUpdateProps } from "../../../hooks/useLayerStyles";

import CodeTab from "./CodeTab";
import InterfaceTab from "./InterfaceTab";

type LayerStyleEditorProps = {
  selectedLayerStyle?: LayerStyle;
  onLayerStyleValueUpdate?: (inp: LayerStyleValueUpdateProps) => void;
};

const LayerStyleEditor: FC<LayerStyleEditorProps> = ({
  selectedLayerStyle,
  onLayerStyleValueUpdate
}) => {
  const t = useT();
  const [, setNotification] = useNotification();

  const [layerStyle, setLayerStyle] = useState(selectedLayerStyle);
  const [styleCode, setStyleCode] = useState<string | undefined>("");

  useEffect(() => {
    setLayerStyle(selectedLayerStyle);
  }, [selectedLayerStyle]);

  useEffect(() => {
    setStyleCode(JSON.stringify(layerStyle?.value, null, 2));
  }, [layerStyle]);

  const handleSubmit = useCallback(() => {
    if (!layerStyle?.id) return;
    try {
      onLayerStyleValueUpdate?.({
        styleId: layerStyle.id,
        value: layerStyle?.value
      });
    } catch (_e) {
      setNotification({ type: "error", text: t("Invalid style") });
    }
  }, [
    layerStyle?.id,
    layerStyle?.value,
    onLayerStyleValueUpdate,
    setNotification,
    t
  ]);

  const tabItems: TabItem[] = [
    {
      id: "interface",
      name: t("Interface"),
      children: (
        <InterfaceTab layerStyle={layerStyle} setLayerStyle={setLayerStyle} />
      )
    },
    {
      id: "code",
      name: t("Code"),
      children: (
        <CodeTab
          styleCode={styleCode}
          setStyleCode={setStyleCode}
          setLayerStyle={setLayerStyle}
          hasLayerStyleSelected={!!layerStyle?.id}
        />
      )
    }
  ];

  return (
    <EditorContainer>
      <Tabs tabs={tabItems} position="top" alignment="end" />
      {layerStyle?.id && (
        <ButtonWrapper>
          <Button
            title={t("Save")}
            extendWidth
            size="small"
            icon="floppyDisk"
            onClick={handleSubmit}
          />
        </ButtonWrapper>
      )}
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
  background: theme.bg[1]
}));

const ButtonWrapper = styled("div")(({ theme }) => ({
  borderTop: `1px solid ${theme.outline.weaker}`,
  padding: theme.spacing.small,
  width: "100%"
}));

export default LayerStyleEditor;
