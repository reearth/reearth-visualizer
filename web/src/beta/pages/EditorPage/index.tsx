import { FC } from "react";
import { useParams } from "react-router-dom";

import NotFound from "@reearth/beta/components/NotFound";
import Editor from "@reearth/beta/features/Editor";
import { isTab } from "@reearth/beta/features/Navbar";

type Props = {};

const EditorPage: FC<Props> = () => {
  const { sceneId, tab } = useParams<{ sceneId: string; tab: string }>();

  if (!sceneId || !tab || !isTab(tab)) {
    return <NotFound />;
  }

  return <Editor tab={tab} sceneId={sceneId} />;
};

export default EditorPage;
