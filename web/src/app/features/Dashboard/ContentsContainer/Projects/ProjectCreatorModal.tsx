import { license_options } from "@reearth/app/features/ProjectSettings/innerPages/LicenseSettings/content";
import { Button, Modal, ModalPanel } from "@reearth/app/lib/reearth-ui";
import {
  InputField,
  RadioGroupField,
  SelectField
} from "@reearth/app/ui/fields";
import TextAreaField from "@reearth/app/ui/fields/TextareaField";
import { appFeature } from "@reearth/services/config/appFeatureConfig";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useMemo, useState } from "react";

import { Project } from "../../type";

type ProjectCreatorModalProps = {
  visible: boolean;
  onClose?: () => void;
  onProjectCreate: (
    data: Pick<Project, "name" | "description" | "projectAlias" | "visibility">
  ) => void;
};

type FormState = {
  projectName: string;
  projectAlias: string;
  description: string;
  visibility?: string;
  license?: string;
};

const ProjectCreatorModal: FC<ProjectCreatorModalProps> = ({
  visible,
  onClose,
  onProjectCreate
}) => {
  const t = useT();
  const { projectCreation } = appFeature();

  const [formState, setFormState] = useState<FormState>({
    projectName: "",
    projectAlias: "",
    description: "",
    visibility: "public",
    license: ""
  });

  const projectVisibilityOptions = useMemo(
    () => [
      { value: "public", label: t("Public") },
      { value: "private", label: t("Private") }
    ],
    [t]
  );
  const handleOnChange = useCallback(
    (field: keyof FormState, newValue: string) => {
      setFormState((prev) => ({ ...prev, [field]: newValue }));
    },
    []
  );

  const onSubmit = useCallback(() => {
    onProjectCreate({
      name: formState.projectName,
      description: formState.description,
      projectAlias: formState.projectAlias,
      visibility: formState.visibility
    });
    onClose?.();
  }, [formState, onClose, onProjectCreate]);

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
              disabled={!formState.projectName}
              data-testid="project-creator-apply-btn"
            />
          </>
        }
        data-testid="project-creator-modal-panel"
      >
        <ContentWrapper data-testid="project-creator-content-wrapper">
          <Form data-testid="project-creator-form">
            <FormInputWrapper data-testid="project-creator-name-wrapper">
              <InputField
                title={t("Project Name *")}
                value={formState.projectName}
                placeholder={t("Text")}
                onChange={(value) => handleOnChange("projectName", value)}
                data-testid="project-creator-name-input"
              />
            </FormInputWrapper>
            <FormInputWrapper data-testid="project-creator-project-alias-wrapper">
              <InputField
                title={t("Project Alias *")}
                value={formState.projectAlias}
                placeholder={t("Text")}
                onChange={(value) => handleOnChange("projectAlias", value)}
                data-testid="project-creator-project-alias-input"
                description={t(
                  "Used to create the project URL. Only lowercase letters, numbers, and hyphens are allowed. Example: https://reearth.io/team-alias/project-alias"
                )}
              />
            </FormInputWrapper>
            {!projectCreation && (
              <FormInputWrapper data-testid="project-creator-project-visibility-wrapper">
                <RadioGroupField
                  title={t("Project Visibility *")}
                  value={formState.visibility}
                  options={projectVisibilityOptions}
                  layout="vertical"
                  onChange={(value) => handleOnChange("visibility", value)}
                  data-testid="project-creator-project-visibility-input"
                  description={t(
                    "For Open & Public projects, anyone can view the project. For Private projects, only members of the workspace can see it."
                  )}
                />
              </FormInputWrapper>
            )}
            <FormInputWrapper data-testid="project-creator-description-wrapper">
              <TextAreaField
                title={t("Description")}
                value={formState.description}
                placeholder={t("Write down your content")}
                rows={4}
                onChange={(value) => handleOnChange("description", value)}
                data-testid="project-creator-description-input"
                description={t(
                  "Provide a short summary (within 200 characters) describing the purpose or key features of this project."
                )}
              />
            </FormInputWrapper>
            <FormInputWrapper data-testid="project-creator-project-alias-wrapper">
              <SelectField
                title={"Choose a license"}
                value={formState.license}
                onChange={(value) => handleOnChange("license", value as string)}
                data-testid="project-creator-project-license-input"
                options={license_options.map((license) => ({
                  value: license.value,
                  label: license.label
                }))}
                description={t(
                  "We strongly recommend selecting a license to clarify how others can use your work and to protect your rights as the creator."
                )}
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
