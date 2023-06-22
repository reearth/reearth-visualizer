import { useFormik } from "formik";
import React, { useCallback } from "react";

import Button from "@reearth/classic/components/atoms/Button";
import Loading from "@reearth/classic/components/atoms/Loading";
import Modal from "@reearth/classic/components/atoms/Modal";
import Text from "@reearth/classic/components/atoms/Text";
import fonts from "@reearth/classic/theme/reearthTheme/common/fonts";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

export interface FormValues {
  name: string;
  // description: string;
}

export interface Props {
  open?: boolean;
  onClose?: (refetch?: boolean) => void;
  onSubmit?: (values: FormValues) => Promise<void> | void;
}

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
          large
          buttonType="primary"
          text={t("Create")}
          disabled={!formik.values.name}
          onClick={formik.submitForm}
        />
      }
      button2={<Button large buttonType="secondary" text={t("Cancel")} onClick={handleClose} />}>
      {formik.isSubmitting && <Loading overlay />}
      <NewProjectForm onSubmit={formik.handleSubmit}>
        <FormInputWrapper>
          <Text
            size="s"
            color={theme.classic.main.text}
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
  margin: 40px auto;
`;

const StyledInput = styled.input`
  flex: 2;
  color: ${props => props.theme.classic.main.text};
  background: ${props => props.theme.classic.main.deepBg};
  border: 1px solid #3f3d45;
  font-size: ${fonts.sizes.s}px;
  outline: none;
  cursor: text;
  padding: 0 10px;
`;

export default WorkspaceCreationModal;
