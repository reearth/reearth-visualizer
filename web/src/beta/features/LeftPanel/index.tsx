import { styled } from "@reearth/services/theme";

const LeftPanel: React.FC = () => {
  return (
    <S.Wrapper>
      <S.SectionWrapper>
        <S.Container>
          <S.Title>Title1</S.Title>
          <S.Content>
            {[...Array(100)].map((_, i) => (
              <div key={i}>scrollable / {i}</div>
            ))}
          </S.Content>
        </S.Container>
      </S.SectionWrapper>
      <S.SectionWrapper maxHeight="20%">
        <S.Container>
          <S.Title>Title1</S.Title>
          <S.Content>
            <div>aaa</div>
            <div>aaa</div>
          </S.Content>
        </S.Container>
      </S.SectionWrapper>
    </S.Wrapper>
  );
};

export default LeftPanel;

const S = {
  Wrapper: styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 4px;
    gap: 4px;
  `,
  SectionWrapper: styled.div<{ maxHeight?: string }>`
    flex-grow: 1;
    max-height: ${props => props.maxHeight};
  `,
  Container: styled.div`
    background: #171618;
    height: 100%;
    display: flex;
    flex-direction: column;
  `,
  Title: styled.div`
    background: #3f3d45;
    padding: 8px;
    font-weight: 500;
    font-size: 12px;
    line-height: 1.34;
    border-top-right-radius: 4px;
    border-top-left-radius: 4px;
  `,
  Content: styled.div`
    padding: 8px;
    border-bottom-right-radius: 4px;
    border-bottom-left-radius: 4px;
    overflow-y: auto;
    flex-grow: 1;
    height: 0;
    ::-webkit-scrollbar {
      display: none;
    }
  `,
};
