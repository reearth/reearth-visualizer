import {
  Collapse,
  TextInput,
  Typography,
  Icon,
  Button,
  Modal,
  ModalPanel
} from "@reearth/beta/lib/reearth-ui";
import { InputField } from "@reearth/beta/ui/fields";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useState } from "react";

import {
  InnerPage,
  SettingsWrapper,
  SettingsFields,
  ButtonWrapper
} from "../common";

type Props = {
  informationData: { name?: string; email?: string };
};

const WorkspaceSetting: FC<Props> = ({ informationData }) => {
  const t = useT();
  const theme = useTheme();
  const [changePasswordModal, setChangePasswordModal] =
    useState<boolean>(false);

  return (
    <InnerPage>
      <SettingsWrapper>
        <Collapse size="large" title={t("Account")}>
          <SettingsFields>
            <InputField
              title={t("Name")}
              value={informationData.name ? t(informationData.name) : ""}
            />
            <ButtonWrapper>
              <Button
                title={t("Submit")}
                appearance="primary"
                onClick={() => {}}
              />
            </ButtonWrapper>
          </SettingsFields>
        </Collapse>
        <Collapse size="large" title={t("Danger Zone")}>
          <SettingsFields>
            <DangerItem>
              <Typography size="body" weight="bold">
                {t("Remove this workspace")}
              </Typography>
              <Typography size="body">
                {t("This process will remove this wprkspace")}
              </Typography>
              <ButtonWrapper>
                <Button
                  title={t("Remove workspace")}
                  appearance="dangerous"
                  onClick={() => {}}
                />
              </ButtonWrapper>
            </DangerItem>
          </SettingsFields>
        </Collapse>
      </SettingsWrapper>

      <Modal visible={false} size="small">
        <ModalPanel
          title={t("Delete workspace")}
          onCancel={() => {}}
          actions={[
            <Button
              key="cancel"
              title={t("Cancel")}
              appearance="secondary"
              onClick={() => {}}
            />,
            <Button
              key="delete"
              title={t("I am sure I want to delete this project.")}
              appearance="dangerous"
              disabled={false}
              onClick={() => {}}
            />
          ]}
        >
          <ModalContentWrapper>
            <Typography size="body" weight="bold">
              {/* {project?.name} */}workspace name
            </Typography>
            <Typography size="body">
              {t("This action cannot be undone. ")}
            </Typography>
            <Typography size="body">
              {t(
                "This will permanently delete the workspace and all related projects, assets and datasets for all team members."
              )}
            </Typography>
            <Typography size="body">
              {t("Please type your project name to continue.")}
            </Typography>
            <TextInput onChange={() => {}} />
          </ModalContentWrapper>
        </ModalPanel>
      </Modal>
      <Modal visible={false} size="small">
        <ModalContentWrapper>
          <Icon icon="warning" size="large" color={theme.warning.main} />
          <Typography size="body">
            {t("Custom Domain will be removed.")}
          </Typography>
          <Typography size="body">
            {t(
              "Are you sure you want to remove this custom domain? If removed by accident, you will have to add the details again and the verification time will start over."
            )}
          </Typography>
          <ButtonnWrapper>
            <Button
              key="cancel"
              title={t("Cancel")}
              appearance="secondary"
              onClick={() => {}}
            />
            <Button
              key="delete"
              title={t("Remove")}
              appearance="dangerous"
              disabled={false}
              onClick={() => {}}
            />
          </ButtonnWrapper>
        </ModalContentWrapper>
      </Modal>
    </InnerPage>
  );
};

const DangerItem = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.large
}));

const ModalContentWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.large,
  padding: theme.spacing.large,
  background: theme.bg[1]
}));

const ButtonnWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  gap: theme.spacing.large,
  background: theme.bg[1]
}));
export default WorkspaceSetting;
