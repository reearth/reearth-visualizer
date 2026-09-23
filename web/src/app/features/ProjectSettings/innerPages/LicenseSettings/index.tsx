import {
  licenseContent,
  useLicenseSelectorOptions
} from "@reearth/app/lib/license";
import { Button, Selector, TextArea } from "@reearth/app/lib/reearth-ui";
import { ProjectMetadata } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n/hooks";
import { FC, useCallback, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";

import CommonLayout, { PreviewWrapper } from "../common";

const LICENSE_MENU_WIDTH = 420;
const LICENSE_MENU_MAX_HEIGHT = 320;

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
  const tabs = [
    { id: "edit", label: t("Edit") },
    { id: "preview", label: t("Preview") }
  ];

  const savedLicense = projectMetadata?.license || "";

  const [activeTab, setActiveTab] = useState("edit");
  const [content, setContent] = useState(savedLicense);
  const [selectedLicense, setSelectedLicense] = useState<string>("");

  const licenseOptions = useLicenseSelectorOptions();

  // Picking a template replaces the editor outright, which is only safe
  // because "Cancel changes" can put the saved license back.
  const handleSelectTemplate = useCallback((value: string | string[]) => {
    const license = value as string;
    setSelectedLicense(license);
    setContent(getLicenseContent(license) ?? "");
  }, []);

  const hasChanges = useMemo(
    () => content.trim() !== savedLicense.trim(),
    [content, savedLicense]
  );

  const handleCancelChanges = useCallback(() => {
    setContent(savedLicense);
    setSelectedLicense("");
  }, [savedLicense]);

  const handleSave = useCallback(() => {
    onUpdateProjectMetadata?.({ license: content });
  }, [content, onUpdateProjectMetadata]);

  return (
    <CommonLayout
      title={t("License Editing")}
      activeTab={activeTab}
      tabs={tabs}
      onTabChange={setActiveTab}
      tabAdornment={
        <Selector
          value={selectedLicense}
          options={licenseOptions}
          onChange={handleSelectTemplate}
          menuWidth={LICENSE_MENU_WIDTH}
          menuPlacement="bottom-end"
          maxHeight={LICENSE_MENU_MAX_HEIGHT}
          dataTestid="license-template-selector"
          trigger={
            <Button
              appearance="simple"
              title={t("Choose a template")}
              data-testid="license-template-trigger"
            />
          }
        />
      }
      actions={
        <>
          <Button
            title={t("Cancel changes")}
            onClick={handleCancelChanges}
            disabled={!hasChanges}
            data-testid="license-cancel-changes-btn"
          />
          <Button
            appearance="primary"
            title={t("Save License")}
            onClick={handleSave}
            disabled={!hasChanges}
            data-testid="license-save-btn"
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
          dataTestid="license-editor"
        />
      ) : (
        <PreviewWrapper className="markdown-body">
          <ReactMarkdown>{content}</ReactMarkdown>
        </PreviewWrapper>
      )}
    </CommonLayout>
  );
};

export default LicenseSettings;
