// import TabButton from "@reearth/app/components/TabButton";
// import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

export type Device = "desktop" | "mobile";

export type Devices = {
  [key in Device]: string | number;
};

export const devices: Devices = {
  desktop: "100%",
  mobile: 437
};

type Props = {
  selectedDevice?: Device;
  onDeviceChange: (device: Device) => void;
};

const Devices: FC<Props> = () => {
  // const t = useT();
  return (
    <DeviceWrapper>
      {/* <TabButton
        label={t("Desktop")}
        icon="desktop"
        selected={selectedDevice === "desktop"}
        onClick={() => onDeviceChange("desktop")}
      />
      <TabButton
        label={t("Mobile")}
        icon="mobile"
        selected={selectedDevice === "mobile"}
        onClick={() => onDeviceChange("mobile")}
      /> */}
    </DeviceWrapper>
  );
};

export default Devices;

const DeviceWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  flex: 1,
  gap: theme.spacing.micro
}));
