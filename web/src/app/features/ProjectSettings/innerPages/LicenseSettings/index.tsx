import { Button, TextArea } from "@reearth/app/lib/reearth-ui";
import { ProjectMetadata } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { FC, useState } from "react";
import ReactMarkdown from "react-markdown";

import CommonLayout, { PreviewWrapper } from "../common";

type Props = {
  projectMetadata?: ProjectMetadata | null;
  onUpdateProjectMetadata?: (metadata: { license?: string }) => void;
};

const LicenseSettings: FC<Props> = ({
  projectMetadata,
  onUpdateProjectMetadata
}) => {
  const [activeTab, setActiveTab] = useState("edit");
  const [content, setContent] = useState(projectMetadata?.license || "");
  const t = useT();

  const tabs = [
    { id: "edit", label: "Edit" },
    { id: "preview", label: "Preview" }
  ];

  return (
    <CommonLayout
      title="License Editing"
      activeTab={activeTab}
      tabs={tabs}
      onTabChange={setActiveTab}
      actions={
        <>
          <Button appearance="primary" title={t("Choose a template")} />
          <Button
            appearance="primary"
            title={t("Save License")}
            onClick={() => onUpdateProjectMetadata?.({ license: content })}
            disabled={
              content.trim() === projectMetadata?.license?.trim() || false
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
  );
};

export default LicenseSettings;
