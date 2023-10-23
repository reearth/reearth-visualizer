import Text from "@reearth/beta/components/Text";
import { Feature } from "@reearth/beta/lib/core/engines";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

type Props = {
  selectedFeature: Feature;
};

const FeatureData: React.FC<Props> = ({ selectedFeature }) => {
  const t = useT();
  console.log("SELECTED FEATURE: ", selectedFeature);

  return (
    <Wrapper>
      <Text size="body">{t("Geometry")}</Text>
      <ValueWrapper>{/* <Text size="body">{selectedFeature.geometry}</Text> */}</ValueWrapper>
      <Text size="body">{t("Properties")}</Text>
      <ValueWrapper>{/* <Text size="body">{selectedFeature.properties}</Text> */}</ValueWrapper>
    </Wrapper>
  );
};

export default FeatureData;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ValueWrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.outline.weak};
  border-radius: 4px;
  padding: 4px 8px;
`;
