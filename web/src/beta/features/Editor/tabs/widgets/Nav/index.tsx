import { useEffect } from "react";

import Text from "@reearth/beta/components/Text";
import Toggle from "@reearth/beta/components/Toggle";
import SecondaryNav from "@reearth/beta/features/Editor/SecondaryNav";
import { useT } from "@reearth/services/i18n";
import { useSelectedWidgetArea } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";

import Devices, { type Device } from "./Devices";

export { type Device } from "./Devices";

export { SECONDARY_NAVBAR_HEIGHT } from "@reearth/beta/features/Editor/SecondaryNav";

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
  const [, setSelectedWidgetArea] = useSelectedWidgetArea();

  useEffect(() => {
    if (!showWidgetEditor) {
      setSelectedWidgetArea(undefined);
    }
  }, [showWidgetEditor, setSelectedWidgetArea]);

  return (
    <StyledSecondaryNav>
      <Devices selectedDevice={selectedDevice} onDeviceChange={onDeviceChange} />
      <AlignSystem>
        <Text size="body">{t("Align System")}</Text>
        <Toggle checked={!!showWidgetEditor} onChange={onShowWidgetEditor} />
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

const AlignSystem = styled.div`
  display: flex;
  gap: 10px;
`;
