import {
  InputGroup,
  SubmitWrapper,
  Wrapper,
  InputsWrapper,
  ContentWrapper,
  LinkWrapper
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
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState("");
  const googlePhotorealistic = sourceType === "google-photorealistic";

  const renderGooglePhotorealisticInput = useMemo(() => {
    if (googlePhotorealistic) {
      return (
        <InputGroup
          label={
            <>
              {t("Google Maps API Key ")} ( {t("You can apply a key ")}
              <LinkWrapper
                to="https://developers.google.com/maps/documentation/javascript/get-api-key"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("here")}
              </LinkWrapper>
              )
            </>
          }
        >
          <InputsWrapper>
            <TextInput
              value={googleMapsApiKey}
              onChange={(value) => setGoogleMapsApiKey(value)}
            />
          </InputsWrapper>
        </InputGroup>
      );
    } else return undefined;
  }, [googleMapsApiKey, googlePhotorealistic, t]);

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
    setGoogleMapsApiKey("");
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
          ...(googlePhotorealistic
            ? {
                serviceTokens: {
                  googleMapApiKey: googleMapsApiKey || undefined
                }
              }
            : {}),
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
            (!googleMapsApiKey && googlePhotorealistic)
          }
        />
      </SubmitWrapper>
    </Wrapper>
  );
};

export default ThreeDTiles;
