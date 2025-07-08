import { Button, TextArea } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

import CommonLayout, { PreviewWrapper } from "../common";

const ReadMeSettings = () => {
  const [activeTab, setActiveTab] = useState("edit");
  const [content, setContent] = useState(`# test project
---

## Feature
---

## Data Sources
---

## Plugins
---`);

  const tabs = [
    { id: "edit", label: "Edit" },
    { id: "preview", label: "Preview" }
  ];

  const t = useT();

  return (
    <CommonLayout
      title="README Editing"
      activeTab={activeTab}
      tabs={tabs}
      onTabChange={setActiveTab}
      actions={<Button appearance="primary" title={t("Save README")} />}
    >
      {activeTab === "edit" ? (
        <TextArea
          value={content}
          appearance="present"
          rows={30}
          onChange={setContent}
        />
      ) : (
        <PreviewWrapper>
          <ReactMarkdown>{content}</ReactMarkdown>
        </PreviewWrapper>
      )}
    </CommonLayout>
  );
};

export default ReadMeSettings;
