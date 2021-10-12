import { useFormik } from "formik";
import React, { useState, useCallback } from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import Divider from "@reearth/components/atoms/Divider";
import Loading from "@reearth/components/atoms/Loading";
import Modal from "@reearth/components/atoms/Modal";
import Text from "@reearth/components/atoms/Text";
import AssetModal from "@reearth/components/molecules/Common/AssetModal";
import { Asset } from "@reearth/components/molecules/Common/AssetModal/AssetContainer";
import defaultProjectImage from "@reearth/components/molecules/Dashboard/defaultProjectImage.jpg";
import { styled, useTheme } from "@reearth/theme";
import fonts from "@reearth/theme/fonts";

export interface FormValues {
  name: string;
  description: string;
  imageUrl: string;
}

export interface Props {
  open?: boolean;
  onClose?: (refetch?: boolean) => void;
  onSubmit?: (values: FormValues) => Promise<void> | void;
  assets?: Asset[];
  createAssets?: (files: FileList) => Promise<void>;
}

const initialValues: FormValues = {
  name: "",
  description: "",
  imageUrl: "",
};

const ProjectCreationModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  assets,
  createAssets,
}) => {
  const intl = useIntl();
  const [openAssets, setOpenAssets] = useState(false);
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

  const handleSelect = useCallback(
    (value: string | null) => {
      formik.setFieldValue("imageUrl", value);
    },
    [formik],
  );

  const handleCreate = useCallback(async () => {
    await formik.submitForm();
    handleClose();
  }, [formik, handleClose]);

  const theme = useTheme();

  return (
    <Modal
      title={intl.formatMessage({ defaultMessage: "Create New Project" })}
      isVisible={open}
      onClose={handleClose}
      button1={
        <Button
          large
          buttonType="primary"
          text={intl.formatMessage({ defaultMessage: "Create" })}
          disabled={!formik.values.name}
          onClick={handleCreate}
        />
      }
      button2={
        <Button
          large
          buttonType="secondary"
          text={intl.formatMessage({ defaultMessage: "Cancel" })}
          onClick={handleClose}
        />
      }>
      {formik.isSubmitting && <Loading overlay />}
      <Divider margin="20px" />
      <NewProjectForm onSubmit={formik.handleSubmit}>
        <FormInputWrapper>
          <Text size="s" color={theme.main.text} otherProperties={{ margin: "14px 0" }}>
            {intl.formatMessage({ defaultMessage: "Project Name" })}
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
          <Text size="s" color={theme.main.text} otherProperties={{ margin: "14px 0" }}>
            {intl.formatMessage({ defaultMessage: "Description" })}
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
          <Text size="s" color={theme.main.text} otherProperties={{ margin: "14px 0" }}>
            {intl.formatMessage({ defaultMessage: "Select thumbnail image" })}
          </Text>
          <Thumbnail url={formik.values.imageUrl} onClick={() => setOpenAssets(true)} />
        </FormInputWrapper>
      </NewProjectForm>
      <AssetModal
        isOpen={openAssets}
        onClose={() => setOpenAssets(false)}
        assets={assets}
        fileType="image"
        onCreateAsset={createAssets}
        onSelect={handleSelect}
      />
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
  color: ${props => props.theme.main.text};
  background: ${props => props.theme.main.deepBg};
  border: 1px solid #3f3d45;
  font-size: ${fonts.sizes.s}px;
  outline: none;
  cursor: text;
  padding: 5px;
`;

const StyledTextArea = styled.textarea`
  width: calc(100% - 12px);
  resize: none;
  color: ${props => props.theme.main.text};
  background: ${props => props.theme.main.deepBg};
  border: 1px solid #3f3d45;
  font-size: ${fonts.sizes.s}px;
  outline: none;
  cursor: text;
  padding: 5px;
`;

const Thumbnail = styled.div<{ url: string }>`
  background-image: ${props => (props.url ? `url(${props.url})` : `url(${defaultProjectImage})`)};
  background-size: cover;
  background-position: center;
  height: 242px;
  margin: 0 auto;
  width: 100%;
  cursor: pointer;
`;

export default ProjectCreationModal;
