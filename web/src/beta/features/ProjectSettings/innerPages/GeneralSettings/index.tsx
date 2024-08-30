import defaultBetaProjectImage from "@reearth/beta/components/Icon/Icons/defaultBetaProjectImage.png";
import { IMAGE_TYPES } from "@reearth/beta/features/AssetsManager/constants";
import {
  Collapse,
  TextInput,
  Modal,
  Button,
  ModalPanel,
  Typography
} from "@reearth/beta/lib/reearth-ui";
import { InputField, AssetField, TextareaField } from "@reearth/beta/ui/fields";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { useCallback, useState, useMemo, FC } from "react";

import {
  InnerPage,
  SettingsWrapper,
  SettingsFields,
  ButtonWrapper,
  ArchivedSettingNotice,
  SettingsRow,
  SettingsRowItem,
  Thumbnail
} from "../common";

export type GeneralSettingsType = {
  name?: string;
  description?: string;
  imageUrl?: string;
};

type Props = {
  project?: {
    id: string;
    name: string;
    description: string;
    imageUrl?: string | null;
    isArchived: boolean;
  };
  onUpdateProject: (settings: GeneralSettingsType) => void;
  onDeleteProject: () => void;
};

const GeneralSettings: FC<Props> = ({
  project,
  onUpdateProject,
  onDeleteProject
}) => {
  const t = useT();

  const [localName, setLocalName] = useState(project?.name ?? "");
  const [localDescription, setLocalDescription] = useState(
    project?.description ?? ""
  );
  const [localImageUrl, setLocalImageUrl] = useState<string | undefined>(
    project?.imageUrl ?? ""
  );

  const handleSubmit = useCallback(() => {
    onUpdateProject({
      name: localName,
      description: localDescription,
      imageUrl: localImageUrl
    });
  }, [localName, localDescription, localImageUrl, onUpdateProject]);

  const [deleteModelVisible, setDeleteModelVisible] = useState(false);
  const [deleteInputName, setDeleteInputName] = useState("");
  const deleteDisabled = useMemo(
    () => deleteInputName !== project?.name,
    [deleteInputName, project?.name]
  );

  return project ? (
    <InnerPage>
      <SettingsWrapper>
        {project.isArchived ? (
          <ArchivedSettingNotice />
        ) : (
          <Collapse size="large" title={t("Project Info")}>
            <SettingsFields>
              <InputField
                commonTitle={t("Project Name")}
                value={project.name}
                onChange={(name) => setLocalName(name)}
              />
              <TextareaField
                commonTitle={t("Description")}
                value={localDescription}
                onChange={setLocalDescription}
              />
              <SettingsRow>
                <SettingsRowItem>
                  <AssetField
                    commonTitle={t("Thumbnail")}
                    inputMethod="asset"
                    assetsTypes={IMAGE_TYPES}
                    value={localImageUrl}
                    onChange={setLocalImageUrl}
                  />
                </SettingsRowItem>
                <SettingsRowItem>
                  <Thumbnail src={localImageUrl || defaultBetaProjectImage} />
                </SettingsRowItem>
              </SettingsRow>
              <ButtonWrapper>
                <Button
                  title={t("Submit")}
                  appearance="primary"
                  onClick={handleSubmit}
                />
              </ButtonWrapper>
            </SettingsFields>
          </Collapse>
        )}
        <Collapse size="large" title={t("Danger Zone")}>
          <SettingsFields>
            <DangerItem>
              <Typography size="body" weight="bold">
                {t("Delete this project")}
              </Typography>
              <Typography size="body">
                {t("This process will remove this project to recycle bin.")}
              </Typography>
              <ButtonWrapper>
                <Button
                  title={t("Delete project")}
                  appearance="dangerous"
                  onClick={() => setDeleteModelVisible(true)}
                />
              </ButtonWrapper>
            </DangerItem>
          </SettingsFields>
        </Collapse>
      </SettingsWrapper>

      <Modal visible={deleteModelVisible} size="small">
        <ModalPanel
          title={t("Delete project")}
          onCancel={() => setDeleteModelVisible(false)}
          actions={[
            <Button
              key="cancel"
              title={t("Cancel")}
              appearance="secondary"
              onClick={() => {
                setDeleteModelVisible(false);
              }}
            />,
            <Button
              key="delete"
              title={t("I am sure I want to delete this project.")}
              appearance="dangerous"
              disabled={deleteDisabled}
              onClick={onDeleteProject}
            />
          ]}
        >
          <ModalContentWrapper>
            <Typography size="body" weight="bold">
              {project?.name}
            </Typography>
            <Typography size="body">
              {t(
                "This process will remove this project to Recycle bin. If the project was published, this also means websites and domains referencing the project will not be able to access it anymore."
              )}
            </Typography>
            <Divider />
            <Typography size="body">
              {t("Please type your project name to continue.")}
            </Typography>
            <TextInput onChange={(name) => setDeleteInputName(name)} />
          </ModalContentWrapper>
        </ModalPanel>
      </Modal>
    </InnerPage>
  ) : null;
};

export default GeneralSettings;

const ModalContentWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.large,
  padding: theme.spacing.large,
  background: theme.bg[1]
}));

const DangerItem = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.large
}));

const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.outline.weaker};
`;
