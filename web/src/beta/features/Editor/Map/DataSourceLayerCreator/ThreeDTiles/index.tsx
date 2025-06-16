import {
  InputGroup,
  SubmitWrapper,
  Wrapper,
  InputsWrapper,
  ContentWrapper
} from "@reearth/beta/features/Editor/Map/shared/SharedComponent";
import { Button, RadioGroup, TextInput } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { FC, ReactNode, useCallback, useMemo, useState } from "react";

import { DataProps } from "..";
import { generateTitle } from "../util";

export type SourceType = "url" | "osm-buildings" | "google-photorealistic";

export type DataSourceOptType = {
  label: string;
  value: SourceType;
  children?: ReactNode;
}[];

const ThreeDTiles: FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const t = useT();

  const [value, setValue] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("osm-buildings");
  const googlePhotorealistic = sourceType === "google-photorealistic";

  const renderUrlInput = useMemo(() => {
    if (sourceType === "url") {
      return (
        <InputGroup
          label={t("Resource URL")}
          data-testid="threedtiles-url-group"
        >
          <InputsWrapper data-testid="threedtiles-url-inputs">
            <TextInput
              placeholder="https://"
              value={value}
              onChange={(value) => setValue(value)}
              data-testid="threedtiles-url-textinput"
            />
          </InputsWrapper>
        </InputGroup>
      );
    } else return undefined;
  }, [sourceType, t, value]);

  const dataSourceOptions: DataSourceOptType = useMemo(
    () => [
      { label: t("Cesium OSM 3D Tiles"), value: "osm-buildings" },
      {
        label: t("Google Photorealistic 3D Tiles"),
        value: "google-photorealistic"
      },
      {
        label: t("URL"),
        value: "url",
        children: renderUrlInput
      }
    ],
    [renderUrlInput, t]
  );

  const handleDataSourceTypeChange = useCallback((newValue: string) => {
    setSourceType(newValue as SourceType);
    setValue("");
  }, []);

  const title = useMemo(() => {
    if (googlePhotorealistic) {
      return t("Google Photorealistic 3D Tiles");
    } else if (sourceType === "osm-buildings") {
      return t("Cesium OSM 3D Tiles");
    } else {
      return generateTitle(value);
    }
  }, [googlePhotorealistic, sourceType, t, value]);

  const handleSubmit = () => {
    onSubmit({
      layerType: "simple",
      sceneId,
      title,
      visible: true,
      config: {
        data: {
          url: value !== "" ? value : undefined,
          type:
            sourceType === "osm-buildings"
              ? "osm-buildings"
              : googlePhotorealistic
                ? "google-photorealistic"
                : "3dtiles"
        }
      }
    });
    onClose();
  };

  return (
    <Wrapper data-testid="threedtiles-wrapper">
      <ContentWrapper data-testid="threedtiles-content">
        <RadioGroup
          value={sourceType}
          layout="vertical"
          options={dataSourceOptions}
          onChange={handleDataSourceTypeChange}
          data-testid="threedtiles-source-type-radio"
        />
      </ContentWrapper>
      <SubmitWrapper data-testid="threedtiles-submit-wrapper">
        <Button
          title={t("Add to Layer")}
          appearance="primary"
          onClick={handleSubmit}
          disabled={!value && sourceType === "url"}
          data-testid="threedtiles-submit-button"
        />
      </SubmitWrapper>
    </Wrapper>
  );
};

export default ThreeDTiles;
