import { Tabs } from "@reearth/app/lib/reearth-ui";
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
  return (
    <DeviceWrapper>
      <Tabs
        tabs={[
          {
            id: "desktop",
            name: t("Desktop"),
            icon: "desktop"
          },
          {
            id: "mobile",
            name: t("Mobile"),
            icon: "mobile"
          }
        ]}
        currentTab={selectedDevice}
        onChange={(tabId) => {
          if (tabId === "desktop") onDeviceChange("desktop");
          else if (tabId === "mobile") onDeviceChange("mobile");
        }}
      />
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
