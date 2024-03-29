import { Provider as StateProvider } from "jotai";
import { useParams } from "react-router-dom";

import NotFound from "@reearth/beta/components/NotFound";
import Editor from "@reearth/beta/features/Editor";
import { isTab } from "@reearth/beta/features/Navbar";
import Page from "@reearth/beta/pages/Page";

type Props = {};

const EditorPage: React.FC<Props> = () => {
  const { sceneId, tab } = useParams<{ sceneId: string; tab: string }>();

  return !sceneId || !tab || !isTab(tab) ? (
    <NotFound />
  ) : (
    <StateProvider>
      <Page
        sceneId={sceneId}
        renderItem={props => <Editor tab={tab} sceneId={sceneId} {...props} />}
      />
    </StateProvider>
  );
};

export default EditorPage;
