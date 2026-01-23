import { Modal } from "@reearth/app/lib/reearth-ui";
import { Credit } from "@reearth/app/utils/value";
import { Credits } from "@reearth/core";
import {
  BUILTIN_DATA_SOURCES,
  BuiltinDataSourceName
} from "@reearth/services/dataSource/builtin";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { useCallback, useEffect, useMemo, useState, type JSX } from "react";

import type { ComponentProps as WidgetProps } from "../..";

import { useDataAttribution } from "./hooks";
import { DataAttributionUI } from "./UI";

export type Props = WidgetProps;

const DataAttribution = ({
  theme,
  widget,
  context: { getCredits, nlsLayers } = {}
}: Props): JSX.Element | null => {
  const t = useT();
  const [visible, setVisible] = useState(false);
  const handleModalOpen = useCallback(() => setVisible(true), []);
  const handleModalClose = useCallback(() => setVisible(false), []);

  const [visualizerCredits, setVisualizerCredits] = useState<Credits>();

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    const credits = getCredits?.();
    if (credits) {
      setVisualizerCredits(credits);
    }
    intervalId = setInterval(() => {
      const credits = getCredits?.();
      if (credits) {
        setVisualizerCredits(credits);
      }
    }, 3000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [getCredits, visible]);

  const layerCredits: Credit[] = useMemo(() => {
    if (!nlsLayers) return [];

    const dataSourceNames = nlsLayers
      .map((l) => l.dataSourceName)
      .filter((name): name is BuiltinDataSourceName => name !== undefined);
    if (dataSourceNames.length === 0) return [];

    return Array.from(new Set(dataSourceNames))
      .map((name) => ({
        description: BUILTIN_DATA_SOURCES[name]?.label,
        logo: BUILTIN_DATA_SOURCES[name]?.icon,
        creditUrl: BUILTIN_DATA_SOURCES[name]?.url,
        disableLogoBackground: true
      }))
      .filter((c): c is NonNullable<typeof c> => !!c);
  }, [nlsLayers]);

  const { cesiumCredit, otherCredits, googleCredit } = useDataAttribution({
    credits: visualizerCredits,
    widget
  });

  const credits = useMemo(() => {
    return [...(otherCredits ?? []), ...layerCredits];
  }, [layerCredits, otherCredits]);

  return (
    <Wrapper>
      {cesiumCredit && (
        <CesiumLink
          target="_blank"
          href={cesiumCredit.creditUrl}
          rel="noreferrer"
        >
          <img src={cesiumCredit.logo} title={cesiumCredit.description} />
        </CesiumLink>
      )}
      {googleCredit && (
        <GoogleLink target="_blank" rel="noreferrer">
          <img src={googleCredit.logo} title={googleCredit.description} />
        </GoogleLink>
      )}
      <DataLink onClick={handleModalOpen}>{t("Data Attribution")}</DataLink>
      <Modal size="small" visible={visible}>
        <DataAttributionUI
          onClose={handleModalClose}
          theme={theme}
          credits={credits}
        />
      </Modal>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.small
}));

const DataLink = styled("div")(({ theme }) => ({
  cursor: "pointer",
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.bold,
  padding: theme.spacing.smallest,
  "&:hover": {
    color: theme.primary.strong
  }
}));

const CesiumLink = styled("a")(() => ({
  height: 33
}));

const GoogleLink = styled("a")(() => ({
  height: 18
}));

export default DataAttribution;
