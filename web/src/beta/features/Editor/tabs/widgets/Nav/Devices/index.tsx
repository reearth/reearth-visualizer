import { styled } from "@reearth/services/theme";

import { NavIcon } from "../NavIcon";

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

const Devices: React.FC<Props> = ({ selectedDevice, onDeviceChange }) => (
  <DeviceWrapper>
    {(Object.keys(devices) as Device[]).map((d, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === Object.keys(devices).length - 1;

      return (
        <>
          <DeviceIcon
            key={d + idx}
            icon={d}
            toggled={selectedDevice == d}
            isFirst={isFirst}
            isLast={isLast}
            onClick={() => onDeviceChange(d)}
          />
          {!isLast && <Separator />}
        </>
      );
    })}
  </DeviceWrapper>
);

export default Devices;

const DeviceWrapper = styled.div`
  display: flex;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.general.border};
`;

const DeviceIcon = styled(NavIcon)<{ isFirst?: boolean; isLast?: boolean }>`
  border-radius: ${({ isFirst, isLast }) => (isFirst ? "3px 0 0 3px" : isLast ? "0 3px 3px 0" : 0)};
`;

const Separator = styled.div`
  border-right: 1px solid ${({ theme }) => theme.general.border};
`;
