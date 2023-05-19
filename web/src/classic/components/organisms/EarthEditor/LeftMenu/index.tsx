import React from "react";

import { useT } from "@reearth/beta/services/i18n";
import TabArea from "@reearth/classic/components/atoms/TabArea";

import DatasetPane from "../DataSourcePane";
import OutlinePane from "../OutlinePane";

import useHooks from "./hooks";

// TODO: ErrorBoudaryでエラーハンドリング

const LeftMenu: React.FC = () => {
  const { isCapturing } = useHooks();

  const t = useT();
  const labels = {
    outline: t("Outline"),
    dataset: t("Dataset"),
  };

  return (
    <TabArea<"outline" | "dataset">
      menuAlignment="top"
      initialSelectedMode="outline"
      selected="outline"
      disabled={isCapturing}
      labels={labels}>
      {{
        outline: <OutlinePane />,
        dataset: <DatasetPane />,
      }}
    </TabArea>
  );
};

export default LeftMenu;
