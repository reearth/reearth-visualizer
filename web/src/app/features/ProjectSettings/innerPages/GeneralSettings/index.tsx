import { IMAGE_TYPES } from "@reearth/app/features/AssetsManager/constants";
import ProjectRemoveModal from "@reearth/app/features/Dashboard/ContentsContainer/Projects/ProjectRemoveModal";
import { Button, Typography } from "@reearth/app/lib/reearth-ui";
import defaultProjectBackgroundImage from "@reearth/app/ui/assets/defaultProjectBackgroundImage.webp";
import { InputField, AssetField, TextareaField } from "@reearth/app/ui/fields";
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
  Thumbnail,
  TitleWrapper
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
  disabled?: boolean;
  onUpdateProject: (settings: GeneralSettingsType) => void;
  onProjectRemove: () => void;
};

const GeneralSettings: FC<Props> = ({
  project,
  disabled,
  onUpdateProject,
  onProjectRemove
}) => {
  const t = useT();

  const handleNameUpdate = useCallback(
    (name: string) => {
      if (!project) return;
      onUpdateProject({
        name
      });
    },
    [project, onUpdateProject]
  );

  const handleDescriptionUpdate = useCallback(
    (description: string) => {
      if (!project) return;
      onUpdateProject({
        description
      });
    },
    [project, onUpdateProject]
  );

  const handleImageUpdate = useCallback(
    (imageUrl?: string) => {
      if (!project) return;
      onUpdateProject({
        imageUrl
      });
    },
    [project, onUpdateProject]
  );

  const [projectRemoveModalVisible, setProjectRemoveModalVisible] =
    useState(false);

  const handleProjectRemoveModal = useCallback((value: boolean) => {
    setProjectRemoveModalVisible(value);
  }, []);

  return project ? (
    <InnerPage wide>
      <SettingsWrapper>
        {project.isArchived ? (
          <ArchivedSettingNotice />
        ) : (
          <SettingsFields>
            <TitleWrapper
              size="body"
              weight="bold"
              data-testid="general-settings-title"
            >
              {t("Basic settings")}
            </TitleWrapper>
            <InputField
              title={t("Project Name")}
              value={project.name}
              onChangeComplete={handleNameUpdate}
              data-testid="project-name-input"
            />
            <TextareaField
              title={t("Description")}
              value={project.description}
              resizable="height"
              onChangeComplete={handleDescriptionUpdate}
              data-testid="project-description-input"
            />
            <SettingsRow>
              <SettingsRowItem>
                <AssetField
                  title={t("Thumbnail")}
                  inputMethod="asset"
                  assetsTypes={IMAGE_TYPES}
                  value={project.imageUrl || ""}
                  onChange={handleImageUpdate}
                  data-testid="project-thumbnail-assetfield"
                />
              </SettingsRowItem>
              <SettingsRowItem>
                <Thumbnail
                  src={project.imageUrl || defaultProjectBackgroundImage}
                  data-testid="project-thumbnail-image"
                />
              </SettingsRowItem>
            </SettingsRow>
          </SettingsFields>
        )}
        <SettingsFields>
          <TitleWrapper
            size="body"
            weight="bold"
            data-testid="danger-zone-title"
          >
            {t("Danger Zone")}
          </TitleWrapper>

          <DangerItem data-testid="danger-zone-item">
            <Typography
              size="body"
              weight="bold"
              data-testid="remove-project-title"
            >
              {t("Remove this project")}
            </Typography>
            <Typography size="body" data-testid="remove-project-description">
              {t("This process will move this project to Recycle bin.")}
            </Typography>
            <ButtonWrapper>
              <Button
                title={t("Move to Recycle Bin")}
                appearance="dangerous"
                onClick={() => handleProjectRemoveModal(true)}
                data-testid="move-to-recycle-bin-button"
              />
            </ButtonWrapper>
          </DangerItem>
        </SettingsFields>
      </SettingsWrapper>
      {projectRemoveModalVisible && (
        <ProjectRemoveModal
          isVisible={projectRemoveModalVisible}
          onClose={() => handleProjectRemoveModal(false)}
          onProjectRemove={onProjectRemove}
          disabled={disabled}
          data-testid="project-remove-modal"
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
