import React from "react";
import { useParams } from "react-router-dom";

import BrowserWidthWarning from "@reearth/classic/components/molecules/Common/BrowserWidthWarning";
import EarthEditorPage from "@reearth/classic/components/molecules/EarthEditor/EarthEditorPage";
import CanvasArea from "@reearth/classic/components/organisms/EarthEditor/CanvasArea";
import CoreCanvasArea from "@reearth/classic/components/organisms/EarthEditor/core/CanvasArea";
import Header from "@reearth/classic/components/organisms/EarthEditor/Header";
import LeftMenu from "@reearth/classic/components/organisms/EarthEditor/LeftMenu";
import PrimitiveHeader from "@reearth/classic/components/organisms/EarthEditor/PrimitiveHeader";
import RightMenu from "@reearth/classic/components/organisms/EarthEditor/RightMenu";
import { useCore } from "@reearth/classic/util/use-core";
import { Provider as DndProvider } from "@reearth/classic/util/use-dnd";
import { AuthenticatedPage } from "@reearth/services/auth";

import useHooks from "./hooks";

export type Props = {
  path?: string;
};

const EarthEditor: React.FC<Props> = () => {
  const { sceneId } = useParams();
  const { loading, loaded } = useHooks(sceneId);
  const core = useCore("earth_editor");

  return (
    <AuthenticatedPage>
      <BrowserWidthWarning />
      <DndProvider>
        <EarthEditorPage
          loading={loading}
          loaded={loaded}
          header={<Header />}
          left={<LeftMenu />}
          centerTop={<PrimitiveHeader />}
          center={
            typeof core == "boolean" &&
            (core ? <CoreCanvasArea inEditor /> : <CanvasArea inEditor />)
          }
          right={<RightMenu />}
        />
      </DndProvider>
    </AuthenticatedPage>
  );
};

export default EarthEditor;
