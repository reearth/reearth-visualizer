import React from "react";

import Box from "@reearth/beta/components/Box";
import Button from "@reearth/beta/components/Button";
import { Icons } from "@reearth/beta/components/Icon";
import Loading from "@reearth/beta/components/Loading";
import Modal from "@reearth/beta/components/Modal";
import Text from "@reearth/beta/components/Text";
import TextBox from "@reearth/beta/components/TextBox";
import { useT } from "@reearth/services/i18n";
import { useTheme } from "@reearth/services/theme";

import PluginInstallCardButton from "../PluginInstallCardButton";

import useHooks from "./hooks";

export type Props = {
  className?: string;
  icon: Icons;
  buttonText: string;
  onSend: (repoUrl: string) => void;
  serverSideError?: string;
  loading?: boolean;
};

const PublicRepo: React.FC<Props> = ({
  className,
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
      <PluginInstallCardButton className={className} icon={icon} text={text} onClick={handleOpen} />
      <Modal
        title={t("Import GitHub repository")}
        isVisible={isOpen}
        onClose={handleClose}
        button1={
          <Button
            large
            buttonType="primary"
            text={t("Continue")}
            disabled={!repoUrl}
            onClick={handleSubmit}
          />
        }
        button2={<Button large buttonType="secondary" text={t("Cancel")} onClick={handleClose} />}>
        {loading && <Loading overlay />}
        <Text size="m" color={theme.classic.main.text}>
          {t("Repository url:")}
        </Text>
        <Box mv="l">
          <TextBox value={repoUrl} doesChangeEveryTime onChange={handleRepoUrlChange} />
        </Box>
        {validationErr && (
          <Text size="2xs" color={theme.classic.main.danger}>
            {validationErr}
          </Text>
        )}
        {serverSideError && (
          <Text size="2xs" color={theme.classic.main.danger}>
            {serverSideError}
          </Text>
        )}
      </Modal>
    </>
  );
};

export default PublicRepo;
