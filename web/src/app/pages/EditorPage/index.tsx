import Editor from "@reearth/app/features/Editor";
import { isTab } from "@reearth/app/features/Navbar";
import NotFound from "@reearth/app/features/NotFound";
import Page from "@reearth/app/pages/Page";
import { FC } from "react";
import { useParams } from "react-router-dom";

const EditorPage: FC = () => {
  const { sceneId, tab } = useParams<{ sceneId: string; tab: string }>();

  return !sceneId || !tab || !isTab(tab) ? (
    <NotFound />
  ) : (
    <Page
      sceneId={sceneId}
      renderItem={(props) => <Editor tab={tab} sceneId={sceneId} {...props} />}
    />
  );
};

export default EditorPage;
