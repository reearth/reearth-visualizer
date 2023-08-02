import { styled } from "@reearth/services/theme";

type StoryBlock = {
  id: string;
  type: string;
};

type Props = {
  content?: string;
  block?: StoryBlock;
};

const StoryPage: React.FC<Props> = ({ content }) => {
  return (
    <Wrapper>
      <p>{content}</p>
      <p>{content}</p>
      <p>{content}</p>
      <p>{content}</p>
      <p>{content}</p>
      <p>{content}</p>
      <p>{content}</p>
    </Wrapper>
  );
};

export default StoryPage;

const Wrapper = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid grey;
`;
