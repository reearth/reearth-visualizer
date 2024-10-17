import Editor from "@reearth/beta/features/Editor";
import { isTab } from "@reearth/beta/features/Navbar";
import NotFound from "@reearth/beta/features/NotFound";
import Page from "@reearth/beta/pages/Page";
import { FC } from "react";
import { useParams } from "react-router-dom";

const EditorPage: FC = () => {
  const { sceneId, tab } = useParams<{ sceneId: string; tab: string }>();

  console.log("sceneId", sceneId);
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
