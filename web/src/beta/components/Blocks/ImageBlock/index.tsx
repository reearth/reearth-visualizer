import Icon from "@reearth/beta/components/Icon";
import { styled } from "@reearth/services/theme";

type Props = {
  src: string;
  alt?: string;
};

const ImageBlock: React.FC<Props> = ({ src, alt }) => {
  return src ? (
    <Wrapper>
      <ImageBox src={src} alt={alt} />
    </Wrapper>
  ) : (
    <BlankImageBox>
      <Icon icon="image" color="#2e2e2e" size={32} />
    </BlankImageBox>
  );
};

const Wrapper = styled.div`
  width: inherit;
`;

const ImageBox = styled.img`
  display: flex;
  object-fit: cover;
  width: 100%;
`;

const BlankImageBox = styled.div`
  display: flex;
  aspect-ratio: 43/26;
  background: #f1f1f1;
  align-items: center;
  justify-content: center;
`;

export default ImageBlock;
