import {
  InputGroup,
  SubmitWrapper,
  Wrapper,
  InputsWrapper,
  ContentWrapper
} from "@reearth/app/features/Editor/Map/shared/SharedComponent";
import {
  Button,
  Icon,
  RadioGroup,
  Selector,
  TextInput
} from "@reearth/app/lib/reearth-ui";
import { DataType } from "@reearth/core";
import { config } from "@reearth/services/config";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import { DataProps } from "..";
import { generateTitle } from "../util";

export type SourceType =
  | "url"
  | "osm-buildings"
  | "google-photorealistic"
  | "reearth-buildings";

export type GooglePhotorealisticProvider = "reearth" | "cesium-ion";

export type DataSourceOptType = {
  label: string;
  value: SourceType;
  children?: ReactNode;
}[];

export type ProviderOptType = {
  label: string;
  value: GooglePhotorealisticProvider;
}[];

const ThreeDTiles: FC<DataProps> = ({ sceneId, onSubmit, onClose }) => {
  const t = useT();
  const theme = useTheme();

  const isEE = useMemo(() => config()?.featureCollection === "ee", []);
  const defaultProvider: GooglePhotorealisticProvider = useMemo(
    () => (isEE ? "reearth" : "cesium-ion"),
    [isEE]
  );

  const [url, setUrl] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("reearth-buildings");
  const [googlePhotorealisticProvider, setGooglePhotorealisticProvider] =
    useState<GooglePhotorealisticProvider>(defaultProvider);

  // Update provider when isEE changes or when switching to google-photorealistic
  useEffect(() => {
    if (sourceType === "google-photorealistic" && !isEE) {
      setGooglePhotorealisticProvider("cesium-ion");
    }
  }, [sourceType, isEE]);

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
              value={url}
              onChange={(value) => setUrl(value)}
              data-testid="threedtiles-url-textinput"
            />
          </InputsWrapper>
        </InputGroup>
      );
    } else return undefined;
  }, [sourceType, t, url]);

  const CesiumIonWarning: ReactNode = useMemo(() => {
    return (
      <Warning data-testid="cesium-ion-warning">
        <IconWrapper
          icon="lightBulb"
          color={theme.warning.main}
          size="normal"
          data-testid="cesium-ion-warning-icon"
        />
        <TextWrapper data-testid="cesium-ion-warning-text">
          {t(
            "Please provide cesium ion access token on Main settings to use Cesium Ion."
          )}
        </TextWrapper>
      </Warning>
    );
  }, [t, theme]);

  const googlePhotorealisticProviderOptions: ProviderOptType = useMemo(() => {
    if (isEE) {
      return [
        {
          label: t("Re:Earth"),
          value: "reearth"
        },
        {
          label: t("Cesium Ion"),
          value: "cesium-ion"
        }
      ];
    }
    // Only Cesium Ion option when not EE
    return [
      {
        label: t("Cesium Ion"),
        value: "cesium-ion"
      }
    ];
  }, [isEE, t]);

  const renderGooglePhotorealisticProviderSelector: ReactNode = useMemo(() => {
    if (sourceType === "google-photorealistic") {
      return (
        <GooglePhotorealisticProviderSelectorWrapper data-testid="google-photorealistic-provider-selector-wrapper">
          <InputGroup
            label={t("Provider")}
            data-testid="google-photorealistic-provider-group"
          >
            <InputsWrapper data-testid="google-photorealistic-provider-inputs">
              <Selector
                value={googlePhotorealisticProvider}
                options={googlePhotorealisticProviderOptions}
                onChange={(value) =>
                  setGooglePhotorealisticProvider(
                    value as GooglePhotorealisticProvider
                  )
                }
                data-testid="google-photorealistic-provider-selector"
              />
            </InputsWrapper>
          </InputGroup>
          {googlePhotorealisticProvider === "cesium-ion" && CesiumIonWarning}
        </GooglePhotorealisticProviderSelectorWrapper>
      );
    }
    return undefined;
  }, [
    sourceType,
    googlePhotorealisticProvider,
    googlePhotorealisticProviderOptions,
    CesiumIonWarning,
    t
  ]);

  const cesiumIonWarningForOSMBuildings: ReactNode = useMemo(() => {
    if (sourceType === "osm-buildings") {
      return CesiumIonWarning;
    }
    return undefined;
  }, [sourceType, CesiumIonWarning]);

  const dataSourceOptions: DataSourceOptType = useMemo(
    () => [
      {
        label: t("Re:Earth Buildings"),
        value: "reearth-buildings"
      },
      {
        label: t("Cesium OSM 3D Tiles"),
        value: "osm-buildings",
        children: cesiumIonWarningForOSMBuildings
      },
      {
        label: t("Google Photorealistic 3D Tiles"),
        value: "google-photorealistic",
        children: renderGooglePhotorealisticProviderSelector
      },
      {
        label: t("URL"),
        value: "url",
        children: renderUrlInput
      }
    ],
    [
      renderUrlInput,
      renderGooglePhotorealisticProviderSelector,
      cesiumIonWarningForOSMBuildings,
      t
    ]
  );

  const handleDataSourceTypeChange = useCallback(
    (newValue: string) => {
      setSourceType(newValue as SourceType);
      setUrl("");
      // Reset provider to default when changing source type
      if (newValue === "google-photorealistic") {
        setGooglePhotorealisticProvider(defaultProvider);
      }
    },
    [defaultProvider]
  );

  const title = useMemo(() => {
    if (sourceType === "google-photorealistic") {
      return t("Google Photorealistic 3D Tiles");
    } else if (sourceType === "osm-buildings") {
      return t("Cesium OSM 3D Tiles");
    } else if (sourceType === "reearth-buildings") {
      return t("Re:Earth Buildings");
    } else {
      return generateTitle(url);
    }
  }, [sourceType, t, url]);

  const handleSubmit = () => {
    let dataType: DataType;

    if (sourceType === "osm-buildings") {
      dataType = "osm-buildings";
    } else if (sourceType === "google-photorealistic") {
      dataType = "google-photorealistic";
    } else if (sourceType === "reearth-buildings") {
      dataType = "reearth-buildings";
    } else {
      dataType = "3dtiles";
    }

    onSubmit({
      layerType: "simple",
      sceneId,
      title,
      visible: true,
      config: {
        data: {
          url: url !== "" ? url : undefined,
          type: dataType,
          ...(sourceType === "google-photorealistic"
            ? { provider: googlePhotorealisticProvider }
            : {})
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
          disabled={sourceType === "url" && !url}
          data-testid="threedtiles-submit-button"
        />
      </SubmitWrapper>
    </Wrapper>
  );
};

export default ThreeDTiles;

const Warning = styled("div")(({ theme }) => ({
  display: css.display.flex,
  gap: theme.spacing.small,
  alignItems: css.alignItems.center
}));

const TextWrapper = styled("div")(({ theme }) => ({
  color: theme.warning.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular
}));

const IconWrapper = styled(Icon)(() => ({
  flexGrow: 0,
  flexShrink: 0
}));

const GooglePhotorealisticProviderSelectorWrapper = styled("div")(
  ({ theme }) => ({
    display: css.display.flex,
    flexDirection: css.flexDirection.column,
    gap: theme.spacing.small
  })
);
