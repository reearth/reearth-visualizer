import { Button, IconName } from "@reearth/app/lib/reearth-ui";
import ConfirmModal from "@reearth/app/ui/components/ConfirmModal";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import { CustomPropertyProp } from "../../../../SketchLayerCreator/type";

import CustomPropertyFieldItem from "./CustomPropertyFieldItem";
import CustomPropertyFieldModal from "./CustomPropertyFieldModal";
import useHooks from "./hooks";

type Props = {
  layerId?: string;
  customPropertySchema?: CustomPropertyProp;
};

export const getIcon = (value: string): IconName => {
  const cleanedValue = value.replace(/_\d+$/, ""); // Remove _Number suffix
  const iconMap: Record<string, IconName> = {
    TextArea: "textarea",
    Text: "textT",
    URL: "linkSimpleHorizontal",
    Asset: "file",
    Float: "float",
    Int: "numberNine",
    Boolean: "toggleLeft"
  };

  return iconMap[cleanedValue] || "file";
};

const CustomPropertiesSchema: FC<Props> = ({
  layerId,
  customPropertySchema
}) => {
  const t = useT();
  const {
    sortedValues,
    selectedField,
    isEmpty,
    isEditField,
    customPropertySchemaShown,
    schemaJSON,
    openCustomPropertySchema,
    closeCustomPropertySchema,
    showDeleteFieldConfirmModal,
    closeDeleteFieldConfirmModal,
    handleAppyDelete,
    handleDeleteField,
    handleEditField,
    handleSubmit,
    setSchemaJSON
  } = useHooks(layerId, customPropertySchema);

  return (
    <Wrapper>
      {isEmpty ? (
        <EmptyMessage>{t("No field has been created yet")}</EmptyMessage>
      ) : (
        <CustomPropertyFieldItemWrapper>
          {sortedValues?.map(({ key, value }) => (
            <CustomPropertyFieldItem
              key={key}
              data-testid={`custom-property-field-${key}`}
              title={key}
              icon={getIcon(value)}
              openCustomPropertySchema={() => handleEditField(key, value)}
              onDeleteField={handleDeleteField}
            />
          ))}
        </CustomPropertyFieldItemWrapper>
      )}
      <ButtonWrapper>
        <Button
          icon="plus"
          title={t("New Field")}
          size="small"
          onClick={openCustomPropertySchema}
        />
      </ButtonWrapper>
      {customPropertySchemaShown && (
        <CustomPropertyFieldModal
          selectedField={selectedField}
          schemaJSON={schemaJSON}
          isEditField={isEditField}
          onClose={closeCustomPropertySchema}
          onSubmit={handleSubmit}
          onSchemaJSONUpdate={setSchemaJSON}
        />
      )}
      {showDeleteFieldConfirmModal && (
        <ConfirmModal
          visible={true}
          title={t("Delete schema property field?")}
          description={t(
            "This action will apply to all features in the current layer. Do you want to proceed?"
          )}
          actions={
            <>
              <Button
                size="normal"
                title={t("Cancel")}
                onClick={closeDeleteFieldConfirmModal}
              />
              <Button
                size="normal"
                title={t("Apply")}
                appearance="primary"
                onClick={handleAppyDelete}
              />
            </>
          }
        />
      )}
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small
}));

const CustomPropertyFieldItemWrapper = styled("div")(({ theme }) => ({
  minHeight: "80px",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small
}));

const EmptyMessage = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.content.weak,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  minHeight: "80px"
}));

const ButtonWrapper = styled("div")(() => ({
  display: "flex",
  justifyContent: "flex-end"
}));

export default CustomPropertiesSchema;
