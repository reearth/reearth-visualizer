import {
  InputGroup,
  SubmitWrapper,
  Wrapper,
  InputsWrapper,
  ContentWrapper,
  LinkWapper
} from "@reearth/beta/features/Editor/Map/shared/SharedComponent";
import { Button, RadioGroup, TextInput } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { FC, useCallback, useMemo, useState } from "react";

import { DataProps, DataSourceOptType, SourceType } from "..";
import { generateTitle } from "../util";

const ThreeDTiles: FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const t = useT();

  const [value, setValue] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("osm-buildings");
  const [googleMapApiKey, setGoogleMapApiKey] = useState("");
  const googlePhotorealistic = sourceType === "google-photorealistic";

  const renderGooglePhotorealisticInput = useMemo(() => {
    if (googlePhotorealistic) {
      return (
        <InputGroup
          label={
            <>
              {t("Google Map APIKey ")} ( {t("You can apply a key ")}
              <LinkWapper
                to="https://developers.google.com/maps/documentation/javascript/get-api-key"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("here")}
              </LinkWapper>
              )
            </>
          }
        >
          <InputsWrapper>
            <TextInput
              value={googleMapApiKey}
              onChange={(value) => setGoogleMapApiKey(value)}
            />
          </InputsWrapper>
        </InputGroup>
      );
    } else return undefined;
  }, [googleMapApiKey, googlePhotorealistic, t]);

  const renderUrlInput = useMemo(() => {
    if (sourceType === "url") {
      return (
        <InputGroup label={t("Resource URL")}>
          <InputsWrapper>
            <TextInput
              placeholder="https://"
              value={value}
              onChange={(value) => setValue(value)}
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
        value: "google-photorealistic",
        children: renderGooglePhotorealisticInput
      },
      {
        label: t("URL"),
        value: "url",
        children: renderUrlInput
      }
    ],
    [renderGooglePhotorealisticInput, renderUrlInput, t]
  );

  const handleDataSourceTypeChange = useCallback((newValue: string) => {
    setSourceType(newValue as SourceType);
    setValue("");
    setGoogleMapApiKey("");
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
          serviceTokens: {
            googleMapApiKey: googleMapApiKey || undefined
          },
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
    <Wrapper>
      <ContentWrapper>
        <RadioGroup
          value={sourceType}
          layout="vertical"
          options={dataSourceOptions}
          onChange={handleDataSourceTypeChange}
        />
      </ContentWrapper>
      <SubmitWrapper>
        <Button
          title={t("Add to Layer")}
          appearance="primary"
          onClick={handleSubmit}
          disabled={
            (!value && sourceType === "url") ||
            (!googleMapApiKey && googlePhotorealistic)
          }
        />
      </SubmitWrapper>
    </Wrapper>
  );
};

export default ThreeDTiles;
