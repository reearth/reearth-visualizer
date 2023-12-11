import { useFormik } from "formik";
import React, { useCallback } from "react";

import Button from "@reearth/beta/components/Button";
import Loading from "@reearth/beta/components/Loading";
import Modal from "@reearth/beta/components/Modal";
import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import fonts from "@reearth/services/theme/reearthTheme/common/fonts";

export interface FormValues {
  name: string;
  // description: string;
}

export type Props = {
  open?: boolean;
  onClose?: (refetch?: boolean) => void;
  onSubmit?: (values: FormValues) => Promise<void> | void;
};

const initialValues: FormValues = {
  name: "",
  // description: "",
};

const WorkspaceCreationModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const t = useT();
  const formik = useFormik({
    initialValues,
    onSubmit: async (data: FormValues, { setStatus, resetForm }) => {
      await onSubmit?.(data);
      onClose?.(true);
      resetForm({});
      setStatus({ success: true });
    },
  });

  const handleClose = useCallback(() => {
    if (!formik.isSubmitting) {
      onClose?.();
      formik.resetForm();
    }
  }, [formik, onClose]);

  const theme = useTheme();

  return (
    <Modal
      title={t("Create New Workspace")}
      isVisible={open}
      onClose={handleClose}
      button1={
        <Button
          size="medium"
          buttonType="primary"
          text={t("Create")}
          disabled={!formik.values.name}
          onClick={formik.submitForm}
        />
      }
      button2={
        <Button size="medium" buttonType="secondary" text={t("Cancel")} onClick={handleClose} />
      }>
      {formik.isSubmitting && <Loading overlay />}
      <NewProjectForm onSubmit={formik.handleSubmit}>
        <FormInputWrapper>
          <Text
            size="body"
            color={theme.content.main}
            otherProperties={{ flex: 1, margin: "1em 0" }}>
            {t("Workspace Name")}
          </Text>
          <StyledInput
            type="text"
            {...formik.getFieldProps("name")}
            onBlur={e => {
              formik.handleBlur(e);
            }}
          />
        </FormInputWrapper>
      </NewProjectForm>
    </Modal>
  );
};

const NewProjectForm = styled.form`
  width: 100%;
`;

const FormInputWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  margin: 30px auto;
`;

const StyledInput = styled.input`
  flex: 2;
  color: ${({ theme }) => theme.content.main};
  background: ${({ theme }) => theme.bg[0]};
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.bg[4]};
  font-size: ${fonts.sizes.body}px;
  cursor: text;
  padding: 4px 8px;
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.25) inset;
`;

export default WorkspaceCreationModal;
