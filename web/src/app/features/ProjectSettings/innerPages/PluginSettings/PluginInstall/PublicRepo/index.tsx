import {
  Button,
  IconName,
  Loading,
  Modal,
  ModalPanel,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { InputField } from "@reearth/app/ui/fields";
import { useT } from "@reearth/services/i18n/hooks";
import { useTheme } from "@reearth/services/theme";
import React from "react";

import PluginInstallCardButton from "../PluginInstallCardButton";

import useHooks from "./hooks";

export type Props = {
  icon: IconName;
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
  loading
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
    handleClose
  } = useHooks(onSend, loading);

  return (
    <>
      <PluginInstallCardButton icon={icon} text={text} onClick={handleOpen} />
      <Modal visible={isOpen}>
        <ModalPanel
          title={t("Import GitHub repository")}
          onCancel={handleClose}
          layout="common"
          actions={[
            <Button
              key="cancel"
              appearance="secondary"
              title={t("Cancel")}
              onClick={handleClose}
            />,
            <Button
              key="continue"
              appearance="primary"
              title={t("Continue")}
              disabled={!repoUrl}
              onClick={handleSubmit}
            />
          ]}
        >
          {loading && <Loading overlay />}
          <InputField
            title={t("Repository url:")}
            value={repoUrl}
            onChange={handleRepoUrlChange}
          />
          {validationErr && (
            <Typography size="body" color={theme.dangerous.main}>
              {validationErr}
            </Typography>
          )}
          {serverSideError && (
            <Typography size="body" color={theme.dangerous.main}>
              {serverSideError}
            </Typography>
          )}
        </ModalPanel>
      </Modal>
    </>
  );
};

export default PublicRepo;
