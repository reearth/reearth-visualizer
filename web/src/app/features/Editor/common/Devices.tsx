import { RadioButton } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

export type Device = "desktop" | "mobile";

export type Devices = {
  [key in Device]: string | number;
};

type Props = {
  selectedDevice?: Device;
  onDeviceChange: (device: Device) => void;
};

const Devices: FC<Props> = ({ selectedDevice, onDeviceChange }) => {
  const t = useT();

  const handleDeviceChange = (device: string) => {
    if (selectedDevice !== device) {
      onDeviceChange(device as Device);
    }
  };

  return (
    <DeviceWrapper>
      <RadioButton
        items={[
          { id: "desktop", label: t("Desktop"), icon: "desktop" },
          { id: "mobile", label: t("Mobile"), icon: "mobile" }
        ]}
        value={selectedDevice}
        onChange={handleDeviceChange}
      />
    </DeviceWrapper>
  );
};

export default Devices;

const DeviceWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  gap: theme.spacing.micro
}));
