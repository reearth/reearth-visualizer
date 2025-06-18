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
  const {
    tabItems,
    editMode,
    handleSave,
    handleEditLayerStyle,
    handleCancelLayerStyle
  } = useHooks({
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
      <ButtonWrapper isSelected={!selectedLayerStyle}>
        {selectedLayerStyle?.id &&
          (editMode ? (
            <>
              <Button
                onClick={handleCancelLayerStyle}
                size="small"
                data-testid="cancel-layer-style-button"
                icon="close"
                extendWidth
              />
              <Button
                extendWidth
                icon="check"
                size="small"
                data-testid="save-layer-style-button"
                appearance="primary"
                onClick={handleSave}
              />
            </>
          ) : (
            <Button
              onClick={handleEditLayerStyle}
              size="small"
              data-testid="edit-layer-style-button"
              icon="pencilSimple"
              title={t("Edit")}
              extendWidth
            />
          ))}
      </ButtonWrapper>
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

const ButtonWrapper = styled("div")<{ isSelected?: boolean }>(
  ({ isSelected, theme }) => ({
    borderTop: isSelected ? "none" : `1px solid ${theme.outline.weaker}`,
    padding: theme.spacing.small,
    width: "100%",
    background: theme.bg[1],
    display: "flex",
    flexDirection: "row",
    gap: theme.spacing.small
  })
);

export default LayerStyleEditor;
