import { Button, CodeInput, TabItem, Tabs } from "@reearth/beta/lib/reearth-ui";
import { useLayerStylesFetcher } from "@reearth/services/api";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useState, useEffect, useMemo } from "react";

import { LayerStyleValueUpdateProps } from "../../../hooks/useLayerStyles";
import SharedNoStyleMessage from "../../shared/SharedNoStyleMessage";

import LayerStyleInterface from "./LayerStyleInterface";

type LayerStyleEditorProps = {
  selectedLayerStyleId?: string;
  sceneId?: string;
  onLayerStyleValueUpdate?: (inp: LayerStyleValueUpdateProps) => void;
};

const LayerStyleEditor: FC<LayerStyleEditorProps> = ({
  selectedLayerStyleId,
  sceneId,
  onLayerStyleValueUpdate
}) => {
  const t = useT();

  const [styleCode, setStyleCode] = useState<string | undefined>("{}");

  const { useGetLayerStylesQuery } = useLayerStylesFetcher();
  const { layerStyles = [] } = useGetLayerStylesQuery({ sceneId });

  const selectedLayerStyle = useMemo(
    () => layerStyles.find((a) => a.id === selectedLayerStyleId),
    [layerStyles, selectedLayerStyleId]
  );

  const [localLayerStyle, setLocalLayerStyle] = useState(selectedLayerStyle);

  useEffect(() => {
    if (selectedLayerStyle?.value) {
      setStyleCode(JSON.stringify(selectedLayerStyle.value, null, 2));
      setLocalLayerStyle(selectedLayerStyle);
    }
  }, [selectedLayerStyleId, layerStyles, selectedLayerStyle]);

  const handleChange = (newStyleCode?: string) => {
    setStyleCode(newStyleCode);
    const parsedStyle = JSON.parse(newStyleCode || "");
    setLocalLayerStyle((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        value: parsedStyle
      };
    });
  };

  const handleSubmit = useCallback(() => {
    if (onLayerStyleValueUpdate && styleCode && JSON.parse(styleCode)) {
      if (selectedLayerStyleId)
        onLayerStyleValueUpdate({
          styleId: selectedLayerStyleId,
          value: JSON.parse(styleCode)
        });
    }
  }, [onLayerStyleValueUpdate, styleCode, selectedLayerStyleId]);

  const tabsItem: TabItem[] = [
    {
      id: "interface",
      name: t("Interface"),
      children: (
        <LayerStyleInterface
          selectedLayerStyleId={selectedLayerStyleId}
          localLayerStyle={localLayerStyle}
        />
      )
    },
    {
      id: "code",
      name: t("Code"),
      children: selectedLayerStyleId ? (
        <CodeInput value={styleCode} onChange={handleChange} language="json" />
      ) : (
        <SharedNoStyleMessage />
      )
    }
  ];
  return (
    <EditorContainer>
      <Tabs tabs={tabsItem} position="top" alignment="end" />
      {selectedLayerStyleId && (
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
