import { Button, Tabs } from "@reearth/beta/lib/reearth-ui";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import { LayerStyleValueUpdateProps } from "../../../hooks/useLayerStyles";

import useHooks from "./hooks";

type LayerStyleEditorProps = {
  selectedLayerStyle?: LayerStyle;
  onLayerStyleValueUpdate?: (inp: LayerStyleValueUpdateProps) => void;
};

const LayerStyleEditor: FC<LayerStyleEditorProps> = ({
  selectedLayerStyle,
  onLayerStyleValueUpdate
}) => {
  const { tabItems, handleSave } = useHooks({
    selectedLayerStyle,
    onLayerStyleValueUpdate
  });

  const t = useT();

  return (
    <EditorContainer>
      <Tabs
        tabs={tabItems}
        position="top"
        alignment="end"
        noOverflowY
        noPadding
        flexHeight
        menuEdgeGap="small"
      />
      {selectedLayerStyle?.id && (
        <ButtonWrapper>
          <Button
            title={t("Save")}
            extendWidth
            size="small"
            icon="floppyDisk"
            onClick={handleSave}
          />
        </ButtonWrapper>
      )}
    </EditorContainer>
  );
};

const EditorContainer = styled("div")(({ theme }) => ({
  width: "100%",
  minHeight: 0,
  height: "auto",
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
  paddingTop: theme.spacing.smallest
}));

const ButtonWrapper = styled("div")(({ theme }) => ({
  borderTop: `1px solid ${theme.outline.weaker}`,
  padding: theme.spacing.small,
  width: "100%",
  background: theme.bg[1]
}));

export default LayerStyleEditor;
