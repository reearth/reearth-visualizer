import Text from "@reearth/beta/components/Text";
import { styled } from "@reearth/services/theme";

const ListItem: React.FC<{ index?: number; keyValue?: string; value?: string }> = ({
  index,
  keyValue,
  value,
}) => {
  return (
    <PropertyWrapper key={index} isEven={isEven(index ?? 0)}>
      <TextWrapper>
        <StyledText size="body" customColor otherProperties={{ userSelect: "auto" }}>
          {keyValue}
        </StyledText>
      </TextWrapper>
      <TextWrapper>
        <StyledText size="body" customColor otherProperties={{ userSelect: "auto" }}>
          {value}
        </StyledText>
      </TextWrapper>
    </PropertyWrapper>
  );
};

export default ListItem;

const PropertyWrapper = styled.div<{ isEven?: boolean }>`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  background: ${({ isEven }) => isEven && "#F4F4F4"};
  padding: 8px 16px;
  box-sizing: border-box;
  word-break: break-word;
  width: 100%;
`;

const TextWrapper = styled.div`
  flex: 1;
`;

const StyledText = styled(Text)`
  color: ${({ theme }) => theme.content.weaker};
`;

function isEven(number: number) {
  return !!(number % 2 === 0);
}
