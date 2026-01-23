import {
  visualizerProjectLicensesOptions,
  licenseContent
} from "@reearth/app/lib/license";
import {
  Button,
  Modal,
  ModalPanel,
  TextArea,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { SelectField } from "@reearth/app/ui/fields";
import { ProjectMetadata } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";

import CommonLayout, { PreviewWrapper } from "../common";

type Props = {
  projectMetadata?: ProjectMetadata | null;
  onUpdateProjectMetadata?: (metadata: { license?: string }) => void;
};

const getLicenseContent = (value: string): string | null => {
  return licenseContent[value as keyof typeof licenseContent] || null;
};

const LicenseSettings: FC<Props> = ({
  projectMetadata,
  onUpdateProjectMetadata
}) => {
  const t = useT();
  const theme = useTheme();
  const tabs = [
    { id: "edit", label: t("Edit") },
    { id: "preview", label: t("Preview") }
  ];

  const [activeTab, setActiveTab] = useState("edit");
  const [content, setContent] = useState(projectMetadata?.license || "");
  const [selectedLicense, setSelectedLicense] = useState<string>("");
  const [open, setOpen] = useState(false);

  const handleCloseModal = useCallback(() => {
    setOpen(false);
    setSelectedLicense("");
  }, []);

  const handleApply = useCallback(() => {
    const content = getLicenseContent(selectedLicense);
    setContent(content ?? "");
    handleCloseModal();
  }, [handleCloseModal, selectedLicense]);

  const selectedLicenseObj = visualizerProjectLicensesOptions.find(
    (l) => l.value === selectedLicense
  );

  return (
    <>
      <CommonLayout
        title="License Editing"
        activeTab={activeTab}
        tabs={tabs}
        onTabChange={setActiveTab}
        actions={
          <>
            <Button
              appearance="primary"
              title={t("Choose a template")}
              onClick={() => setOpen(true)}
            />
            <Button
              appearance="primary"
              title={t("Save License")}
              onClick={() => onUpdateProjectMetadata?.({ license: content })}
              disabled={
                content.trim() === (projectMetadata?.license?.trim() || "")
              }
            />
          </>
        }
      >
        {activeTab === "edit" ? (
          <TextArea
            value={content}
            appearance="present"
            rows={30}
            onChange={setContent}
            placeholder={t("Write down your license")}
          />
        ) : (
          <PreviewWrapper className="markdown-body">
            <ReactMarkdown>{content}</ReactMarkdown>
          </PreviewWrapper>
        )}
      </CommonLayout>
      {open && (
        <Modal visible={true} size="small">
          <ModalPanel
            onCancel={handleCloseModal}
            title={t("Choose a template")}
            actions={[
              <Button
                key="cancel"
                title={t("Cancel")}
                appearance="secondary"
                onClick={handleCloseModal}
              />,
              <Button
                key="apply"
                title={t("Apply")}
                appearance="primary"
                disabled={!selectedLicense}
                onClick={() => handleApply()}
              />
            ]}
            data-testid="project-licence-modal-edit"
          >
            <ContentWrapper>
              <Typography size="body">
                {t(
                  "You can select a license from the following templates to apply to your current project."
                )}
              </Typography>
              <Typography size="body" color={theme.warning.main}>
                {t(
                  "Once selected, it will replace the current license setting. Please make sure you understand the implications of the new license."
                )}
              </Typography>
              <SelectField
                title={"Choose a license"}
                value={selectedLicense}
                onChange={(value) => setSelectedLicense(value as string)}
                placeholder={t("Select a license")}
                options={visualizerProjectLicensesOptions.map((license) => ({
                  value: license.value,
                  label: license.label
                }))}
                description={selectedLicenseObj?.description}
              />
            </ContentWrapper>
          </ModalPanel>
        </Modal>
      )}
    </>
  );
};

export default LicenseSettings;

const ContentWrapper = styled("div")(({ theme }) => ({
  background: theme.bg[1],
  borderBottom: `1px solid ${theme.outline.weak}`,
  borderTop: `1px solid ${theme.outline.weak}`,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.large,
  padding: theme.spacing.normal
}));
