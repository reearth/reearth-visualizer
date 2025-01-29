import { Button, DragAndDropList, Icon } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useMemo } from "react";

import { CustomPropertyProps } from "../../SketchLayerCreator/type";
import { ContentWrapper } from "../SharedComponent";

import CustomPropertyItem from "./CustomPropertyItem";
import useHooks from "./hooks";

const CUSTOM_PROPERTIES_DRAG_HANDLE_CLASS_NAME =
  "reearth-visualizer-editor-custom-properties-drag-handle";

const SketchCustomProperties: FC<CustomPropertyProps> = ({
  customProperties,
  propertiesList,
  warning,
  isSketchLayerEditor,
  setPropertiesList,
  setCustomProperties,
  setWarning,
  setNewTitle,
  setPreviousTitle,
}) => {
  const t = useT();

  const {
    editTitleIndex,
    handleCustomPropertyAdd,
    handleTitleBlur,
    handleTypeChange,
    handleDoubleClick,
    handleMoveStart,
    handleMoveEnd,
    handleCustomPropertyDelete
  } = useHooks({
    customProperties,
    propertiesList,
    setPropertiesList,
    setCustomProperties,
    setWarning,
    setNewTitle,
    setPreviousTitle,
  });

  const DraggableCustomPropertyItems = useMemo(
    () =>
      propertiesList?.map((item, idx) => ({
        id: item.id,
        content: (
          <CustomPropertyItem
            key={item.id}
            isEditTitle={editTitleIndex === idx}
            isSketchLayerEditor={isSketchLayerEditor}
            customPropertyItem={item}
            handleClassName={CUSTOM_PROPERTIES_DRAG_HANDLE_CLASS_NAME}
            onBlur={handleTitleBlur(idx)}
            onDoubleClick={(field: string) => handleDoubleClick(idx, field)}
            onTypeChange={handleTypeChange(idx)}
            onCustomPropertyDelete={() => handleCustomPropertyDelete(idx)}
          />
        )
      })),
    [propertiesList, editTitleIndex, isSketchLayerEditor, handleTitleBlur, handleTypeChange, handleDoubleClick, handleCustomPropertyDelete]
  );

  return (
    <ContentWrapper>
      <PropertyTable>
        <PropertyTableRow>
          <ActionCol />
          <PropertyHeaderCol>
            <Title>{t("Title")}</Title>
          </PropertyHeaderCol>
          <PropertyHeaderCol>
            <Title>{t("Type")}</Title>
          </PropertyHeaderCol>
          <ActionCol />
        </PropertyTableRow>
        <PropertyTableBody>
          {propertiesList && propertiesList.length > 0 && (
            <DragAndDropList
              items={DraggableCustomPropertyItems}
              onMoveStart={handleMoveStart}
              onMoveEnd={handleMoveEnd}
            />
          )}
        </PropertyTableBody>
        {warning && (
          <Warning>
            <Icon icon="warning" size="large" />
            {t(
              "The keyword you want to use as the custom property title has been used in the system, please choose any other keyword"
            )}
          </Warning>
        )}
        <Button
          icon="plus"
          title={t("New Property")}
          size="small"
          onClick={handleCustomPropertyAdd}
          appearance="primary"
          disabled={warning}
        />
      </PropertyTable>
    </ContentWrapper>
  );
};

const Title = styled("div")(({ theme }) => ({
  color: theme.content.weak,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular
}));

const PropertyTable = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
  width: "100%"
}));

const PropertyTableBody = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.normal,
  maxHeight: "320px",
  overflowY: "auto"
}));

const PropertyTableRow = styled("div")(({ theme }) => ({
  display: "flex",
  width: "100%",
  gap: theme.spacing.smallest
}));

const ActionCol = styled("div")(() => ({
  marginRight: "12px"
}));

const PropertyHeaderCol = styled("div")(() => ({
  flex: 1
}));

const Warning = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.small,
  paddingTop: theme.spacing.small,
  color: theme.dangerous.main,
  alignItems: "center",
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  padding: `${theme.spacing.smallest}px 0`
}));

export default SketchCustomProperties;
