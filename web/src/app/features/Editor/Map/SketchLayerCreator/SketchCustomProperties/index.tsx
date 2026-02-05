import { Button, DragAndDropList, Icon } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, useMemo } from "react";

import { ContentWrapper, Label } from "../../shared/SharedComponent";
import { CustomPropertyProps } from "../../SketchLayerCreator/type";

import CustomPropertyItem from "./CustomPropertyItem";
import useHooks from "./hooks";

const CUSTOM_PROPERTIES_DRAG_HANDLE_CLASS_NAME =
  "reearth-visualizer-editor-custom-properties-drag-handle";

const SketchCustomProperties: FC<CustomPropertyProps> = ({
  customProperties,
  propertiesList,
  warning,
  setPropertiesList,
  setCustomProperties,
  setWarning
}) => {
  const t = useT();

  const {
    editTitleIndex,
    editTypeIndex,
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
    setWarning
  });

  const DraggableCustomPropertyItems = useMemo(
    () =>
      propertiesList?.map((item, idx) => ({
        id: item.id,
        content: (
          <CustomPropertyItem
            key={item.id}
            isEditTitle={editTitleIndex === idx}
            isEditType={editTypeIndex === idx}
            customPropertyItem={item}
            handleClassName={CUSTOM_PROPERTIES_DRAG_HANDLE_CLASS_NAME}
            onBlur={handleTitleBlur(idx)}
            onDoubleClick={(field: string) => handleDoubleClick(idx, field)}
            onTypeChange={handleTypeChange(idx)}
            onCustomPropertyDelete={() => handleCustomPropertyDelete(idx)}
            data-testid={`custom-property-item-${item.id}`}
          />
        )
      })),
    [
      propertiesList,
      editTitleIndex,
      editTypeIndex,
      handleTitleBlur,
      handleDoubleClick,
      handleTypeChange,
      handleCustomPropertyDelete
    ]
  );

  return (
    <ContentWrapper data-testid="sketch-custom-properties-wrapper">
      <PropertyTable data-testid="property-table">
        <Label data-testid="custom-property-schema-label">
          {t("Custom property schema")}
        </Label>
        <PropertyTableRow data-testid="property-table-header">
          <ActionCol />
          <PropertyHeaderCol>
            <Title data-testid="title-header">{t("Title")}</Title>
          </PropertyHeaderCol>
          <PropertyHeaderCol>
            <Title data-testid="type-header">{t("Type")}</Title>
          </PropertyHeaderCol>
          <ActionCol />
        </PropertyTableRow>
        <PropertyTableBody data-testid="property-table-body">
          {propertiesList && propertiesList.length > 0 && (
            <DragAndDropList
              items={DraggableCustomPropertyItems}
              onMoveStart={handleMoveStart}
              onMoveEnd={handleMoveEnd}
              handleClassName={CUSTOM_PROPERTIES_DRAG_HANDLE_CLASS_NAME}
              data-testid="custom-properties-drag-drop-list"
            />
          )}
        </PropertyTableBody>
        {warning && (
          <Warning data-testid="property-warning">
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
          data-testid="new-property-button"
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
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.small,
  width: "100%"
}));

const PropertyTableBody = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.normal,
  maxHeight: "260px",
  overflowY: css.overflow.auto
}));

const PropertyTableRow = styled("div")(({ theme }) => ({
  display: css.display.flex,
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
  display: css.display.flex,
  gap: theme.spacing.small,
  paddingTop: theme.spacing.small,
  color: theme.dangerous.main,
  alignItems: css.alignItems.center,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  padding: `${theme.spacing.smallest}px 0`
}));

export default SketchCustomProperties;
