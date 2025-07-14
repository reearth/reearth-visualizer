import { IMAGE_TYPES } from "@reearth/app/features/AssetsManager/constants";
import ProjectRemoveModal from "@reearth/app/features/Dashboard/ContentsContainer/Projects/ProjectRemoveModal";
import ProjectVisibilityModal from "@reearth/app/features/Dashboard/ContentsContainer/Projects/ProjectVisibilityModal";
import { Button, Typography } from "@reearth/app/lib/reearth-ui";
import defaultProjectBackgroundImage from "@reearth/app/ui/assets/defaultProjectBackgroundImage.webp";
import { InputField, AssetField, TextareaField } from "@reearth/app/ui/fields";
import { appFeature } from "@reearth/services/config/appFeatureConfig";
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
  projectAlias?: string;
  visibility?: string;
};

type Props = {
  project?: {
    id: string;
    name: string;
    description: string;
    imageUrl?: string | null;
    isArchived: boolean;
    projectAlias: string;
    visibility?: string;
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
  const { projectVisibility } = appFeature();

  const handleNameUpdate = useCallback(
    (name: string) => {
      if (!project) return;
      onUpdateProject({
        name
      });
    },
    [project, onUpdateProject]
  );

  const handleProjectAliasUpdate = useCallback(
    (projectAlias: string) => {
      if (!project) return;
      onUpdateProject({
        projectAlias
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

  const [projectVisibilityModal, setProjectVisibilityModal] = useState(false);

  const handleProjectVisibilityModal = useCallback(() => {
    setProjectVisibilityModal(false);
  }, []);

  const handleProjectVisibiltyUpdate = useCallback(
    (visibility: string) => {
      if (!project) return;
      onUpdateProject({
        visibility
      });
      handleProjectVisibilityModal();
    },
    [handleProjectVisibilityModal, onUpdateProject, project]
  );

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
            <InputField
              title={t("Project alias")}
              value={project.projectAlias}
              onChangeComplete={handleProjectAliasUpdate}
              data-testid="project-alias-input"
              description={t(
                "Used to create the project URL. Only lowercase letters, numbers, and hyphens are allowed. Example: https://reearth.io/team-alias/project-alias"
              )}
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
            {projectVisibility && (
              <>
                <Typography
                  size="body"
                  weight="bold"
                  data-testid="change-project-visibily-title"
                >
                  {t("Change project visibility")}
                </Typography>
                <DescriptionWrapper data-testid="chanage-project-visibility-description">
                  <Typography size="body">
                    {t(
                      "You can choose whether your project is Public or Private."
                    )}
                  </Typography>
                  <ListWrapper>
                    <li>
                      <Typography size="body">
                        {t(
                          "Public projects are visible to everyone and can be discovered by others."
                        )}
                      </Typography>
                    </li>
                    <li>
                      <Typography size="body">
                        {t(
                          "Private projects are only accessible to members of the workspace and are available only for workspaces on a paid plan."
                        )}
                      </Typography>
                    </li>
                  </ListWrapper>
                  <Typography size="body">
                    {t(
                      "This setting helps you control who can view and collaborate on your project. You can change the visibility at any time."
                    )}
                  </Typography>
                </DescriptionWrapper>
                <ButtonWrapper>
                  <Button
                    title={t("Change visibility")}
                    appearance="dangerous"
                    onClick={() => setProjectVisibilityModal(true)}
                    data-testid="move-to-recycle-bin-button"
                  />
                </ButtonWrapper>
              </>
            )}
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
      {projectVisibilityModal && (
        <ProjectVisibilityModal
          visibility={project.visibility || "public"}
          onProjectVisibilityChange={handleProjectVisibiltyUpdate}
          onClose={handleProjectVisibilityModal}
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

const DescriptionWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.smallest
}));

const ListWrapper = styled("ul")(({ theme }) => ({
  listStyleType: "disc",
  paddingLeft: theme.spacing.super
}));
