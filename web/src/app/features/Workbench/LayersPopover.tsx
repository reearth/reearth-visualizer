import { IconButton, Typography } from "@reearth/app/lib/reearth-ui";
import { EntryItem } from "@reearth/app/ui/components";
import type { Layer } from "@reearth/core";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC } from "react";

type Props = {
  layers: Layer[];
  onToggle: (layerId: string) => void;
  onFlyTo: (layerId: string) => void;
};

/** The map's layers: the crosshair flies to a visible layer, the eye shows or hides it. */
const LayersPopover: FC<Props> = ({ layers, onToggle, onFlyTo }) => {
  const t = useT();
  return (
    <List>
      {layers.map((layer) => (
        <EntryItem
          key={layer.id}
          title={
            <Title>
              <Typography size="body">{layer.title ?? layer.id}</Typography>
            </Title>
          }
          actions={[
            {
              comp: layer.visible && (
                <IconButton
                  key="zoom"
                  icon="crosshair"
                  size="small"
                  appearance="simple"
                  placement="left"
                  tooltipText={t("Fly to")}
                  ariaLabel={t("Fly to")}
                  onClick={() => onFlyTo(layer.id)}
                />
              ),
              keepVisible: true
            },
            {
              comp: (
                <IconButton
                  key="visible"
                  icon={layer.visible ? "eye" : "eyeSlash"}
                  size="small"
                  appearance="simple"
                  placement="left"
                  tooltipText={
                    layer.visible ? t("Hide layer") : t("Show layer")
                  }
                  ariaLabel={layer.visible ? t("Hide layer") : t("Show layer")}
                  stopPropagationOnClick
                  onClick={() => onToggle(layer.id)}
                />
              ),
              keepVisible: true
            }
          ]}
        />
      ))}
    </List>
  );
};

const List = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.micro,
  padding: `0 ${theme.spacing.small}px`
}));

const Title = styled("div")({ flex: 1, minWidth: 0 });

export default LayersPopover;
