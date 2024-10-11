import defaultBetaProjectImage from "@reearth/beta/components/Icon/Icons/defaultBetaProjectImage.png";
import { IMAGE_TYPES } from "@reearth/beta/features/AssetsManager/constants";
import ProjectDeleteModal from "@reearth/beta/features/Dashboard/ContentsContainer/Projects/ProjectDeleteModal";
import { Collapse, Button, Typography } from "@reearth/beta/lib/reearth-ui";
import { InputField, AssetField, TextareaField } from "@reearth/beta/ui/fields";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { useCallback, useState, FC } from "react";

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

  const handleDeleteModelOpen = useCallback(() => {
    setDeleteModelVisible(true);
  }, []);

  const handleDeleteModelClose = useCallback(() => {
    setDeleteModelVisible(false);
  }, []);

  return project ? (
    <InnerPage>
      <SettingsWrapper>
        {project.isArchived ? (
          <ArchivedSettingNotice />
        ) : (
          <Collapse size="large" title={t("Project Info")}>
            <SettingsFields>
              <InputField
                title={t("Project Name")}
                value={project.name}
                onChange={(name) => setLocalName(name)}
              />
              <TextareaField
                title={t("Description")}
                value={localDescription}
                resizable="height"
                onChange={setLocalDescription}
              />
              <SettingsRow>
                <SettingsRowItem>
                  <AssetField
                    title={t("Thumbnail")}
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
                  onClick={handleDeleteModelOpen}
                />
              </ButtonWrapper>
            </DangerItem>
          </SettingsFields>
        </Collapse>
      </SettingsWrapper>
      {deleteModelVisible && (
        <ProjectDeleteModal
          isVisible={deleteModelVisible}
          onClose={handleDeleteModelClose}
          onProjectDelete={onDeleteProject}
        />
      )}
    </InnerPage>
  ) : null;
};

export default GeneralSettings;

const DangerItem = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.large
}));
