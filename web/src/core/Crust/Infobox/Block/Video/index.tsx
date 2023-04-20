import React, { useCallback, useEffect, useRef, useState } from "react";
import Player from "react-player";

import Icon from "@reearth/components/atoms/Icon";
import { styled } from "@reearth/theme";

import { CommonProps as BlockProps } from "..";
import { Border, Title } from "../utils";

export type Props = BlockProps<Property>;

export type Property = {
  url?: string;
  title?: string;
  fullSize?: boolean;
};

const VideoBlock: React.FC<Props> = ({
  block,
  infoboxProperty,
  isSelected,
  isEditable,
  onClick,
}) => {
  const { url: videoUrl, fullSize, title } = block?.property ?? {};
  const { size: infoboxSize } = infoboxProperty ?? {};
  const isTemplate = !videoUrl && !title;

  const ref = useRef<Player>(null);

  useEffect(() => {
    // detect click event on video iframe
    const cb = () => {
      const player = ref.current?.getInternalPlayer() as any;
      if (!player) return;
      const internal = player.getIframe?.() as HTMLIFrameElement | undefined;
      if (document.activeElement == internal) {
        onClick?.();
      }
    };
    window.addEventListener("blur", cb);
    return () => window.removeEventListener("blur", cb);
  }, [onClick, isSelected]);

  const [isHovered, setHovered] = useState(false);
  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      onClick?.();
    },
    [onClick],
  );

  return (
    <Wrapper
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      isEditable={isEditable}
      isSelected={isSelected}
      isHovered={isHovered}
      fullSize={fullSize}
      infoboxSize={infoboxSize}>
      {title && <Title infoboxProperty={infoboxProperty}>{title}</Title>}
      {isTemplate && isEditable ? (
        <Template infoboxSize={infoboxSize}>
          <StyledIcon icon="video" isHovered={isHovered} isSelected={isSelected} size={24} />
        </Template>
      ) : (
        <Player
          ref={ref}
          url={videoUrl}
          width="100%"
          height={infoboxSize === "large" ? (title ? "326px" : "340px") : title ? "185px" : "200px"}
          playsinline
          pip
          controls
          preload
          isHovered={isHovered}
          isSelected={isSelected}
        />
      )}
    </Wrapper>
  );
};

const Wrapper = styled(Border)<{
  fullSize?: boolean;
  infoboxSize?: string;
}>`
  margin: ${({ fullSize }) => (fullSize ? "0" : "0 8px")};
  height: ${props => (props.infoboxSize === "large" ? "340px" : "200px")};
`;

const Template = styled.div<{ infoboxSize?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${props => (props.infoboxSize === "large" ? "340px" : "200px")};
  border-radius: 3px;
`;

const StyledIcon = styled(Icon)<{ isSelected?: boolean; isHovered?: boolean }>`
  color: ${props =>
    props.isHovered
      ? props.theme.infoBox.border
      : props.isSelected
      ? props.theme.infoBox.accent2
      : props.theme.infoBox.weakText};
`;

export default VideoBlock;
