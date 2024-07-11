import { useFormik } from "formik";
import React, { useCallback, useEffect } from "react";

import Button from "@reearth/classic/components/atoms/Button";
import Divider from "@reearth/classic/components/atoms/Divider";
import defaultBetaProjectImage from "@reearth/classic/components/atoms/Icon/Icons/defaultBetaProjectImage.png";
import defaultProjectImage from "@reearth/classic/components/atoms/Icon/Icons/defaultProjectImage.jpg";
import Loading from "@reearth/classic/components/atoms/Loading";
import Modal from "@reearth/classic/components/atoms/Modal";
import Text from "@reearth/classic/components/atoms/Text";
import fonts from "@reearth/classic/theme/reearthTheme/common/fonts";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { ProjectType } from "@reearth/types";

export interface FormValues {
  name: string;
  description: string;
  imageUrl: string;
  projectType: ProjectType;
}

export interface Props {
  open?: boolean;
  projectType?: ProjectType;
  onClose?: (refetch?: boolean) => void;
  onSubmit?: (values: FormValues) => Promise<void> | void;
  selectedAsset?: string;
  assetModal?: React.ReactNode;
  toggleAssetModal?: () => void;
}

const initialValues: FormValues = {
  name: "",
  description: "",
  imageUrl: "",
  projectType: "classic",
};

const ProjectCreationModal: React.FC<Props> = ({
  open,
  projectType,
  onClose,
  onSubmit,
  selectedAsset,
  assetModal,
  toggleAssetModal,
}) => {
  const t = useT();
  const formik = useFormik({
    initialValues,
    onSubmit: async (data: FormValues, { setStatus, resetForm }) => {
      await onSubmit?.(data);
      onClose?.();
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

  useEffect(() => {
    if (selectedAsset) {
      formik.setFieldValue("imageUrl", selectedAsset);
    }
    if (projectType) {
      formik.setFieldValue("projectType", projectType);
    }
  }, [selectedAsset, projectType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = useCallback(async () => {
    await formik.submitForm();
    handleClose();
  }, [formik, handleClose]);

  const theme = useTheme();

  return (
    <Modal
      title={t("Create New Project")}
      isVisible={open}
      onClose={handleClose}
      button1={
        <Button
          large
          buttonType="primary"
          text={t("Create")}
          disabled={!formik.values.name}
          onClick={handleCreate}
        />
      }
      button2={<Button large buttonType="secondary" text={t("Cancel")} onClick={handleClose} />}>
      {formik.isSubmitting && <Loading overlay />}
      <Divider margin="20px" />
      <NewProjectForm onSubmit={formik.handleSubmit}>
        <FormInputWrapper>
          <Text size="s" color={theme.classic.main.text} otherProperties={{ margin: "14px 0" }}>
            {t("Project Name")}
          </Text>
          <StyledInput
            type="text"
            {...formik.getFieldProps("name")}
            onBlur={e => {
              formik.handleBlur(e);
            }}
          />
        </FormInputWrapper>
        <FormInputWrapper>
          <Text size="s" color={theme.classic.main.text} otherProperties={{ margin: "14px 0" }}>
            {t("Description")}
          </Text>
          <StyledTextArea
            rows={5}
            {...formik.getFieldProps("description")}
            onBlur={e => {
              formik.handleBlur(e);
            }}
          />
        </FormInputWrapper>
        <FormInputWrapper>
          <Text size="s" color={theme.classic.main.text} otherProperties={{ margin: "14px 0" }}>
            {t("Select thumbnail image")}
          </Text>
          <Thumbnail
            url={formik.values.imageUrl}
            projectType={projectType}
            onClick={toggleAssetModal}
          />
        </FormInputWrapper>
      </NewProjectForm>
      {assetModal}
    </Modal>
  );
};

const NewProjectForm = styled.form`
  width: 100%;
`;

const FormInputWrapper = styled.div`
  margin: 15px auto;
`;

const StyledInput = styled.input`
  width: calc(100% - 12px);
  color: ${props => props.theme.classic.main.text};
  background: ${props => props.theme.classic.main.deepBg};
  border: 1px solid #3f3d45;
  font-size: ${fonts.sizes.s}px;
  outline: none;
  cursor: text;
  padding: 5px;
`;

const StyledTextArea = styled.textarea`
  width: calc(100% - 12px);
  resize: none;
  color: ${props => props.theme.classic.main.text};
  background: ${props => props.theme.classic.main.deepBg};
  border: 1px solid #3f3d45;
  font-size: ${fonts.sizes.s}px;
  outline: none;
  cursor: text;
  padding: 5px;
`;

const Thumbnail = styled.div<{ url: string; projectType?: ProjectType }>`
  background-image: ${props =>
    props.url
      ? `url(${props.url})`
      : props.projectType === "beta"
      ? `url(${defaultBetaProjectImage})`
      : `url(${defaultProjectImage})`};
  background-size: cover;
  background-position: center;
  height: 242px;
  margin: 0 auto;
  width: 100%;
  cursor: pointer;
`;

export default ProjectCreationModal;
