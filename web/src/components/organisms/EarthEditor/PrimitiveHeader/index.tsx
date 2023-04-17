import React from "react";

import PrimitiveHeader from "@reearth/components/molecules/EarthEditor/PrimitiveHeader";

import useHooks from "./hooks";

// Components

interface PrimitivesWidgetsSystemProps {
  className?: string;
}

const PrimitivePane: React.FC<PrimitivesWidgetsSystemProps> = ({ className }) => {
  const { primitives, loading } = useHooks();
  return <PrimitiveHeader className={className} loading={loading} primitives={primitives} />;
};

export default PrimitivePane;
