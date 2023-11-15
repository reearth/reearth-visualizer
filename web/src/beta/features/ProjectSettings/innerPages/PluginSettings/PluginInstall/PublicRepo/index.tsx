import React from "react";

import Button from "@reearth/beta/components/Button";
import TextInput from "@reearth/beta/components/fields/TextField";
import { Icons } from "@reearth/beta/components/Icon";
import Loading from "@reearth/beta/components/Loading";
import Modal from "@reearth/beta/components/Modal";
import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";
import { useTheme } from "@reearth/services/theme";

import PluginInstallCardButton from "../PluginInstallCardButton";

import useHooks from "./hooks";

export type Props = {
  icon: Icons;
  buttonText: string;
  onSend: (repoUrl: string) => void;
  serverSideError?: string;
  loading?: boolean;
};

const PublicRepo: React.FC<Props> = ({
  icon,
  buttonText: text,
  onSend,
  serverSideError,
  loading,
}) => {
  const t = useT();
  const theme = useTheme();
  const {
    isOpen,
    validationErr,
    repoUrl,
    handleRepoUrlChange,
    handleOpen,
    handleSubmit,
    handleClose,
  } = useHooks(onSend, loading);

  return (
    <>
      <PluginInstallCardButton icon={icon} text={text} onClick={handleOpen} />
      <Modal
        title={t("Import GitHub repository")}
        isVisible={isOpen}
        onClose={handleClose}
        button1={<Button buttonType="secondary" text={t("Cancel")} onClick={handleClose} />}
        button2={
          <Button
            buttonType="primary"
            text={t("Continue")}
            disabled={!repoUrl}
            onClick={handleSubmit}
          />
        }>
        {loading && <Loading overlay />}
        <TextInput name={t("Repository url:")} value={repoUrl} onChange={handleRepoUrlChange} />
        {validationErr && (
          <Text size="body" color={theme.dangerous.main}>
            {validationErr}
          </Text>
        )}
        {serverSideError && (
          <Text size="body" color={theme.dangerous.main}>
            {serverSideError}
          </Text>
        )}
      </Modal>
    </>
  );
};

export default PublicRepo;
