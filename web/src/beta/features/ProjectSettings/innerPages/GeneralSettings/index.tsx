import { IMAGE_TYPES } from "@reearth/beta/features/AssetsManager/constants";
import ProjectRemoveModal from "@reearth/beta/features/Dashboard/ContentsContainer/Projects/ProjectRemoveModal";
import { Collapse, Button, Typography } from "@reearth/beta/lib/reearth-ui";
import defaultProjectBackgroundImage from "@reearth/beta/ui/assets/defaultProjectBackgroundImage.svg";
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

  const handleSubmit = useCallback(() => {
    onUpdateProject({
      name: localName,
      description: localDescription,
      imageUrl: localImageUrl
    });
  }, [localName, localDescription, localImageUrl, onUpdateProject]);

  const [projectRemoveModalVisible, setProjectRemoveModalVisible] =
    useState(false);

  const handleProjectRemoveModal = useCallback((value: boolean) => {
    setProjectRemoveModalVisible(value);
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
                  <Thumbnail
                    src={localImageUrl || defaultProjectBackgroundImage}
                  />
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
        </Collapse>
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
