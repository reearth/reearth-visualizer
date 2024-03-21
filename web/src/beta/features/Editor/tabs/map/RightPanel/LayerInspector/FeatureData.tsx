import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";
import "react18-json-view/src/dark.css";

import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
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
  isSketchLayer: boolean;
};

const FeatureData: React.FC<Props> = ({ selectedFeature, isSketchLayer }) => {
  const t = useT();

  return (
    <Wrapper>
      <Text size="body">{t("ID")}</Text>
      <ValueWrapper>
        <Text size="body" otherProperties={{ userSelect: "auto" }}>
          {selectedFeature?.id}
        </Text>
      </ValueWrapper>
      <StyledSidePanelSectionField title={t("Geometry")} border="1">
        <ValueWrapper>
          <JsonView src={selectedFeature?.geometry} theme="a11y" dark />
        </ValueWrapper>
      </StyledSidePanelSectionField>
      {isSketchLayer ? (
        <StyledSidePanelSectionField title={t("Custom Properties")} border="1">
          <ValueWrapper>
            <JsonView src={selectedFeature?.properties} theme="a11y" dark />
          </ValueWrapper>
        </StyledSidePanelSectionField>
      ) : (
        <StyledSidePanelSectionField title={t("Properties")} border="1">
          <ValueWrapper>
            <JsonView src={selectedFeature?.properties} theme="a11y" dark />
          </ValueWrapper>
        </StyledSidePanelSectionField>
      )}
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
`;

const StyledSidePanelSectionField = styled(SidePanelSectionField)`
  background: ${({ theme }) => theme.outline.weaker};
`;
