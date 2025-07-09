import { Button, TextArea } from "@reearth/app/lib/reearth-ui";
import { ProjectMetadata } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { FC, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import CommonLayout, { PreviewWrapper } from "../common";

type Props = {
  projectMetadata?: ProjectMetadata | null;
  onUpdateProjectMetadata?: (metadata: { readme?: string }) => void;
};

const DEFAULT_README = `# Test project

## Features

## Data Sources

## plugins
`;

const ReadMeSettings: FC<Props> = ({ projectMetadata, onUpdateProjectMetadata }) => {
  const t = useT();

  const [activeTab, setActiveTab] = useState("edit");
  const [content, setContent] = useState(
    projectMetadata?.readme || DEFAULT_README
  );

  const tabs = [
    { id: "edit", label: t("Edit") },
    { id: "preview", label: t("Preview") }
  ];

  return (
    <CommonLayout
      title={t("README Editing")}
      activeTab={activeTab}
      tabs={tabs}
      onTabChange={setActiveTab}
      actions={
        <Button
          appearance="primary"
          title={t("Save README")}
          onClick={() => onUpdateProjectMetadata?.({ readme: content })}
          disabled={
            content.trim() ===
            (projectMetadata?.readme || DEFAULT_README).trim()
          }
        />
      }
    >
      {activeTab === "edit" ? (
        <TextArea
          value={content}
          appearance="present"
          rows={30}
          onChange={setContent}
        />
      ) : (
        <PreviewWrapper className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </PreviewWrapper>
      )}
    </CommonLayout>
  );
};

export default ReadMeSettings;
