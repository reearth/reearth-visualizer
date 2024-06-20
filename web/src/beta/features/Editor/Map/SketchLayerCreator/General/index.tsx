import {
  ColJustifyBetween,
  AssetWrapper,
  InputGroup,
  Input,
  SubmitWrapper,
  SelectWrapper,
} from "@reearth/beta/features/Editor/utils";
import { useT } from "@reearth/services/i18n";

import { SketchProps } from "..";

const General: React.FC<SketchProps> = ({
  layerStyles,
  layerName,
  layerStyle,
  setLayerName,
  setLayerStyle = () => {},
}) => {
  const t = useT();
  const layerStyleOption = layerStyles ? layerStyles : [];

  return (
    <ColJustifyBetween>
      <AssetWrapper>
        <InputGroup label={t("Layer Name")} description={t("Layer name you want to add.")}>
          <Input
            type="text"
            placeholder={t("Input Text")}
            value={layerName}
            onChange={e => setLayerName?.(e.target.value)}
          />
        </InputGroup>

        <SelectWrapper
          value={layerStyle}
          name={t("Layer Style")}
          description={t("Layer style you want to add.")}
          options={layerStyleOption?.map(v => ({ key: v.id, label: v.name }))}
          attachToRoot
          onChange={setLayerStyle}
        />
      </AssetWrapper>

      <SubmitWrapper />
    </ColJustifyBetween>
  );
};

export default General;
