import Icon from "@reearth/beta/components/Icon";
import { styled } from "@reearth/services/theme";

import { Layout } from "../../../types";
import VisualizerNav from "../../../VisualizerNav";

export const navbarHeight = "64px";

type Device = "desktop" | "mobile";

type DeviceObject = {
  type: Device;
  width: string | number;
};

const devices: DeviceObject[] = [
  { type: "desktop", width: "100%" },
  { type: "mobile", width: 437 },
];

type Props = {
  showWidgetEditor?: boolean;
  layout?: Layout;
  onShowWidgetEditor: () => void;
  onLayoutChange: (layout: Layout) => void;
};

const Nav: React.FC<Props> = ({
  showWidgetEditor,
  layout = "desktop",
  onShowWidgetEditor,
  onLayoutChange,
}) => {
  return (
    <StyledVisualizerNav>
      <WidgetSystemIcon
        toggled={showWidgetEditor}
        icon="widgetSystem"
        onClick={onShowWidgetEditor}
      />
      <DeviceWrapper>
        {devices.map((d, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === devices.length - 1;

          return (
            <>
              <DeviceIcon
                key={d.type + idx}
                icon={d.type}
                toggled={layout === d.type}
                isFirst={isFirst}
                isLast={isLast}
                onClick={() => onLayoutChange(d.type)}
              />
              {!isLast && <Separator />}
            </>
          );
        })}
      </DeviceWrapper>
    </StyledVisualizerNav>
  );
};

export default Nav;

const StyledVisualizerNav = styled(VisualizerNav)`
  background: ${({ theme }) => theme.general.bg.main};
  display: flex;
  align-items: center;
  gap: 24px;
  padding-right: 8px;
  padding-left: 8px;
  height: ${navbarHeight};
`;

const StyledIcon = styled(Icon)<{ toggled?: boolean }>`
  padding: 12px;
  border-radius: 4px;
  ${({ theme, toggled }) =>
    toggled
      ? `
  color: ${theme.general.content.strong};
  background: ${theme.general.select}80;
  `
      : `color: ${theme.general.content.weak};`}

  :hover {
    color: ${({ theme }) => theme.general.content.strong};
    background: ${({ theme }) => theme.general.select}80;
    cursor: pointer;
  }
`;

const WidgetSystemIcon = styled(StyledIcon)`
  border: 1px solid ${({ theme }) => theme.general.border};
`;

const DeviceWrapper = styled.div`
  display: flex;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.general.border};
`;

const DeviceIcon = styled(StyledIcon)<{ isFirst?: boolean; isLast?: boolean }>`
  border-radius: ${({ isFirst, isLast }) => (isFirst ? "3px 0 0 3px" : isLast ? "0 3px 3px 0" : 0)};
`;

const Separator = styled.div`
  border-right: 1px solid ${({ theme }) => theme.general.border};
`;
