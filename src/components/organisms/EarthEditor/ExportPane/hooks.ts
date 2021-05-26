import { useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import { useLocalState } from "@reearth/state";
import { Format } from "@reearth/components/molecules/EarthEditor/ExportPane";

const ext: { [key in Format]: string } = {
  kml: "kml",
  geojson: "geojson",
  czml: "czml",
  shape: "shp",
};

export default () => {
  const { getAccessTokenSilently } = useAuth0();
  const [selectedLayer] = useLocalState(s => s.selectedLayer);

  const onExport = useCallback(
    async (format: Format) => {
      if (!selectedLayer || !window.REEARTH_CONFIG?.api) return;

      const accessToken = await getAccessTokenSilently();
      if (!accessToken) return;

      const filename = `${selectedLayer}.${ext[format]}`;
      const type =
        format === "kml"
          ? "application/xml"
          : ["geojson", "czml"].includes(format)
          ? "application/json"
          : "application/octet-stream";

      const res = await fetch(`${window.REEARTH_CONFIG.api}/layers/${filename}`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      const download = document.createElement("a");
      download.download = filename;
      download.href = URL.createObjectURL(await res.blob());
      download.dataset.downloadurl = [type, download.download, download.href].join(":");
      download.click();
    },
    [getAccessTokenSilently, selectedLayer],
  );

  return { selectedLayer, onExport };
};
