import { useCallback, useState, useMemo } from "react";

import Button from "@reearth/beta/components/Button";
import Collapse from "@reearth/beta/components/Collapse";
import TextAreaField from "@reearth/beta/components/fields/TextAreaField";
import TextInput from "@reearth/beta/components/fields/TextField";
import URLField from "@reearth/beta/components/fields/URLField";
import Modal from "@reearth/beta/components/Modal";
import Text from "@reearth/beta/components/Text";
import defaultBetaProjectImage from "@reearth/classic/components/atoms/Icon/Icons/defaultBetaProjectImage.png";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import {
  InnerPage,
  SettingsWrapper,
  SettingsFields,
  ButtonWrapper,
  ArchivedSettingNotice,
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
  onArchiveProject: (archive: boolean) => void;
  onDeleteProject: () => void;
};
const GeneralSettings: React.FC<Props> = ({
  project,
  onUpdateProject,
  onArchiveProject,
  onDeleteProject,
}) => {
  const t = useT();

  const [localName, setLocalName] = useState(project?.name ?? "");
  const [localDescription, setLocalDescription] = useState(project?.description ?? "");
  const [localImageUrl, setLocalImageUrl] = useState<string | undefined>(project?.imageUrl ?? "");

  const handleSubmit = useCallback(() => {
    onUpdateProject({
      name: localName,
      description: localDescription,
      imageUrl: localImageUrl,
    });
  }, [localName, localDescription, localImageUrl, onUpdateProject]);

  const [archiveModelVisible, setArchiveModelVisible] = useState(false);
  const [archiveInputName, setArchiveInputName] = useState("");
  const archiveDisabled = useMemo(
    () => archiveInputName !== project?.name,
    [archiveInputName, project?.name],
  );

  const [unarchiveModelVisible, setUnarchiveModelVisible] = useState(false);
  const [unarchiveInputName, setUnarchiveInputName] = useState("");
  const unarchiveDisabled = useMemo(
    () => unarchiveInputName !== project?.name,
    [unarchiveInputName, project?.name],
  );

  const [deleteModelVisible, setDeleteModelVisible] = useState(false);
  const [deleteInputName, setDeleteInputName] = useState("");
  const deleteDisabled = useMemo(
    () => deleteInputName !== project?.name,
    [deleteInputName, project?.name],
  );

  return project ? (
    <InnerPage>
      <SettingsWrapper>
        {project.isArchived ? (
          <ArchivedSettingNotice />
        ) : (
          <Collapse title={t("Project Info")}>
            <SettingsFields>
              <TextInput
                name={t("Name")}
                value={project.name}
                onChange={name => setLocalName(name)}
              />
              <TextAreaField
                name={t("Description")}
                value={localDescription}
                onChange={setLocalDescription}
                minHeight={108}
              />
              <ThumbnailField>
                <URLField
                  name={t("Thumbnail")}
                  fileType="asset"
                  entityType="image"
                  value={localImageUrl}
                  onChange={setLocalImageUrl}
                />
                <StyledImage src={!localImageUrl ? defaultBetaProjectImage : localImageUrl} />
              </ThumbnailField>
              <ButtonWrapper>
                <Button
                  text={t("Submit")}
                  size="medium"
                  margin="0"
                  buttonType="primary"
                  onClick={handleSubmit}
                />
              </ButtonWrapper>
            </SettingsFields>
          </Collapse>
        )}
        <Collapse title={t("Danger Zone")}>
          <SettingsFields>
            {!project.isArchived ? (
              <DangerItem>
                <Text size="body" weight="bold">
                  {t("Archive this project")}
                </Text>
                <Text size="body">{t("Mark this project as archived and read-only")}</Text>
                <ButtonWrapper>
                  <Button
                    text={t("Archive project")}
                    size="medium"
                    margin="0"
                    buttonType="danger"
                    onClick={() => setArchiveModelVisible(true)}
                  />
                </ButtonWrapper>
              </DangerItem>
            ) : (
              <DangerItem>
                <Text size="body" weight="bold">
                  {t("Unarchive this project")}
                </Text>
                <Text size="body">{t("Unarchive this project to become editable again.")}</Text>
                <ButtonWrapper>
                  <Button
                    text={t("Unarchive project")}
                    size="medium"
                    margin="0"
                    buttonType="danger"
                    onClick={() => setUnarchiveModelVisible(true)}
                  />
                </ButtonWrapper>
              </DangerItem>
            )}
            <DangerItem>
              <Text size="body" weight="bold">
                {t("Delete this project")}
              </Text>
              <Text size="body">
                {t("Once you delete a project, there is no going back. Please be sure.")}
              </Text>
              <ButtonWrapper>
                <Button
                  text={t("Delete project")}
                  size="medium"
                  margin="0"
                  buttonType="danger"
                  onClick={() => setDeleteModelVisible(true)}
                />
              </ButtonWrapper>
            </DangerItem>
          </SettingsFields>
        </Collapse>
      </SettingsWrapper>

      <Modal
        isVisible={archiveModelVisible}
        title={t("Archive project")}
        size="sm"
        button1={
          <Button
            text={t("Cancel")}
            buttonType="secondary"
            onClick={() => {
              setArchiveModelVisible(false);
            }}
          />
        }
        button2={
          <Button
            text={t("I am sure I want to archive this project.")}
            buttonType="danger"
            disabled={archiveDisabled}
            onClick={() => {
              onArchiveProject(true);
            }}
          />
        }>
        <Text size="body" weight="bold">
          {project?.name}
        </Text>
        <Text size="body">
          {t(
            `Archiving your project will put it into a state where you cannot edit it or it's settings.`,
          )}
        </Text>
        <Text size="body">{t("Once archived, you can unarchive the repository at any time.")}</Text>
        <Divider />
        <Text size="body" weight="bold">
          {t("Please type your project name to continue.")}
        </Text>
        <TextInput name={" "} value={""} onChange={name => setArchiveInputName(name)} />
      </Modal>

      <Modal
        isVisible={unarchiveModelVisible}
        title={t("Unarchive project")}
        size="sm"
        button1={
          <Button
            text={t("Cancel")}
            buttonType="secondary"
            margin="0"
            onClick={() => {
              setUnarchiveModelVisible(false);
            }}
          />
        }
        button2={
          <Button
            text={t("I am sure I want to unarchive this project.")}
            buttonType="danger"
            disabled={unarchiveDisabled}
            onClick={() => {
              onArchiveProject(false);
            }}
          />
        }>
        <Text size="body" weight="bold">
          {project?.name}
        </Text>
        <Text size="body">
          {t(
            "This will bring this repository back to a state it can be editted and worked on by you and your team.",
          )}
        </Text>
        <Divider />
        <Text size="body" weight="bold">
          {t("Please type your project name to continue.")}
        </Text>
        <TextInput name={" "} value={""} onChange={name => setUnarchiveInputName(name)} />
      </Modal>

      <Modal
        isVisible={deleteModelVisible}
        title={t("Delete project")}
        size="sm"
        button1={
          <Button
            text={t("Cancel")}
            buttonType="secondary"
            onClick={() => {
              setDeleteModelVisible(false);
            }}
          />
        }
        button2={
          <Button
            text={t("I am sure I want to delete this project.")}
            buttonType="danger"
            disabled={deleteDisabled}
            onClick={onDeleteProject}
          />
        }>
        <Text size="body" weight="bold">
          {project?.name}
        </Text>
        <Text size="body">{t("This action cannot be undone.")}</Text>
        <Text size="body">
          {t(
            "This will permanently delete the project. If the project was published, this also means websites and domains referencing the project will not be able to access it anymore.",
          )}
        </Text>
        <Divider />
        <Text size="body" weight="bold">
          {t("Please type your project name to continue.")}
        </Text>
        <TextInput name={" "} value={""} onChange={name => setDeleteInputName(name)} />
      </Modal>
    </InnerPage>
  ) : null;
};

export default GeneralSettings;

const DangerItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.largest}px;
`;

const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.outline.weaker};
`;

const ThumbnailField = styled.div`
  grid-template-rows: 100%;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 20px;
  display: inline-grid;
`;

const StyledImage = styled.img`
  width: 100%;
  border-radius: 4px;
`;
