import { useCallback, useEffect, useState } from "react";

import { LatLng } from "@reearth/beta/utils/value";
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
  const [location, setLocation] = useState<LatLng>(value || { lat: 0, lng: 0 });

  useEffect(() => {
    if (value) setLocation(value);
  }, [value]);

  const handleChange = useCallback((coordination: string, newValue: number | undefined) => {
    if (newValue === undefined) return;

    setLocation(prevLocation => ({
      ...prevLocation,
      [coordination === "Latitude" ? "lat" : "lng"]: newValue,
    }));
  }, []);

  useEffect(() => {
    if (location) onChange?.(location);
  }, [location, onChange]);

  return (
    <Property name={name} description={description}>
      <Wrapper>
        <NumberInput
          value={location.lat}
          inputDescription="Latitude"
          onChange={newValue => handleChange("Latitude", newValue)}
        />
        <NumberInput
          value={location.lng}
          inputDescription="Longtitude"
          onChange={newValue => handleChange("Longtitude", newValue)}
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
