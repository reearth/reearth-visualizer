import { styled } from "@reearth/services/theme";

import VisualizerNav from "../../../VisualizerNav";

import Devices, { type Device } from "./Devices";
import { NavIcon } from "./NavIcon";

export { type Device } from "./Devices";

export const navbarHeight = "64px";

type Props = {
  showWidgetEditor?: boolean;
  selectedDevice?: Device;
  onShowWidgetEditor: () => void;
  onDeviceChange: (device: Device) => void;
};

const Nav: React.FC<Props> = ({
  showWidgetEditor,
  selectedDevice = "desktop",
  onShowWidgetEditor,
  onDeviceChange,
}) => {
  return (
    <StyledVisualizerNav>
      <WidgetSystemIcon
        toggled={showWidgetEditor}
        icon="widgetSystem"
        onClick={onShowWidgetEditor}
      />
      <Devices selectedDevice={selectedDevice} onDeviceChange={onDeviceChange} />
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

const WidgetSystemIcon = styled(NavIcon)`
  border: 1px solid ${({ theme }) => theme.general.border};
`;
