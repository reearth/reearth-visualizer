import Toggle from "@reearth/beta/components/Fields/Toggle";
import SecondaryNav from "@reearth/beta/features/Editor/SecondaryNav";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import Devices, { type Device } from "./Devices";

export { type Device } from "./Devices";

export { navbarHeight } from "@reearth/beta/features/Editor/SecondaryNav";

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
    <StyledSecondaryNav>
      <Devices selectedDevice={selectedDevice} onDeviceChange={onDeviceChange} />
      <AlignSystem>
        <Toggle
          label={t("Align System")}
          size="sm"
          checked={!!showWidgetEditor}
          onChange={onShowWidgetEditor}
        />
      </AlignSystem>
    </StyledSecondaryNav>
  );
};

export default Nav;

const StyledSecondaryNav = styled(SecondaryNav)`
  display: flex;
  align-items: center;
  padding-right: 8px;
  padding-left: 8px;
`;

const AlignSystem = styled.div``;
