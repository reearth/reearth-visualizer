import React from "react";

import Wrapper from "@reearth/components/molecules/EarthEditor/ExportPane";
import useHooks from "./hooks";

type Props = {};

const ExportPane: React.FC<Props> = () => {
  const { selectedLayer, onExport } = useHooks();

  return <Wrapper show={!!selectedLayer} onExport={onExport} />;
};

export default ExportPane;
