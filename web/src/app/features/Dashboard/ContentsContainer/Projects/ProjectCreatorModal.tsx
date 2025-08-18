import {
  visualizerProjectLicensesOptions,
  licenseContent
} from "@reearth/app/lib/license";
import {
  Button,
  Modal,
  ModalPanel,
  Typography
} from "@reearth/app/lib/reearth-ui";
import {
  InputField,
  RadioGroupField,
  SelectField
} from "@reearth/app/ui/fields";
import TextAreaField from "@reearth/app/ui/fields/TextareaField";
import { useProjectFetcher, useWorkspaceFetcher } from "@reearth/services/api";
import { appFeature } from "@reearth/services/config/appFeatureConfig";
import { useT } from "@reearth/services/i18n";
import { useWorkspace } from "@reearth/services/state";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useMemo, useState } from "react";

import { Project } from "../../type";

type ProjectCreatorModalProps = {
  visible: boolean;
  onClose?: () => void;
  onProjectCreate: (
    data: Pick<
      Project,
      "name" | "description" | "projectAlias" | "visibility"
    > & { license?: string }
  ) => void;
};

type FormState = {
  projectName: string;
  projectAlias: string;
  description: string;
  visibility?: string;
  license?: string;
};

const getLicenseContent = (value?: string): string | undefined => {
  return licenseContent[value as keyof typeof licenseContent];
};

const ProjectCreatorModal: FC<ProjectCreatorModalProps> = ({
  visible,
  onClose,
  onProjectCreate
}) => {
  const t = useT();
  const theme = useTheme();

  const { projectVisibility } = appFeature();
  const { checkProjectAlias } = useProjectFetcher();
  const [currentWorkspace] = useWorkspace();
  const { useWorkspacePolicyCheck } = useWorkspaceFetcher();

  const data = useWorkspacePolicyCheck(currentWorkspace?.id as string);
  const enableToCreatePrivateProject =
    data?.workspacePolicyCheck?.enableToCreatePrivateProject ?? false;

  const [formState, setFormState] = useState<FormState>({
    projectName: "",
    projectAlias: "",
    description: "",
    visibility: "public",
    license: ""
  });
  const [warning, setWarning] = useState<string>("");

  const projectVisibilityOptions = useMemo(
    () => [
      { value: "public", label: t("Public") },
      {
        value: "private",
        label: t("Private"),
        disabled: !enableToCreatePrivateProject
      }
    ],
    [t, enableToCreatePrivateProject]
  );

  const handleOnChange = useCallback(
    (field: keyof FormState, newValue: string) => {
      setFormState((prev) => ({ ...prev, [field]: newValue }));
    },
    []
  );

  const handleProjectAliasCheck = useCallback(
    async (alias: string) => {
      if (!currentWorkspace) return;
      handleOnChange("projectAlias", alias);
      const result = await checkProjectAlias?.(
        alias,
        currentWorkspace?.id,
        undefined
      );
      if (!result?.available) {
        const description = result?.errors?.find(
          (e) => e?.extensions?.description
        )?.extensions?.description;

        setWarning(description as string);
      } else setWarning("");
    },
    [checkProjectAlias, currentWorkspace, handleOnChange]
  );

  const onSubmit = useCallback(() => {
    const license = getLicenseContent(formState?.license);
    onProjectCreate({
      name: formState.projectName,
      description: formState.description,
      projectAlias: formState.projectAlias,
      visibility: formState.visibility,
      license
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
              disabled={
                !formState.projectName || !formState.projectAlias || !!warning
              }
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
                onChangeComplete={handleProjectAliasCheck}
                data-testid="project-creator-project-alias-input"
                description={
                  warning ? (
                    <Typography size="footnote" color={theme.dangerous.main}>
                      {warning}
                    </Typography>
                  ) : (
                    t(
                      "Used to create the project URL. Only lowercase letters, numbers, and hyphens are allowed. Example: https://reearth.io/team-alias/project-alias"
                    )
                  )
                }
              />
            </FormInputWrapper>
            {projectVisibility && (
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
                options={visualizerProjectLicensesOptions.map((license) => ({
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
