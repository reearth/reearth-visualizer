import { useCallback, useState } from "react";

import { LatLng } from "@reearth/beta/utils/value";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import Property from "..";
import NumberInput from "../common/NumberInput";

type Props = {
  name?: string;
  description?: string;
  value?: LatLng;
  onChange?: (location: LatLng) => void;
};

const LocationField: React.FC<Props> = ({ name, description, value, onChange }) => {
  const t = useT();
  const [location, setLocation] = useState<LatLng>(value || { lat: 0, lng: 0 });

  const handleChange = useCallback(
    (coordination: string, newValue: number | undefined) => {
      if (newValue === undefined) return;

      setLocation(prevLocation => ({
        ...prevLocation,
        [coordination === "Latitude" ? "lat" : "lng"]: newValue,
      }));
      onChange?.(location);
    },
    [location, onChange],
  );

  return (
    <Property name={name} description={description}>
      <Wrapper>
        <NumberInput
          value={location.lat}
          inputDescription={t("Latitude")}
          onChange={newValue => handleChange("Latitude", newValue)}
        />
        <NumberInput
          value={location.lng}
          inputDescription={t("Longitude")}
          onChange={newValue => handleChange("Longitude", newValue)}
        />
      </Wrapper>
    </Property>
  );
};

export default LocationField;

const Wrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 4px;
`;
