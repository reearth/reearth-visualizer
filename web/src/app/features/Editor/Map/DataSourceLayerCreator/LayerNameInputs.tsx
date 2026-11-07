import {
  InputGroup,
  LayerNameList,
  LayerNameListWrapper,
  LayerWrapper
} from "@reearth/app/features/Editor/Map/shared/SharedComponent";
import { Button, TextInput } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC } from "react";

import { useLayerNames } from "./useLayerNames";

type Props = ReturnType<typeof useLayerNames>["inputProps"];

const LayerNameInputs: FC<Props> = ({
  layerNameList,
  layerName,
  isLayerName,
  onLayerNameChange,
  onBlur,
  onAddClick,
  onDelete
}) => {
  const t = useT();
  const theme = useTheme();

  return (
    <InputGroup
      label={t("Choose layer to add")}
      data-testid="vectortiles-layer-group"
    >
      <Wrapper>
        <LayerNameListWrapper data-testid="vectortiles-layer-list-wrapper">
          <LayerNameList data-testid="vectortiles-layer-list">
            {layerNameList.map((layer: string, index: number) => (
              <LayerWrapper
                key={layer}
                data-testid={`vectortiles-layer-item-${index}`}
              >
                <TextInput
                  value={`${layer}`}
                  extendWidth
                  data-testid={`vectortiles-layer-textinput-${index}`}
                />
                <Button
                  icon="close"
                  iconButton
                  appearance="simple"
                  size="small"
                  iconColor={theme.content.main}
                  ariaLabel={t("Delete layer name")}
                  onClick={() => onDelete(index)}
                  data-testid={`vectortiles-layer-delete-button-${index}`}
                />
              </LayerWrapper>
            ))}
            {(!layerNameList.length || isLayerName) && (
              <LayerWrapper data-testid="vectortiles-layer-input-wrapper">
                <TextInput
                  placeholder={t("layer name")}
                  value={layerName}
                  extendWidth
                  onBlur={onBlur}
                  onChange={onLayerNameChange}
                  data-testid="vectortiles-layer-input"
                />
                <Button
                  icon="close"
                  iconButton
                  iconColor={theme.content.weak}
                  size="small"
                  appearance="simple"
                  disabled
                  data-testid="vectortiles-layer-input-disabled-button"
                />
              </LayerWrapper>
            )}
          </LayerNameList>
        </LayerNameListWrapper>
        <Button
          icon="plus"
          title={t("Layer name")}
          size="small"
          onClick={onAddClick}
          data-testid="vectortiles-layer-add-button"
        />
      </Wrapper>
    </InputGroup>
  );
};

export default LayerNameInputs;

const Wrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  width: "100%",
  flexDirection: css.flexDirection.column,
  alignItems: css.alignItems.flexStart,
  gap: theme.spacing.normal
}));
