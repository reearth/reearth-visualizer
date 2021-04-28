import useFileInput from "use-file-input";

export type Format = "kml" | "czml" | "geojson" | "shape" | "reearth";

export default ({ onLayerImport }: { onLayerImport?: (file: File, format: Format) => void }) => {
  const importLayer = useFileInput(
    (files: FileList) => {
      const file = files[0];
      if (!file) return;

      const extension = file.name.slice(file.name.lastIndexOf(".") + 1);
      const format: Format | undefined = ["kml", "czml", "geojson"].includes(extension)
        ? (extension as Format)
        : extension == "json"
        ? "reearth"
        : ["zip", "shp"].includes(extension)
        ? "shape"
        : undefined;
      if (!format) return;

      onLayerImport?.(file, format);
    },
    { accept: ".kml,.czml,.geojson,.shp,.zip,.json" },
  );

  return {
    importLayer,
  };
};
