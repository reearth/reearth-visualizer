import React from "react";
import { useIntl } from "react-intl";

import TabArea from "@reearth/components/atoms/TabArea";

import DatasetPane from "../DataSourcePane";
import OutlinePane from "../OutlinePane";

import useHooks from "./hooks";

// TODO: ErrorBoudaryでエラーハンドリング

const LeftMenu: React.FC = () => {
  const { isCapturing } = useHooks();

  const intl = useIntl();
  const labels = {
    outline: intl.formatMessage({ defaultMessage: "Outline" }),
    dataset: intl.formatMessage({ defaultMessage: "Dataset" }),
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
