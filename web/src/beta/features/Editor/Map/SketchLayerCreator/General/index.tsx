import { FC } from "react";

import { Selector, TextInput } from "@reearth/beta/lib/reearth-ui";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n";

import { ContentWrapper, InputGroup, InputsWrapper, Wrapper } from "../../SharedComponent";

export interface Props {
  layerName?: string;
  layerStyle?: string;
  layerStyles?: LayerStyle[];
  onLayerNameChange?: (value?: string) => void;
  onLayerStyleChange?: (value?: string | string[]) => void;
}
const General: FC<Props> = ({
  layerStyles,
  layerName,
  layerStyle,
  onLayerNameChange,
  onLayerStyleChange,
}) => {
  const t = useT();
  const layerStyleOption = layerStyles ? layerStyles : [];

  return (
    <Wrapper>
      <ContentWrapper>
        <InputGroup label={t("Layer Name")}>
          <InputsWrapper>
            <TextInput placeholder={t(" Text")} value={layerName} onChange={onLayerNameChange} />
          </InputsWrapper>
        </InputGroup>

        <InputGroup label={t("Layer Style")}>
          <Selector
            value={layerStyle}
            options={layerStyleOption?.map(v => ({ label: v.name, value: v.id }))}
            onChange={onLayerStyleChange}
          />
        </InputGroup>
      </ContentWrapper>
    </Wrapper>
  );
};

export default General;
