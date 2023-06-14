import { CSSProperties, FC, ImgHTMLAttributes } from "react";

import { styled } from "@reearth/services/theme";

type Props = {
  src: NonNullable<ImgHTMLAttributes<HTMLImageElement>["src"]>;
  align?: "left" | "center" | "right"; // default center
  fit?: "contain" | "cover"; // default cover
  maxHeight?: CSSProperties["maxHeight"];
  alt?: ImgHTMLAttributes<HTMLImageElement>["alt"];
  height?: CSSProperties["width"];
  width?: CSSProperties["height"];
};

const ImageBlock: FC<Props> = ({ src, align, fit, maxHeight, alt, width, height }) => {
  return (
    <Wrapper>
      <ImageBox
        src={src}
        fit={fit}
        alt={alt}
        maxHeight={maxHeight}
        width={width}
        height={height}
        align={align}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: absolute;
  display: flex;
`;

const ImageBox = styled.img<{
  fit?: "contain" | "cover";
  maxHeight?: CSSProperties["maxHeight"];
  align?: "left" | "center" | "right";
}>`
  display: flex;
  object-fit: ${props => (props.fit ? props.fit : "cover")};
  width: ${props => (props.width ? props.width : undefined)};
  height: ${props => (props.height ? props.height : "200px")};
  max-height: ${props => (props.maxHeight ? props.maxHeight : undefined)};
  object-position: ${props => (props.align ? props.align : "center")};
`;

export default ImageBlock;
