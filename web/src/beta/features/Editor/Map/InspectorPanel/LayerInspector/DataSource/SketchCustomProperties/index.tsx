import { Button } from "@reearth/beta/lib/reearth-ui";
import ConfirmModal from "@reearth/beta/ui/components/ConfirmModal";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import { CustomPropertyProp } from "../../../../SketchLayerCreator/type";

import CustomPropertyFieldItem from "./CustomPropertyFieldItem";
import CustomPropertyFieldModal from "./CustomPropertyFieldModal";
import useHooks, { getIcon } from "./hooks";

type Props = {
  layerId?: string;
  customPropertySchema?: CustomPropertyProp;
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
    openCustomPropertySchema,
    closeCustomPropertySchema,
    showDeleteFieldConfirmModal,
    closeDeleteFieldConfirmModal,
    showEditFieldConfirmModal,
    openEditFieldConfirmModal,
    closeEditFieldConfirmModal,
    handleUpdateCustomPropertySchema,
    handleAppyDelete,
    handleDeleteField,
    handleEditField,
    handleSubmit,
    handleTitleBlur,
    setSchemaJSON
  } = useHooks(layerId, customPropertySchema);

  return (
    <Wrapper>
      {isEmpty ? (
        <EmptyMessage>{t("No field has been created yet")}</EmptyMessage>
      ) : (
        <CustomPropertyFieldItemWrapper>
          {sortedValues?.map(({ key, value }, idx) => (
            <CustomPropertyFieldItem
              key={idx}
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
          isEditField={isEditField}
          onBlur={handleTitleBlur}
          onClose={closeCustomPropertySchema}
          onOpenConfirmModal={openEditFieldConfirmModal}
          onCustomPropertySchemaUpdate={handleUpdateCustomPropertySchema}
          onSchemaJSONUpdate={setSchemaJSON}
        />
      )}
      {(showDeleteFieldConfirmModal || showEditFieldConfirmModal) && (
        <ConfirmModal
          visible={true}
          title={
            showEditFieldConfirmModal
              ? t("Apply Current Edits?")
              : t("Delete schema property filed?")
          }
          description={
            showEditFieldConfirmModal
              ? t(
                  "This save will apply to all features in the current layer. Do you want to proceed?"
                )
              : t(
                  "This action will apply to all features in the current layer. Do you want to proceed?"
                )
          }
          actions={
            <>
              <Button
                size="normal"
                title={t("Cancel")}
                onClick={
                  showEditFieldConfirmModal
                    ? closeEditFieldConfirmModal
                    : closeDeleteFieldConfirmModal
                }
              />
              <Button
                size="normal"
                title={t("Apply")}
                appearance="primary"
                onClick={
                  showEditFieldConfirmModal ? handleSubmit : handleAppyDelete
                }
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
  fontWeight: theme.fonts.weight.bold,
  minHeight: "80px"
}));

const ButtonWrapper = styled("div")(() => ({
  display: "flex",
  justifyContent: "flex-end"
}));

export default CustomPropertiesSchema;
