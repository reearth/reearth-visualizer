import { Button, TextArea } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

import CommonLayout, { PreviewWrapper } from "../common";

const LicenseSettings = () => {
  const [activeTab, setActiveTab] = useState("edit");
  const [content, setContent] = useState("");

  const tabs = [
    { id: "edit", label: "Edit" },
    { id: "preview", label: "Preview" }
  ];

  const t = useT();

  return (
    <CommonLayout
      title="License Editing"
      activeTab={activeTab}
      tabs={tabs}
      onTabChange={setActiveTab}
      actions={
        <>
          <Button appearance="primary" title={t("Choose a template")} />
          <Button appearance="primary" title={t("Save License")} />
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
        <PreviewWrapper>
          <ReactMarkdown>{content}</ReactMarkdown>
        </PreviewWrapper>
      )}
    </CommonLayout>
  );
};

export default LicenseSettings;
