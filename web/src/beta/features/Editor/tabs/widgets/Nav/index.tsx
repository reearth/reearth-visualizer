import Toggle from "@reearth/beta/components/properties/Toggle";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import SecondaryNav from "../../../SecondaryNav";

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
  background: ${({ theme }) => theme.general.bg.strong};
  display: flex;
  align-items: center;
  gap: 24px;
  padding-right: 8px;
  padding-left: 8px;
  height: ${navbarHeight};
`;

const AlignSystem = styled.div``;
