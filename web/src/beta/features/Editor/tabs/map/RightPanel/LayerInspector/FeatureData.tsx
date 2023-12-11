import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";
import "react18-json-view/src/dark.css";

import Text from "@reearth/beta/components/Text";
import { Geometry } from "@reearth/beta/lib/core/engines";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

type Props = {
  selectedFeature?: {
    id: string;
    geometry: Geometry | undefined;
    properties: any;
  };
};

const FeatureData: React.FC<Props> = ({ selectedFeature }) => {
  const t = useT();

  return (
    <Wrapper>
      <Text size="body">{t("ID")}</Text>
      <ValueWrapper>
        <Text size="body" otherProperties={{ userSelect: "auto" }}>
          {selectedFeature?.id}
        </Text>
      </ValueWrapper>
      <Text size="body">{t("Geometry")}</Text>
      <ValueWrapper>
        <JsonView src={selectedFeature?.geometry} theme="a11y" dark />
      </ValueWrapper>
      <Text size="body">{t("Properties")}</Text>
      <ValueWrapper>
        <JsonView src={selectedFeature?.properties} theme="a11y" dark />
      </ValueWrapper>
    </Wrapper>
  );
};

export default FeatureData;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  word-break: break-all;
`;

const ValueWrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.outline.weak};
  border-radius: 4px;
  padding: 4px 8px;
`;
