import { IMAGE_TYPES } from "@reearth/app/features/AssetsManager/constants";
import ProjectRemoveModal from "@reearth/app/features/Dashboard/ContentsContainer/Projects/ProjectRemoveModal";
import ProjectVisibilityModal from "@reearth/app/features/ProjectSettings/innerPages/GeneralSettings/ProjectVisibilityModal";
import { Button, Icon, Typography } from "@reearth/app/lib/reearth-ui";
import defaultProjectBackgroundImage from "@reearth/app/ui/assets/defaultProjectBackgroundImage.webp";
import { InputField, AssetField, TextareaField } from "@reearth/app/ui/fields";
import { useValidateProjectAlias } from "@reearth/services/api/project";
import { appFeature } from "@reearth/services/config/appFeatureConfig";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme, keyframes } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { debounce } from "lodash-es";
import { useCallback, useState, FC, useMemo, useEffect } from "react";

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
  workspaceId: string;
  onUpdateProject: (settings: GeneralSettingsType) => void;
  onProjectRemove: () => void;
};

type AliasStatus = "idle" | "loading" | "success" | "error";

const GeneralSettings: FC<Props> = ({
  project,
  disabled,
  workspaceId,
  onUpdateProject,
  onProjectRemove
}) => {
  const t = useT();
  const theme = useTheme();

  const { projectVisibility } = appFeature();
  const { validateProjectAlias } = useValidateProjectAlias();
  const [warning, setWarning] = useState<string>("");
  const [localAlias, setLocalAlias] = useState(project?.projectAlias ?? "");
  const [aliasValidating, setAliasValidating] = useState(false);
  const [aliasValid, setAliasValid] = useState(false);

  useEffect(() => {
    setLocalAlias(project?.projectAlias ?? "");
    setAliasValidating(false);
    setAliasValid(false);
    setWarning("");
  }, [project?.projectAlias]);

  const handleNameUpdate = useCallback(
    (name: string) => {
      if (!project) return;
      onUpdateProject({
        name
      });
    },
    [project, onUpdateProject]
  );

  const handleProjectAliasValidation = useCallback(
    async (projectAlias: string) => {
      if (!project) return;
      const trimmedAlias = projectAlias.trim();
      if (project.projectAlias === trimmedAlias) {
        setWarning("");
        setAliasValidating(false);
        setAliasValid(false);
        return;
      }

      const result = await validateProjectAlias?.(
        trimmedAlias,
        workspaceId,
        project.id
      );
      const errorDescription = result?.errors?.find(
        (e) => e?.extensions?.description
      )?.extensions?.description;

      setAliasValidating(false);

      if (result?.available) {
        setAliasValid(true);
        setWarning("");
      } else {
        setAliasValid(false);
        setWarning(errorDescription as string ?? "");
      }
    },
    [project, validateProjectAlias, workspaceId]
  );

  const debouncedHandleProjectAliasValidation = useMemo(
    () => debounce((alias: string) => handleProjectAliasValidation(alias), 500),
    [handleProjectAliasValidation]
  );

  useEffect(() => {
    return () => debouncedHandleProjectAliasValidation.cancel();
  }, [debouncedHandleProjectAliasValidation]);

  const handleAliasChange = useCallback(
    (value: string) => {
      setLocalAlias(value);
      if (value.trim() && value.trim() !== project?.projectAlias) {
        setAliasValidating(true);
        setAliasValid(false);
        setWarning("");
      } else {
        setAliasValidating(false);
        setAliasValid(false);
        setWarning("");
      }
      debouncedHandleProjectAliasValidation(value);
    },
    [project?.projectAlias, debouncedHandleProjectAliasValidation]
  );

  const handleProjectAliasUpdate = useCallback(
    (projectAlias: string) => {
      const trimmedAlias = projectAlias.trim();
      if (!project || project.projectAlias === trimmedAlias || warning) return;
      onUpdateProject({ projectAlias: trimmedAlias });
    },
    [project, warning, onUpdateProject]
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

  const aliasStatus: AliasStatus = useMemo(() => {
    if (!localAlias?.trim() || localAlias === project?.projectAlias)
      return "idle";
    if (aliasValidating) return "loading";
    if (aliasValid) return "success";
    if (warning) return "error";
    return "idle";
  }, [localAlias, project?.projectAlias, aliasValidating, aliasValid, warning]);

  const aliasStatusIcon = useMemo(() => {
    if (aliasStatus === "loading") return <Spinner />;
    if (aliasStatus === "success")
      return <Icon icon="check" size={14} color={theme.success.main} />;
    if (aliasStatus === "error")
      return <Icon icon="close" size={14} color={theme.dangerous.main} />;
    return null;
  }, [aliasStatus, theme]);

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
            <AliasInputWrapper $status={aliasStatus}>
              <InputField
                title={t("Project Alias *")}
                value={project.projectAlias}
                onChange={handleAliasChange}
                onChangeComplete={handleProjectAliasUpdate}
                data-testid="project-alias-input"
                actions={aliasStatusIcon ? [aliasStatusIcon] : undefined}
                description={
                  warning ? (
                    <Typography size="footnote" color={theme.dangerous.main}>
                      {warning}
                    </Typography>
                  ) : (
                    `${t("Only letters, numbers, and hyphens are allowed. Example: https://reearth.io/team-alias/")}${localAlias || "project-alias"}`
                  )
                }
              />
            </AliasInputWrapper>
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
          workspaceId={workspaceId}
          visibility={project.visibility || "public"}
          onProjectVisibilityChange={handleProjectVisibiltyUpdate}
          onClose={handleProjectVisibilityModal}
        />
      )}
    </InnerPage>
  ) : null;
};

export default GeneralSettings;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Spinner = styled("div")(({ theme }) => ({
  width: 14,
  height: 14,
  borderRadius: "50%",
  border: `2px solid ${theme.outline.weak}`,
  borderTopColor: theme.content.main,
  animation: `${spin} 0.7s linear infinite`,
  flexShrink: 0
}));

const AliasInputWrapper = styled("div", {
  shouldForwardProp: (prop) => prop !== "$status"
})<{ $status: AliasStatus }>(({ theme, $status }) => ({
  "[data-commonfield-input-slot] > div": {
    ...($status === "error" && {
      border: `1px solid ${theme.dangerous.main}`
    })
  }
}));

const DangerItem = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.large
}));

const DescriptionWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.smallest
}));

const ListWrapper = styled("ul")(({ theme }) => ({
  listStyleType: "disc",
  paddingLeft: theme.spacing.super
}));
