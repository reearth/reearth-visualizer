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
      <SettingsWrapper className={"SETTINGS_BUTTONS_WRAPPER"}>
        <TestBox />
      </SettingsWrapper>
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
  top: 20px;
  display: flex;
  border: 0.5px solid ${props => props.theme.main.deepBg};
  &:hover {
    border: 0.5px solid ${props => props.theme.main.select};
    transition: border 0.5s ease;
  }
  &:hover .SETTINGS_BUTTONS_WRAPPER {
    opacity: 1;
    transition: opacity 0.5s ease;
  }
`;

const SettingsWrapper = styled.div`
  position: absolute;
  right: 0px;
  top: -20px;
  opacity: 0;
`;

const TestBox = styled.div`
  width: 97px;
  height: 20px;
  display: flex;
  background: #3b3cd0;
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
