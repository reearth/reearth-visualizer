import { memo } from "react";

import Icon from "@reearth/components/atoms/Icon";
import { useT } from "@reearth/i18n";
import { PublishTheme, styled } from "@reearth/theme";

import { SceneMode } from "../../../Engine/ref";

import { useNavigator } from "./hooks";

export type Props = {
  sceneMode?: SceneMode;
  publishedTheme?: PublishTheme;
  degree: number;
  /**
   * Pass degree of circle as callback arguments.
   * This event is invoked when mouse down on outer circle and mouse move.
   * When mouse up, this event is stopped.
   */
  onRotate?: (degree: number) => void;
  /**
   * Pass distance of movement as x,y axis(px) and degree of circle as callback arguments.
   * This event is invoked when inner mouse down on circle button and mouse move.
   * When mouse up, this event is stopped.
   */
  onMoveOrbit?: (degree: number) => void;
  onStartOrbit?: () => void;
  onEndOrbit?: () => void;
  /**
   * This event is invoked when center of circle is clicked.
   */
  onRestoreRotate?: () => void;
  /**
   * Pass + or -  as callback arguments.
   */
  onClickHelp?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
};

const NavigatorPresenter: React.FC<Props> = memo(function NavigatorPresenterMemo({
  publishedTheme,
  degree,
  onRotate,
  onStartOrbit,
  onEndOrbit,
  onMoveOrbit,
  onRestoreRotate,
  onClickHelp,
  onZoomIn,
  onZoomOut,
}) {
  const t = useT();

  const {
    compassRef,
    compassDegree,
    compassFocusDegree,
    isMovingAngle,
    handleOnMouseDownAngle,
    handleOnMouseDownCompass,
  } = useNavigator({ degree, onRotate, onStartOrbit, onEndOrbit, onMoveOrbit });

  return (
    <Container>
      <CompassContainer>
        <Compass ref={compassRef}>
          <CompassIcon onMouseDown={handleOnMouseDownCompass} publishedTheme={publishedTheme}>
            <Icon
              icon="compass"
              aria-label={t("aria-label-compass")}
              size={64}
              style={{ transform: `rotate(${compassDegree}deg)` }}
            />
          </CompassIcon>
          {isMovingAngle && (
            <CompassFocusIcon
              style={{
                transform: `rotate(${compassFocusDegree}deg)`,
              }}
              data-testId="compassFocus">
              <Icon icon="compassFocus" color={publishedTheme?.select} alt="" size={30} />
            </CompassFocusIcon>
          )}
          <AngleIcon onMouseDown={handleOnMouseDownAngle} publishedTheme={publishedTheme}>
            <Icon icon="navigatorAngle" aria-label={t("aria-label-adjust-angle")} size={32} />
          </AngleIcon>
        </Compass>
        {onClickHelp && <Help onClick={onClickHelp}>?</Help>}
      </CompassContainer>
      <Tool publishedTheme={publishedTheme}>
        <ToolIconButton onClick={onZoomIn} publishedTheme={publishedTheme}>
          <Icon icon="plus" aria-label={t("aria-label-zoom-in")} size={16} />
        </ToolIconButton>
        <ToolIconButton onClick={onRestoreRotate} publishedTheme={publishedTheme}>
          <Icon icon="house" aria-label={t("aria-label-Go-to-the-home-position")} size={16} />
        </ToolIconButton>
        <ToolIconButton onClick={onZoomOut} publishedTheme={publishedTheme}>
          <Icon icon="minus" aria-label={t("aria-label-zoom-out")} size={16} />
        </ToolIconButton>
      </Tool>
    </Container>
  );
});

const Container = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
`;

const CompassContainer = styled.div`
  position: relative;
  display: inline-grid;
  place-items: center;
`;

const Help = styled.button`
  position: absolute;
  height: 32px;
  width: 32px;
  border-radius: 16px 0 0 16px;
  left: -28px;
  background: #4a4a4a;
  color: #fff;
  user-select: none;
`;

const Compass = styled.div`
  position: relative;
  display: inline-grid;
  place-items: center;
  width: 64px;
  height: 64px;
  cursor: pointer;
  z-index: 1;
`;

const CompassIcon = styled.div<{ publishedTheme?: PublishTheme }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 64px;
  height: 64px;
  color: ${({ theme, publishedTheme }) => publishedTheme?.mainText || theme.main.text};
  & path {
    fill: ${({ theme, publishedTheme }) => publishedTheme?.mainText || theme.main.text};
  }
  & circle {
    stroke: ${({ theme, publishedTheme }) => publishedTheme?.background || theme.main.deepBg};
  }
`;

const CompassFocusIcon = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0.8;
  width: 64px;
  height: 64px;
`;

const AngleIcon = styled.div<{ publishedTheme?: PublishTheme }>`
  & circle {
    fill: ${({ theme, publishedTheme }) => publishedTheme?.background || theme.main.deepBg};
  }
  & g {
    stroke: ${({ theme, publishedTheme }) => publishedTheme?.mainText || theme.main.text};
  }
  display: inline-block;
  height: 32px;
  width: 32px;
  z-index: 1;
`;

const Tool = styled.div<{ publishedTheme?: PublishTheme }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${({ theme, publishedTheme }) => publishedTheme?.background || theme.main.deepBg};
  border-radius: 16px;
  margin-top: 8px;
`;

const ToolIconButton = styled.button<{ publishedTheme?: PublishTheme }>`
  color: ${({ theme, publishedTheme }) => publishedTheme?.mainText || theme.main.text};
  height: 32px;
  width: 32px;
  display: grid;
  place-items: center;
`;

export default NavigatorPresenter;
