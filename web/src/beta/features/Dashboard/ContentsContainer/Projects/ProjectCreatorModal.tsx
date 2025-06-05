import {
  Button,
  Modal,
  ModalPanel,
  TextArea,
  TextInput,
  Typography
} from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useState } from "react";

import { Project } from "../../type";

type ProjectCreatorModalProps = {
  visible: boolean;
  onClose?: () => void;
  onProjectCreate: (data: Pick<Project, "name" | "description">) => void;
};

const ProjectCreatorModal: FC<ProjectCreatorModalProps> = ({
  visible,
  onClose,
  onProjectCreate
}) => {
  const t = useT();
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");

  const handleOnChange = useCallback((field: string, newValue: string) => {
    if (field === "projectName") {
      setProjectName(newValue);
    } else if (field === "description") {
      setDescription(newValue);
    }
  }, []);

  const onSubmit = useCallback(() => {
    const data = {
      name: projectName,
      description
    };
    onProjectCreate(data);
    onClose?.();
  }, [description, onClose, onProjectCreate, projectName]);

  return (
    <Modal visible={visible} size="small" data-testid="project-creator-modal">
      <ModalPanel
        title={t("Create new project")}
        onCancel={onClose}
        actions={
          <>
            <Button
              onClick={onClose}
              size="normal"
              title={t("Cancel")}
              data-testid="project-creator-cancel-btn"
            />
            <Button
              size="normal"
              title={t("Apply")}
              appearance="primary"
              onClick={onSubmit}
              disabled={!projectName}
              data-testid="project-creator-apply-btn"
            />
          </>
        }
        data-testid="project-creator-modal-panel"
      >
        <ContentWrapper data-testid="project-creator-content-wrapper">
          <Form data-testid="project-creator-form">
            <FormInputWrapper data-testid="project-creator-name-wrapper">
              <Label>
                <Typography
                  size="body"
                  data-testid="project-creator-name-label"
                >
                  {t("Project Name *")}
                </Typography>
              </Label>
              <TextInput
                value={projectName}
                placeholder={t("Text")}
                onChange={(value) => handleOnChange("projectName", value)}
                data-testid="project-creator-name-input"
              />
            </FormInputWrapper>
            <FormInputWrapper data-testid="project-creator-description-wrapper">
              <Label>
                <Typography
                  size="body"
                  data-testid="project-creator-description-label"
                >
                  {t("Description")}
                </Typography>
              </Label>
              <TextArea
                value={description}
                placeholder={t("Write down your content")}
                rows={4}
                onChange={(value) => handleOnChange("description", value)}
                data-testid="project-creator-description-input"
              />
            </FormInputWrapper>
          </Form>
        </ContentWrapper>
      </ModalPanel>
    </Modal>
  );
};

export default ProjectCreatorModal;

const Form = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.large,
  padding: theme.spacing.normal
}));

const ContentWrapper = styled("div")(({ theme }) => ({
  background: theme.bg[1],
  borderBottom: `1px solid ${theme.outline.weak}`,
  borderTop: `1px solid ${theme.outline.weak}`
}));

const FormInputWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.smallest,
  width: "100%"
}));

const Label = styled("div")(() => ({}));
