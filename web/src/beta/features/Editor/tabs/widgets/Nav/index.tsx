import Toggle from "@reearth/beta/components/properties/Toggle";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import VisualizerNav from "../../../VisualizerNav";

import Devices, { type Device } from "./Devices";

export { type Device } from "./Devices";

export const navbarHeight = "52px";

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
  const t = useT();
  return (
    <StyledVisualizerNav>
      <Devices selectedDevice={selectedDevice} onDeviceChange={onDeviceChange} />
      <AlignSystem>
        <Toggle
          label={t("Align System")}
          size="sm"
          checked={!!showWidgetEditor}
          onChange={onShowWidgetEditor}
        />
      </AlignSystem>
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

const AlignSystem = styled.div``;
