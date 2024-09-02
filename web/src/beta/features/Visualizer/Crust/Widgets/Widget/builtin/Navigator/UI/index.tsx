import Icon from "@reearth/beta/components/Icon";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { memo } from "react";

import type { Theme } from "../../../types";

import { useNavigator } from "./hooks";

export { degreeToRadian, radianToDegree } from "./utils";

export type Props = {
  theme?: Theme;
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

const NavigatorUI: React.FC<Props> = memo(function NavigatorPresenterMemo({
  theme,
  degree,
  onRotate,
  onStartOrbit,
  onEndOrbit,
  onMoveOrbit,
  onRestoreRotate,
  onClickHelp,
  onZoomIn,
  onZoomOut
}) {
  const t = useT();

  const {
    compassRef,
    compassDegree,
    compassFocusDegree,
    isMovingAngle,
    handleOnMouseDownAngle,
    handleOnMouseDownCompass
  } = useNavigator({ degree, onRotate, onStartOrbit, onEndOrbit, onMoveOrbit });

  return (
    <Container>
      <CompassContainer>
        <Compass ref={compassRef}>
          <CompassIcon
            onMouseDown={handleOnMouseDownCompass}
            publishedTheme={theme}
          >
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
                transform: `rotate(${compassFocusDegree}deg)`
              }}
              data-testid="compassFocus"
            >
              <Icon icon="compassFocus" color={theme?.select} size={30} />
            </CompassFocusIcon>
          )}
          <AngleIcon
            onMouseDown={handleOnMouseDownAngle}
            publishedTheme={theme}
          >
            <Icon
              icon="navigatorAngle"
              aria-label={t("aria-label-adjust-angle")}
              size={32}
            />
          </AngleIcon>
        </Compass>
        {onClickHelp && <Help onClick={onClickHelp}>?</Help>}
      </CompassContainer>
      <Tool publishedTheme={theme}>
        <ToolIconButton onClick={onZoomIn} publishedTheme={theme}>
          <Icon icon="plus" aria-label={t("aria-label-zoom-in")} size={16} />
        </ToolIconButton>
        <ToolIconButton onClick={onRestoreRotate} publishedTheme={theme}>
          <Icon
            icon="house"
            aria-label={t("aria-label-Go-to-the-home-position")}
            size={16}
          />
        </ToolIconButton>
        <ToolIconButton onClick={onZoomOut} publishedTheme={theme}>
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
`;

const CompassIcon = styled.div<{ publishedTheme?: Theme }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 64px;
  height: 64px;
  color: ${({ theme, publishedTheme }) =>
    publishedTheme?.mainText || theme.content.main};
  & path {
    fill: ${({ theme, publishedTheme }) =>
      publishedTheme?.mainText || theme.content.main};
  }
  & circle {
    stroke: ${({ theme, publishedTheme }) =>
      publishedTheme?.background || theme.content.withBackground};
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

const AngleIcon = styled.div<{ publishedTheme?: Theme }>`
  & circle {
    fill: ${({ theme, publishedTheme }) =>
      publishedTheme?.background || theme.bg[0]};
  }
  & g {
    stroke: ${({ theme, publishedTheme }) =>
      publishedTheme?.mainText || theme.content.main};
  }
  display: inline-block;
  height: 32px;
  width: 32px;
`;

const Tool = styled.div<{ publishedTheme?: Theme }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${({ theme, publishedTheme }) =>
    publishedTheme?.background || theme.bg[0]};
  border-radius: 16px;
  margin-top: 8px;
`;

const ToolIconButton = styled.button<{ publishedTheme?: Theme }>`
  color: ${({ theme, publishedTheme }) =>
    publishedTheme?.mainText || theme.content.main};
  height: 32px;
  width: 32px;
  display: grid;
  place-items: center;
`;

export default NavigatorUI;
