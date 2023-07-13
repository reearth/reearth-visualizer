import Icon from "@reearth/beta/components/Icon";
import TabButton from "@reearth/beta/components/TabButton";
import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

export type Device = "desktop" | "mobile";

export type Devices = {
  [key in Device]: string | number;
};

export const devices: Devices = {
  desktop: "100%",
  mobile: 437,
};

type Props = {
  selectedDevice?: Device;
  onDeviceChange: (device: Device) => void;
};

const DeviceLabel: React.FC<{ text: string; icon: string }> = ({ text, icon }) => (
  <LabelWrapper>
    <Icon icon={icon} size={20} />
    <Text size="body" customColor>
      {text}
    </Text>
  </LabelWrapper>
);

const Devices: React.FC<Props> = ({ selectedDevice, onDeviceChange }) => {
  const t = useT();
  return (
    <DeviceWrapper>
      <TabButton
        label={<DeviceLabel text={t("Desktop")} icon="desktop" />}
        selected={selectedDevice === "desktop"}
        onClick={() => onDeviceChange("desktop")}
      />
      <TabButton
        label={<DeviceLabel text={t("Mobile")} icon="mobile" />}
        selected={selectedDevice === "mobile"}
        onClick={() => onDeviceChange("mobile")}
      />
    </DeviceWrapper>
  );
};

export default Devices;

const DeviceWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 2px;
  flex: 1;
`;

const LabelWrapper = styled.div`
  display: flex;
  gap: 8px;
`;
