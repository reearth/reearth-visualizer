import {
  InputGroup,
  SubmitWrapper,
  Wrapper,
  InputsWrapper,
  ContentWrapper
} from "@reearth/beta/features/Editor/Map/shared/SharedComponent";
import { Button, RadioGroup, TextInput } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { FC, useCallback, useMemo, useState } from "react";

import { DataProps, DataSourceOptType, SourceType } from "..";
import { generateTitle } from "../util";

const osmBuildings =
  "https://tile.googleapis.com/v1/3dtiles/root.json?key=AIzaSyBCrWyh4_rWvf8LpDhsI1WMgREY7EoRTPU";

const googlePhotorealistic =
  "https://assets.ion.cesium.com/us-east-1/asset_depot/96188/OpenStreetMap/CWT/2024-03-04/tileset.json?v=17";

const ThreeDTiles: FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const t = useT();

  const [value, setValue] = useState(osmBuildings);
  const [sourceType, setSourceType] = useState<SourceType>("osm-buildings");

  const dataSourceOptions: DataSourceOptType = useMemo(
    () => [
      { label: t("Cesium OSM 3D Tiles"), value: "osm-buildings" },
      {
        label: t("Google Photorealistic 3D Tiles"),
        value: "google-photorealistic"
      },
      { label: t("URL"), value: "url" }
    ],
    [t]
  );

  const handleDataSourceTypeChange = useCallback((newValue: string) => {
    setSourceType(newValue as SourceType);
    if (newValue === "google-photorealistic") {
      setValue(googlePhotorealistic);
    } else if (newValue === "osm-buildings") {
      setValue(osmBuildings);
    } else {
      setValue("");
    }
  }, []);

  const title = useMemo(() => {
    if (sourceType === "google-photorealistic") {
      return t("Google Photorealistic 3D Tiles");
    } else if (sourceType === "osm-buildings") {
      return t("Cesium OSM 3D Tiles");
    } else {
      return generateTitle(value);
    }
  }, [sourceType, t, value]);

  const handleSubmit = () => {
    onSubmit({
      layerType: "simple",
      sceneId,
      title,
      visible: true,
      config: {
        data: {
          url: value !== "" ? value : undefined,
          type: "3dtiles"
        }
      }
    });
    onClose();
  };

  return (
    <Wrapper>
      <ContentWrapper>
        <RadioGroup
          value={sourceType}
          layout="vertical"
          options={dataSourceOptions}
          onChange={handleDataSourceTypeChange}
        />
        {sourceType === "url" && (
          <InputGroup label={t("Resource URL")}>
            <InputsWrapper>
              <TextInput
                placeholder="https://"
                value={value}
                onChange={(value) => setValue(value)}
              />
            </InputsWrapper>
          </InputGroup>
        )}
      </ContentWrapper>

      <SubmitWrapper>
        <Button
          title={t("Add to Layer")}
          appearance="primary"
          onClick={handleSubmit}
          disabled={!value}
        />
      </SubmitWrapper>
    </Wrapper>
  );
};

export default ThreeDTiles;
