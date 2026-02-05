import Editor from "@reearth/app/features/Editor";
import { useResetAllAtoms } from "@reearth/app/features/Editor/atoms";
import { isTab } from "@reearth/app/features/Navbar";
import NotFound from "@reearth/app/features/NotFound";
import Page from "@reearth/app/pages/Page";
import { FC, useEffect, useRef } from "react";
import { useParams } from "react-router";

const EditorPage: FC = () => {
  const { sceneId, tab } = useParams<{ sceneId: string; tab: string }>();

  const resetAll = useResetAllAtoms();
  const resetAllRef = useRef(resetAll);
  resetAllRef.current = resetAll;
  useEffect(() => {
    return () => {
      resetAllRef.current();
    };
  }, [sceneId]);

  if (!sceneId || !tab || !isTab(tab)) {
    return <NotFound />;
  }

  return (
    <Page
      sceneId={sceneId}
      renderItem={(props) => (
        <Editor key={sceneId} tab={tab} sceneId={sceneId} {...props} />
      )}
    />
  );
};

export default EditorPage;
