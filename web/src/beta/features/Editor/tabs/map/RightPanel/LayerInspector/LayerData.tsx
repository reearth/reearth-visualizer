import Text from "@reearth/beta/components/Text";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

type Props = {
  selectedLayer: NLSLayer;
};

const LayerData: React.FC<Props> = ({ selectedLayer }) => {
  const t = useT();
  return (
    <Wrapper>
      <Text size="body">{t("Format")}</Text>
      <ValueWrapper>
        <StyledText size="body" otherProperties={{ userSelect: "auto" }}>
          {selectedLayer.config?.data?.type}
        </StyledText>
      </ValueWrapper>
      {!!selectedLayer.config?.data?.url && (
        <>
          <Text size="body">{t("Resource URL")}</Text>
          <ValueWrapper>
            <StyledText size="body" otherProperties={{ userSelect: "auto" }}>
              {selectedLayer.config?.data?.url}
            </StyledText>
          </ValueWrapper>
        </>
      )}
    </Wrapper>
  );
};

export default LayerData;

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

const StyledText = styled(Text)`
  word-break: break-all;
`;
