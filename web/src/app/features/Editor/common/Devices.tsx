import { RadioButton } from "@reearth/app/lib/reearth-ui";
import { DeviceType } from "@reearth/app/utils/device";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

export type Devices = {
  [key in DeviceType]: string | number;
};

type Props = {
  selectedDevice?: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
};

const Devices: FC<Props> = ({ selectedDevice, onDeviceChange }) => {
  const t = useT();

  const handleDeviceChange = (device: string) => {
    if (selectedDevice !== device) {
      onDeviceChange(device as DeviceType);
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
