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
import { useValidateProjectAlias } from "@reearth/services/api/project";
import { useWorkspacePolicyCheck } from "@reearth/services/api/workspace";
import { appFeature } from "@reearth/services/config/appFeatureConfig";
import { useT } from "@reearth/services/i18n/hooks";
import { useWorkspace } from "@reearth/services/state";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, useCallback, useEffect, useMemo, useState } from "react";

import { Project } from "../../type";

const VALIDATION_DEBOUNCE_MS = 600;

type ProjectCreatorModalProps = {
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
  onClose,
  onProjectCreate
}) => {
  const t = useT();
  const theme = useTheme();

  const { projectVisibility } = appFeature();
  const { validateProjectAlias } = useValidateProjectAlias();
  const [currentWorkspace] = useWorkspace();

  const data = useWorkspacePolicyCheck(currentWorkspace?.id ?? "");
  const enableToCreatePrivateProject =
    data?.workspacePolicyCheck?.enableToCreatePrivateProject ?? false;

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
      {
        value: "private",
        label: t("Private"),
        disabled: !enableToCreatePrivateProject
      }
    ],
    [t, enableToCreatePrivateProject]
  );

  const handleFieldChange = useCallback(
    (field: keyof FormState, newValue: string) => {
      setFormState((prev) => ({ ...prev, [field]: newValue }));
    },
    []
  );

  const [aliasValid, setAliasValid] = useState<boolean>(false);
  const [aliasWarning, setAliasWarning] = useState<string>("");
  const [debouncedAlias, setDebouncedAlias] = useState<string>("");

  // Debounce project alias changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAlias(formState.projectAlias);
    }, VALIDATION_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [formState.projectAlias]);

  // Validate project alias when debounced value changes
  useEffect(() => {
    const validateAlias = async () => {
      if (!currentWorkspace || !debouncedAlias.trim()) {
        setAliasValid(false);
        setAliasWarning("");
        return;
      }

      setAliasValid(false);

      const result = await validateProjectAlias?.(
        debouncedAlias.trim(),
        currentWorkspace?.id,
        undefined
      );

      if (result?.available) {
        setAliasValid(true);
        setAliasWarning("");
      } else {
        setAliasValid(false);
        const errors =
          result?.error && "errors" in result.error
            ? (result.error.errors as { extensions?: { description?: string } }[])
            : [];
        setAliasWarning((errors?.[0]?.extensions?.description as string) ?? "");
      }
    };

    validateAlias();
  }, [debouncedAlias, currentWorkspace, validateProjectAlias]);

  const onSubmit = useCallback(() => {
    const license = getLicenseContent(formState?.license);
    onProjectCreate({
      name: formState.projectName,
      description: formState.description,
      projectAlias: formState.projectAlias.trim(),
      visibility: formState.visibility,
      license
    });
    onClose?.();
  }, [formState, onClose, onProjectCreate]);

  return (
    <Modal visible size="small" data-testid="project-creator-modal">
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
                !formState.projectName || !formState.projectAlias || !aliasValid
              }
              data-testid="project-creator-apply-btn"
            />
          </>
        }
      >
        <ContentWrapper>
          <Form>
            <FormInputWrapper>
              <InputField
                title={t("Project Name *")}
                value={formState.projectName}
                placeholder={t("Text")}
                onChange={(value) => handleFieldChange("projectName", value)}
                data-testid="project-name-input"
              />
            </FormInputWrapper>
            <FormInputWrapper>
              <InputField
                title={t("Project Alias *")}
                value={formState.projectAlias}
                placeholder={t("Text")}
                onChange={(value) => handleFieldChange("projectAlias", value)}
                data-testid="project-alias-input"
                description={
                  aliasWarning ? (
                    <Typography size="footnote" color={theme.dangerous.main}>
                      {aliasWarning}
                    </Typography>
                  ) : (
                    t(
                      "Only letters, numbers, and hyphens are allowed. Example: https://reearth.io/team-alias/project-alias"
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
                  onChange={(value) => handleFieldChange("visibility", value)}
                  data-testid="project-visibility-input"
                  description={t(
                    "For Open & Public projects, anyone can view the project. For Private projects, only members of the workspace can see it."
                  )}
                />
              </FormInputWrapper>
            )}
            <FormInputWrapper>
              <TextAreaField
                title={t("Description")}
                value={formState.description}
                placeholder={t("Write down your content")}
                data-testid="project-description-input"
                rows={4}
                onChange={(value) => handleFieldChange("description", value)}
                description={t(
                  "Provide a short summary (within 200 characters) describing the purpose or key features of this project."
                )}
              />
            </FormInputWrapper>
            <FormInputWrapper>
              <SelectField
                title={"Choose a license"}
                value={formState.license}
                onChange={(value) =>
                  handleFieldChange("license", value as string)
                }
                data-testid="project-license-input"
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
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.large,
  padding: theme.spacing.normal
}));

const ContentWrapper = styled("div")(({ theme }) => ({
  background: theme.bg[1],
  borderBottom: `1px solid ${theme.outline.weak}`,
  borderTop: `1px solid ${theme.outline.weak}`
}));

const FormInputWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.smallest,
  width: "100%"
}));
