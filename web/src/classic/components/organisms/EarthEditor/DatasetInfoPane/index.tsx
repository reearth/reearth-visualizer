import React from "react";

import Loading from "@reearth/classic/components/atoms/Loading";
import { default as Wrapper } from "@reearth/classic/components/molecules/EarthEditor/DatasetInfoPane";
import Button from "@reearth/classic/components/atoms/Button";
import { useT } from "@reearth/services/i18n";

import useHooks from "./hooks";

export type Props = {
  className?: string;
};

const DatasetInfoPane: React.FC<Props> = () => {
  const t = useT();
  const {
    datasetHeaders,
    datasets,
    primitiveItems,
    loading,
    handleAddLayerGroupFromDatasetSchema,
    isHosted,
    handleRefresh,
    isRefreshing,
  } = useHooks();

  return (
    <>
      <Wrapper
        datasetHeaders={datasetHeaders}
        datasets={datasets}
        primitiveItems={primitiveItems}
        onCreateLayerGroup={handleAddLayerGroupFromDatasetSchema}
      />
      {isHosted && (
        <div style={{ padding: "16px", textAlign: "center", display: "flex", justifyContent: "center" }}>
          <Button
            buttonType="primary"
            text={isRefreshing ? t("Refreshing...") : t("Refresh data")}
            onClick={handleRefresh}
            large
            disabled={isRefreshing}
          />
        </div>
      )}
      {(loading || isRefreshing) && <Loading />}
    </>
  );
};

export default DatasetInfoPane;
