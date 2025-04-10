import { IMAGE_TYPES } from "@reearth/beta/features/AssetsManager/constants";
import ProjectRemoveModal from "@reearth/beta/features/Dashboard/ContentsContainer/Projects/ProjectRemoveModal";
import { Button, Typography } from "@reearth/beta/lib/reearth-ui";
import defaultProjectBackgroundImage from "@reearth/beta/ui/assets/defaultProjectBackgroundImage.webp";
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

  const [localName, setLocalName] = useState(project?.name ?? "");
  const [localDescription, setLocalDescription] = useState(
    project?.description ?? ""
  );
  const [localImageUrl, setLocalImageUrl] = useState<string | undefined>(
    project?.imageUrl ?? ""
  );

  const handleSubmit = useCallback(
    (imageUrl?: string) => {
      onUpdateProject({
        name: localName,
        description: localDescription,
        imageUrl
      });
    },
    [localName, localDescription, onUpdateProject]
  );

  const [projectRemoveModalVisible, setProjectRemoveModalVisible] =
    useState(false);

  const handleProjectRemoveModal = useCallback((value: boolean) => {
    setProjectRemoveModalVisible(value);
  }, []);

  const handleImageChange = useCallback(
    (value?: string) => {
      setLocalImageUrl(value);
      handleSubmit(value);
    },
    [handleSubmit]
  );

  return project ? (
    <InnerPage wide>
      <SettingsWrapper>
        {project.isArchived ? (
          <ArchivedSettingNotice />
        ) : (
          <SettingsFields>
            <TitleWrapper size="body" weight="bold">
              {t("Basic settings")}
            </TitleWrapper>
            <InputField
              title={t("Project Name")}
              value={project.name}
              onChange={(name) => setLocalName(name)}
              onBlur={handleSubmit}
            />
            <TextareaField
              title={t("Description")}
              value={localDescription}
              resizable="height"
              onChange={setLocalDescription}
              onBlur={handleSubmit}
            />
            <SettingsRow>
              <SettingsRowItem>
                <AssetField
                  title={t("Thumbnail")}
                  inputMethod="asset"
                  assetsTypes={IMAGE_TYPES}
                  value={localImageUrl}
                  onChange={(v) => handleImageChange(v)}
                />
              </SettingsRowItem>
              <SettingsRowItem>
                <Thumbnail
                  src={localImageUrl || defaultProjectBackgroundImage}
                />
              </SettingsRowItem>
            </SettingsRow>
          </SettingsFields>
        )}
        <SettingsFields>
          <TitleWrapper size="body" weight="bold">
            {t("Danger Zone")}
          </TitleWrapper>

          <DangerItem>
            <Typography size="body" weight="bold">
              {t("Remove this project")}
            </Typography>
            <Typography size="body">
              {t("This process will move this project to Recycle bin.")}
            </Typography>
            <ButtonWrapper>
              <Button
                title={t("Move to Recycle Bin")}
                appearance="dangerous"
                onClick={() => handleProjectRemoveModal(true)}
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
