import React from "react";

import Loading from "@reearth/classic/components/atoms/Loading";
import { default as Wrapper } from "@reearth/classic/components/molecules/EarthEditor/DatasetInfoPane";
import Button from "@reearth/classic/components/atoms/Button";
import { useT } from "@reearth/services/i18n";

import useHooks from "./hooks";

type IntervalType = "15min" | "30min" | "1hour" | "2hour" | "4hour";

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
    autoRefreshEnabled,
    setAutoRefreshEnabled,
    autoRefreshInterval,
    setAutoRefreshInterval,
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
        <div style={{ padding: "16px" }}>
          {/* Auto-Refresh Controls */}
          <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px", justifyContent: "space-between" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={autoRefreshEnabled}
                onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              <span>{t("Auto-refresh")}</span>
            </label>
            {autoRefreshEnabled && (
              <select
                value={autoRefreshInterval}
                onChange={(e) => setAutoRefreshInterval(e.target.value as IntervalType)}
                style={{
                  padding: "6px 8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                <option value="15min">15 minutes</option>
                <option value="30min">30 minutes</option>
                <option value="1hour">1 hour</option>
                <option value="2hour">2 hours</option>
                <option value="4hour">4 hours</option>
              </select>
            )}
          </div>
          
          {/* Manual Refresh Button */}
          <div style={{ textAlign: "center", display: "flex", justifyContent: "center" }}>
            <Button
              buttonType="primary"
              text={isRefreshing ? t("Refreshing...") : t("Refresh data")}
              onClick={handleRefresh}
              large
              disabled={isRefreshing || autoRefreshEnabled}
            />
          </div>
        </div>
      )}
      {(loading || isRefreshing) && <Loading />}
    </>
  );
};

export default DatasetInfoPane;
